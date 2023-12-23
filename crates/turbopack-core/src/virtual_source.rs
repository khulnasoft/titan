use titan_tasks::Vc;
use titan_tasks_fs::FileSystemPath;

use crate::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    source::Source,
};

/// A [Source] that is created from some passed source code.
#[titan_tasks::value]
pub struct VirtualSource {
    pub ident: Vc<AssetIdent>,
    pub content: Vc<AssetContent>,
}

#[titan_tasks::value_impl]
impl VirtualSource {
    #[titan_tasks::function]
    pub fn new(path: Vc<FileSystemPath>, content: Vc<AssetContent>) -> Vc<Self> {
        Self::cell(VirtualSource {
            ident: AssetIdent::from_path(path),
            content,
        })
    }

    #[titan_tasks::function]
    pub fn new_with_ident(ident: Vc<AssetIdent>, content: Vc<AssetContent>) -> Vc<Self> {
        Self::cell(VirtualSource { ident, content })
    }
}

#[titan_tasks::value_impl]
impl Source for VirtualSource {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.ident
    }
}

#[titan_tasks::value_impl]
impl Asset for VirtualSource {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.content
    }
}
