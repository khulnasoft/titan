use titan_tasks::Vc;
use titanpack_core::{chunk::ChunkItem, output::OutputAsset};

#[titan_tasks::value_trait]
pub trait CssEmbed: ChunkItem {
    fn embedded_asset(self: Vc<Self>) -> Vc<Box<dyn OutputAsset>>;
}
