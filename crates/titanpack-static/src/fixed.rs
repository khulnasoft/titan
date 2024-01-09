use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_fs::FileSystemPath;
use titanpack_core::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    output::OutputAsset,
    source::Source,
};

/// A static asset that is served at a fixed output path. It won't use
/// content hashing to generate a long term cacheable URL.
#[titan_tasks::value]
pub struct FixedStaticAsset {
    output_path: Vc<FileSystemPath>,
    source: Vc<Box<dyn Source>>,
}

#[titan_tasks::value_impl]
impl FixedStaticAsset {
    #[titan_tasks::function]
    pub fn new(output_path: Vc<FileSystemPath>, source: Vc<Box<dyn Source>>) -> Vc<Self> {
        FixedStaticAsset {
            output_path,
            source,
        }
        .cell()
    }
}

#[titan_tasks::value_impl]
impl OutputAsset for FixedStaticAsset {
    #[titan_tasks::function]
    async fn ident(&self) -> Result<Vc<AssetIdent>> {
        Ok(AssetIdent::from_path(self.output_path))
    }
}

#[titan_tasks::value_impl]
impl Asset for FixedStaticAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}
