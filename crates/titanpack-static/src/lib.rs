//! Static asset support for titanpack.
//!
//! Static assets are copied directly to the output folder.
//!
//! When imported from ES modules, they produce a thin module that simply
//! exports the asset's path.
//!
//! When referred to from CSS assets, the reference is replaced with the asset's
//! path.

#![feature(min_specialization)]
#![feature(arbitrary_self_types)]

pub mod fixed;
pub mod output_asset;

use anyhow::{Context, Result};
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
use titanpack_css::embed::CssEmbed;
use titanpack_ecmascript::{
    chunk::{
        EcmascriptChunkItem, EcmascriptChunkItemContent, EcmascriptChunkPlaceable,
        EcmascriptChunkType, EcmascriptChunkingContext, EcmascriptExports,
    },
    utils::StringifyJs,
};

use self::output_asset::StaticAsset;

#[titan_tasks::function]
fn modifier() -> Vc<String> {
    Vc::cell("static".to_string())
}

#[titan_tasks::value]
#[derive(Clone)]
pub struct StaticModuleAsset {
    pub source: Vc<Box<dyn Source>>,
    pub asset_context: Vc<Box<dyn AssetContext>>,
}

#[titan_tasks::value_impl]
impl StaticModuleAsset {
    #[titan_tasks::function]
    pub fn new(source: Vc<Box<dyn Source>>, asset_context: Vc<Box<dyn AssetContext>>) -> Vc<Self> {
        Self::cell(StaticModuleAsset {
            source,
            asset_context,
        })
    }

    #[titan_tasks::function]
    async fn static_asset(
        self: Vc<Self>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Result<Vc<StaticAsset>> {
        Ok(StaticAsset::new(chunking_context, self.await?.source))
    }
}

#[titan_tasks::value_impl]
impl Module for StaticModuleAsset {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.source
            .ident()
            .with_modifier(modifier())
            .with_layer(self.asset_context.layer())
    }
}

#[titan_tasks::value_impl]
impl Asset for StaticModuleAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}

#[titan_tasks::value_impl]
impl ChunkableModule for StaticModuleAsset {
    #[titan_tasks::function]
    async fn as_chunk_item(
        self: Vc<Self>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Result<Vc<Box<dyn titanpack_core::chunk::ChunkItem>>> {
        let chunking_context =
            Vc::try_resolve_downcast::<Box<dyn EcmascriptChunkingContext>>(chunking_context)
                .await?
                .context(
                    "chunking context must impl EcmascriptChunkingContext to use StaticModuleAsset",
                )?;
        Ok(Vc::upcast(ModuleChunkItem::cell(ModuleChunkItem {
            module: self,
            chunking_context,
            static_asset: self.static_asset(Vc::upcast(chunking_context)),
        })))
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkPlaceable for StaticModuleAsset {
    #[titan_tasks::function]
    fn get_exports(&self) -> Vc<EcmascriptExports> {
        EcmascriptExports::Value.into()
    }
}

#[titan_tasks::value]
struct ModuleChunkItem {
    module: Vc<StaticModuleAsset>,
    chunking_context: Vc<Box<dyn EcmascriptChunkingContext>>,
    static_asset: Vc<StaticAsset>,
}

#[titan_tasks::value_impl]
impl ChunkItem for ModuleChunkItem {
    #[titan_tasks::function]
    fn asset_ident(&self) -> Vc<AssetIdent> {
        self.module.ident()
    }

    #[titan_tasks::function]
    async fn references(&self) -> Result<Vc<ModuleReferences>> {
        Ok(Vc::cell(vec![Vc::upcast(SingleOutputAssetReference::new(
            Vc::upcast(self.static_asset),
            Vc::cell(format!(
                "static(url) {}",
                self.static_asset.ident().to_string().await?
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
impl EcmascriptChunkItem for ModuleChunkItem {
    #[titan_tasks::function]
    fn chunking_context(&self) -> Vc<Box<dyn EcmascriptChunkingContext>> {
        self.chunking_context
    }

    #[titan_tasks::function]
    async fn content(&self) -> Result<Vc<EcmascriptChunkItemContent>> {
        Ok(EcmascriptChunkItemContent {
            inner_code: format!(
                "__titanpack_export_value__({path});",
                path = StringifyJs(
                    &self
                        .chunking_context
                        .asset_url(self.static_asset.ident())
                        .await?
                )
            )
            .into(),
            ..Default::default()
        }
        .into())
    }
}

#[titan_tasks::value_impl]
impl CssEmbed for ModuleChunkItem {
    #[titan_tasks::function]
    fn embedded_asset(&self) -> Vc<Box<dyn OutputAsset>> {
        Vc::upcast(self.static_asset)
    }
}

pub fn register() {
    titan_tasks::register();
    titan_tasks_fs::register();
    titanpack_core::register();
    titanpack_ecmascript::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
