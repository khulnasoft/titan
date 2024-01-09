use anyhow::Result;
use titan_tasks::Vc;
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::ChunkingContext,
    ident::AssetIdent,
    output::OutputAsset,
    source::Source,
};

use crate::source::WebAssemblySource;

#[titan_tasks::function]
fn modifier() -> Vc<String> {
    Vc::cell("wasm".to_string())
}

/// Emits the [WebAssemblySource] at a chunk path determined by the
/// [ChunkingContext].
#[titan_tasks::value]
pub(crate) struct WebAssemblyAsset {
    source: Vc<WebAssemblySource>,
    chunking_context: Vc<Box<dyn ChunkingContext>>,
}

#[titan_tasks::value_impl]
impl WebAssemblyAsset {
    #[titan_tasks::function]
    pub(crate) fn new(
        source: Vc<WebAssemblySource>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Vc<Self> {
        Self::cell(WebAssemblyAsset {
            source,
            chunking_context,
        })
    }
}

#[titan_tasks::value_impl]
impl OutputAsset for WebAssemblyAsset {
    #[titan_tasks::function]
    async fn ident(&self) -> Result<Vc<AssetIdent>> {
        let ident = self.source.ident().with_modifier(modifier());

        let asset_path = self.chunking_context.chunk_path(ident, ".wasm".to_string());

        Ok(AssetIdent::from_path(asset_path))
    }
}

#[titan_tasks::value_impl]
impl Asset for WebAssemblyAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}
