use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_fs::File;
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::Chunk,
    ident::AssetIdent,
    output::OutputAsset,
    source_map::{GenerateSourceMap, SourceMap},
};

use super::chunk::SingleItemCssChunk;

/// Represents the source map of a single item CSS chunk.
#[titan_tasks::value]
pub struct SingleItemCssChunkSourceMapAsset {
    chunk: Vc<SingleItemCssChunk>,
}

#[titan_tasks::value_impl]
impl SingleItemCssChunkSourceMapAsset {
    #[titan_tasks::function]
    pub fn new(chunk: Vc<SingleItemCssChunk>) -> Vc<Self> {
        SingleItemCssChunkSourceMapAsset { chunk }.cell()
    }
}

#[titan_tasks::value_impl]
impl OutputAsset for SingleItemCssChunkSourceMapAsset {
    #[titan_tasks::function]
    async fn ident(&self) -> Result<Vc<AssetIdent>> {
        Ok(AssetIdent::from_path(
            self.chunk.path().append(".map".to_string()),
        ))
    }
}

#[titan_tasks::value_impl]
impl Asset for SingleItemCssChunkSourceMapAsset {
    #[titan_tasks::function]
    async fn content(&self) -> Result<Vc<AssetContent>> {
        let sm = if let Some(sm) = *self.chunk.generate_source_map().await? {
            sm
        } else {
            SourceMap::empty()
        };
        let sm = sm.to_rope().await?;
        Ok(AssetContent::file(File::from(sm).into()))
    }
}
