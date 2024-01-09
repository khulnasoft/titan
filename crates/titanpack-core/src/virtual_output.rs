use titan_tasks::Vc;
use titan_tasks_fs::FileSystemPath;

use crate::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    output::OutputAsset,
};

/// An [OutputAsset] that is created from some passed source code.
#[titan_tasks::value]
pub struct VirtualOutputAsset {
    pub path: Vc<FileSystemPath>,
    pub content: Vc<AssetContent>,
}

#[titan_tasks::value_impl]
impl VirtualOutputAsset {
    #[titan_tasks::function]
    pub fn new(path: Vc<FileSystemPath>, content: Vc<AssetContent>) -> Vc<Self> {
        VirtualOutputAsset { path, content }.cell()
    }
}

#[titan_tasks::value_impl]
impl OutputAsset for VirtualOutputAsset {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        AssetIdent::from_path(self.path)
    }
}

#[titan_tasks::value_impl]
impl Asset for VirtualOutputAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.content
    }
}
