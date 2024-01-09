use anyhow::{bail, Context, Result};
use titan_tasks::{ValueToString, Vc};
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::{ChunkItem, ChunkType, ChunkableModule, ChunkingContext},
    context::AssetContext,
    ident::AssetIdent,
    module::Module,
    output::OutputAsset,
    reference::{ModuleReferences, SingleOutputAssetReference},
    source::Source,
};
use titanpack_ecmascript::{
    chunk::{
        EcmascriptChunkItem, EcmascriptChunkItemContent, EcmascriptChunkPlaceable,
        EcmascriptChunkType, EcmascriptChunkingContext, EcmascriptExports,
    },
    utils::StringifyJs,
};

use crate::{output_asset::WebAssemblyAsset, source::WebAssemblySource};

#[titan_tasks::function]
fn modifier() -> Vc<String> {
    Vc::cell("wasm raw".to_string())
}

/// Exports the relative path to the WebAssembly file without loading it.
#[titan_tasks::value]
#[derive(Clone)]
pub struct RawWebAssemblyModuleAsset {
    source: Vc<WebAssemblySource>,
    asset_context: Vc<Box<dyn AssetContext>>,
}

#[titan_tasks::value_impl]
impl RawWebAssemblyModuleAsset {
    #[titan_tasks::function]
    pub fn new(
        source: Vc<WebAssemblySource>,
        asset_context: Vc<Box<dyn AssetContext>>,
    ) -> Vc<Self> {
        Self::cell(RawWebAssemblyModuleAsset {
            source,
            asset_context,
        })
    }

    #[titan_tasks::function]
    fn wasm_asset(&self, chunking_context: Vc<Box<dyn ChunkingContext>>) -> Vc<WebAssemblyAsset> {
        WebAssemblyAsset::new(self.source, chunking_context)
    }
}

#[titan_tasks::value_impl]
impl Module for RawWebAssemblyModuleAsset {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.source
            .ident()
            .with_modifier(modifier())
            .with_layer(self.asset_context.layer())
    }
}

#[titan_tasks::value_impl]
impl Asset for RawWebAssemblyModuleAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}

#[titan_tasks::value_impl]
impl ChunkableModule for RawWebAssemblyModuleAsset {
    #[titan_tasks::function]
    async fn as_chunk_item(
        self: Vc<Self>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Result<Vc<Box<dyn titanpack_core::chunk::ChunkItem>>> {
        let chunking_context =
            Vc::try_resolve_downcast::<Box<dyn EcmascriptChunkingContext>>(chunking_context)
                .await?
                .context(
                    "chunking context must impl EcmascriptChunkingContext to use \
                     RawWebAssemblyModuleAsset",
                )?;
        Ok(Vc::upcast(
            RawModuleChunkItem {
                module: self,
                chunking_context,
                wasm_asset: self.wasm_asset(Vc::upcast(chunking_context)),
            }
            .cell(),
        ))
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkPlaceable for RawWebAssemblyModuleAsset {
    #[titan_tasks::function]
    fn get_exports(self: Vc<Self>) -> Vc<EcmascriptExports> {
        EcmascriptExports::Value.cell()
    }
}

#[titan_tasks::value]
struct RawModuleChunkItem {
    module: Vc<RawWebAssemblyModuleAsset>,
    chunking_context: Vc<Box<dyn EcmascriptChunkingContext>>,
    wasm_asset: Vc<WebAssemblyAsset>,
}

#[titan_tasks::value_impl]
impl ChunkItem for RawModuleChunkItem {
    #[titan_tasks::function]
    fn asset_ident(&self) -> Vc<AssetIdent> {
        self.module.ident()
    }

    #[titan_tasks::function]
    async fn references(&self) -> Result<Vc<ModuleReferences>> {
        Ok(Vc::cell(vec![Vc::upcast(SingleOutputAssetReference::new(
            Vc::upcast(self.wasm_asset),
            Vc::cell(format!(
                "wasm(url) {}",
                self.wasm_asset.ident().to_string().await?
            )),
        ))]))
    }

    #[titan_tasks::function]
    async fn chunking_context(&self) -> Vc<Box<dyn ChunkingContext>> {
        Vc::upcast(self.chunking_context)
    }

    #[titan_tasks::function]
    async fn ty(&self) -> Result<Vc<Box<dyn ChunkType>>> {
        Ok(Vc::upcast(
            Vc::<EcmascriptChunkType>::default().resolve().await?,
        ))
    }

    #[titan_tasks::function]
    fn module(&self) -> Vc<Box<dyn Module>> {
        Vc::upcast(self.module)
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkItem for RawModuleChunkItem {
    #[titan_tasks::function]
    fn chunking_context(&self) -> Vc<Box<dyn EcmascriptChunkingContext>> {
        self.chunking_context
    }

    #[titan_tasks::function]
    async fn content(&self) -> Result<Vc<EcmascriptChunkItemContent>> {
        let path = self.wasm_asset.ident().path().await?;
        let output_root = self.chunking_context.output_root().await?;

        let Some(path) = output_root.get_path_to(&path) else {
            bail!("WASM asset ident is not relative to output root");
        };

        Ok(EcmascriptChunkItemContent {
            inner_code: format!(
                "__titanpack_export_value__({path});",
                path = StringifyJs(path)
            )
            .into(),
            ..Default::default()
        }
        .into())
    }
}
