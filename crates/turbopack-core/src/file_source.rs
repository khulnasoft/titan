use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_fs::{FileContent, FileSystemEntryType, FileSystemPath, LinkContent};

use crate::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    source::Source,
};

/// The raw [Source]. It represents raw content from a path without any
/// references to other [Source]s.
#[titan_tasks::value]
pub struct FileSource {
    pub path: Vc<FileSystemPath>,
    pub query: Vc<String>,
}

#[titan_tasks::value_impl]
impl FileSource {
    #[titan_tasks::function]
    pub fn new(path: Vc<FileSystemPath>) -> Vc<Self> {
        Self::cell(FileSource {
            path,
            query: Vc::<String>::default(),
        })
    }

    #[titan_tasks::function]
    pub fn new_with_query(path: Vc<FileSystemPath>, query: Vc<String>) -> Vc<Self> {
        Self::cell(FileSource { path, query })
    }
}

#[titan_tasks::value_impl]
impl Source for FileSource {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        AssetIdent::from_path(self.path).with_query(self.query)
    }
}

#[titan_tasks::value_impl]
impl Asset for FileSource {
    #[titan_tasks::function]
    async fn content(&self) -> Result<Vc<AssetContent>> {
        let file_type = &*self.path.get_type().await?;
        match file_type {
            FileSystemEntryType::Symlink => match &*self.path.read_link().await? {
                LinkContent::Link { target, link_type } => Ok(AssetContent::Redirect {
                    target: target.clone(),
                    link_type: *link_type,
                }
                .cell()),
                _ => Err(anyhow::anyhow!("Invalid symlink")),
            },
            FileSystemEntryType::File => Ok(AssetContent::File(self.path.read()).cell()),
            FileSystemEntryType::NotFound => {
                Ok(AssetContent::File(FileContent::NotFound.cell()).cell())
            }
            _ => Err(anyhow::anyhow!("Invalid file type {:?}", file_type)),
        }
    }
}
