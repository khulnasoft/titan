use anyhow::{anyhow, Result};
use titan_tasks::Vc;
use titan_tasks_fs::FileContent;
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::ChunkingContext,
    ident::AssetIdent,
    output::OutputAsset,
    source::Source,
};
#[titan_tasks::value]
pub struct StaticAsset {
    chunking_context: Vc<Box<dyn ChunkingContext>>,
    source: Vc<Box<dyn Source>>,
}

#[titan_tasks::value_impl]
impl StaticAsset {
    #[titan_tasks::function]
    pub fn new(
        chunking_context: Vc<Box<dyn ChunkingContext>>,
        source: Vc<Box<dyn Source>>,
    ) -> Vc<Self> {
        Self::cell(StaticAsset {
            chunking_context,
            source,
        })
    }
}

#[titan_tasks::value_impl]
impl OutputAsset for StaticAsset {
    #[titan_tasks::function]
    async fn ident(&self) -> Result<Vc<AssetIdent>> {
        let content = self.source.content();
        let content_hash = if let AssetContent::File(file) = &*content.await? {
            if let FileContent::Content(file) = &*file.await? {
                titan_tasks_hash::hash_xxh3_hash64(file.content())
            } else {
                return Err(anyhow!("StaticAsset::path: not found"));
            }
        } else {
            return Err(anyhow!("StaticAsset::path: unsupported file content"));
        };
        let content_hash_b16 = titan_tasks_hash::encode_hex(content_hash);
        let asset_path = self
            .chunking_context
            .asset_path(content_hash_b16, self.source.ident());
        Ok(AssetIdent::from_path(asset_path))
    }
}

#[titan_tasks::value_impl]
impl Asset for StaticAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}
