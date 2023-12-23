use anyhow::{bail, Context, Result};
use indexmap::indexmap;
use titan_tasks::{Value, Vc};
use titan_tasks_fs::FileSystemPath;
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::{AsyncModuleInfo, ChunkItem, ChunkType, ChunkableModule, ChunkingContext},
    context::AssetContext,
    ident::AssetIdent,
    module::{Module, OptionModule},
    reference::ModuleReferences,
    reference_type::ReferenceType,
    resolve::{origin::ResolveOrigin, parse::Request},
    source::Source,
};
use titanpack_ecmascript::{
    chunk::{
        EcmascriptChunkItem, EcmascriptChunkItemContent, EcmascriptChunkItemOptions,
        EcmascriptChunkPlaceable, EcmascriptChunkType, EcmascriptChunkingContext,
        EcmascriptExports,
    },
    references::async_module::OptionAsyncModule,
    EcmascriptModuleAsset,
};

use crate::{
    loader::{compiling_loader_source, instantiating_loader_source},
    output_asset::WebAssemblyAsset,
    raw::RawWebAssemblyModuleAsset,
    source::WebAssemblySource,
};

#[titan_tasks::function]
fn modifier() -> Vc<String> {
    Vc::cell("wasm module".to_string())
}

/// Creates a javascript loader which instantiates the WebAssembly source and
/// re-exports its exports.
#[titan_tasks::value]
#[derive(Clone)]
pub struct WebAssemblyModuleAsset {
    source: Vc<WebAssemblySource>,
    asset_context: Vc<Box<dyn AssetContext>>,
}

#[titan_tasks::value_impl]
impl WebAssemblyModuleAsset {
    #[titan_tasks::function]
    pub fn new(
        source: Vc<WebAssemblySource>,
        asset_context: Vc<Box<dyn AssetContext>>,
    ) -> Vc<Self> {
        Self::cell(WebAssemblyModuleAsset {
            source,
            asset_context,
        })
    }

    #[titan_tasks::function]
    fn wasm_asset(&self, chunking_context: Vc<Box<dyn ChunkingContext>>) -> Vc<WebAssemblyAsset> {
        WebAssemblyAsset::new(self.source, chunking_context)
    }

    #[titan_tasks::function]
    async fn loader(&self) -> Result<Vc<EcmascriptModuleAsset>> {
        let query = &*self.source.ident().query().await?;

        let loader_source = if query == "?module" {
            compiling_loader_source(self.source)
        } else {
            instantiating_loader_source(self.source)
        };

        let module = self.asset_context.process(
            loader_source,
            Value::new(ReferenceType::Internal(Vc::cell(indexmap! {
                "WASM_PATH".to_string() => Vc::upcast(RawWebAssemblyModuleAsset::new(self.source, self.asset_context)),
            }))),
        ).module();

        let Some(esm_asset) =
            Vc::try_resolve_downcast_type::<EcmascriptModuleAsset>(module).await?
        else {
            bail!("WASM loader was not processed into an EcmascriptModuleAsset");
        };

        Ok(esm_asset)
    }
}

#[titan_tasks::value_impl]
impl Module for WebAssemblyModuleAsset {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.source
            .ident()
            .with_modifier(modifier())
            .with_layer(self.asset_context.layer())
    }

    #[titan_tasks::function]
    async fn references(self: Vc<Self>) -> Vc<ModuleReferences> {
        self.loader().references()
    }
}

#[titan_tasks::value_impl]
impl Asset for WebAssemblyModuleAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}

#[titan_tasks::value_impl]
impl ChunkableModule for WebAssemblyModuleAsset {
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
                     WebAssemblyModuleAsset",
                )?;
        Ok(Vc::upcast(
            ModuleChunkItem {
                module: self,
                chunking_context,
            }
            .cell(),
        ))
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkPlaceable for WebAssemblyModuleAsset {
    #[titan_tasks::function]
    fn get_exports(self: Vc<Self>) -> Vc<EcmascriptExports> {
        self.loader().get_exports()
    }

    #[titan_tasks::function]
    fn get_async_module(self: Vc<Self>) -> Vc<OptionAsyncModule> {
        self.loader().get_async_module()
    }
}

#[titan_tasks::value_impl]
impl ResolveOrigin for WebAssemblyModuleAsset {
    #[titan_tasks::function]
    fn origin_path(&self) -> Vc<FileSystemPath> {
        self.source.ident().path()
    }

    #[titan_tasks::function]
    fn asset_context(&self) -> Vc<Box<dyn AssetContext>> {
        self.asset_context
    }

    #[titan_tasks::function]
    fn get_inner_asset(self: Vc<Self>, request: Vc<Request>) -> Vc<OptionModule> {
        self.loader().get_inner_asset(request)
    }
}

#[titan_tasks::value]
struct ModuleChunkItem {
    module: Vc<WebAssemblyModuleAsset>,
    chunking_context: Vc<Box<dyn EcmascriptChunkingContext>>,
}

#[titan_tasks::value_impl]
impl ChunkItem for ModuleChunkItem {
    #[titan_tasks::function]
    fn asset_ident(&self) -> Vc<AssetIdent> {
        self.module.ident()
    }

    #[titan_tasks::function]
    async fn references(&self) -> Result<Vc<ModuleReferences>> {
        let loader = self
            .module
            .loader()
            .as_chunk_item(Vc::upcast(self.chunking_context));

        Ok(loader.references())
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

    #[titan_tasks::function]
    fn is_self_async(self: Vc<Self>) -> Vc<bool> {
        Vc::cell(true)
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkItem for ModuleChunkItem {
    #[titan_tasks::function]
    fn chunking_context(&self) -> Vc<Box<dyn EcmascriptChunkingContext>> {
        self.chunking_context
    }

    #[titan_tasks::function]
    fn content(self: Vc<Self>) -> Vc<EcmascriptChunkItemContent> {
        panic!("content() should not be called");
    }

    #[titan_tasks::function]
    async fn content_with_async_module_info(
        &self,
        async_module_info: Option<Vc<AsyncModuleInfo>>,
    ) -> Result<Vc<EcmascriptChunkItemContent>> {
        let loader_asset = self.module.loader();
        let item = loader_asset.as_chunk_item(Vc::upcast(self.chunking_context));

        let ecmascript_item = Vc::try_resolve_downcast::<Box<dyn EcmascriptChunkItem>>(item)
            .await?
            .context("EcmascriptModuleAsset must implement EcmascriptChunkItem")?;

        let chunk_item_content = ecmascript_item
            .content_with_async_module_info(async_module_info)
            .await?;

        Ok(EcmascriptChunkItemContent {
            options: EcmascriptChunkItemOptions {
                wasm: true,
                ..chunk_item_content.options.clone()
            },
            ..chunk_item_content.clone_value()
        }
        .into())
    }
}
