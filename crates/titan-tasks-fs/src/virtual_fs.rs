use anyhow::{bail, Result};
use titan_tasks::{Completion, ValueDefault, ValueToString, Vc};

use super::{DirectoryContent, FileContent, FileMeta, FileSystem, FileSystemPath, LinkContent};

#[titan_tasks::value]
pub struct VirtualFileSystem;

impl VirtualFileSystem {
    /// Creates a new [`Vc<VirtualFileSystem>`].
    ///
    /// NOTE: This function is not a `titan_tasks::function` to avoid instances
    /// being equivalent identity-wise. This ensures that a
    /// [`Vc<FileSystemPath>`] created from this [`Vc<VirtualFileSystem>`]
    /// will never be equivalent, nor be interoperable, with a
    /// [`Vc<FileSystemPath>`] created from another
    /// [`Vc<VirtualFileSystem>`].
    pub fn new() -> Vc<Self> {
        Self::cell(VirtualFileSystem)
    }
}

impl ValueDefault for VirtualFileSystem {
    fn value_default() -> Vc<Self> {
        Self::new()
    }
}

#[titan_tasks::value_impl]
impl FileSystem for VirtualFileSystem {
    #[titan_tasks::function]
    fn read(&self, _fs_path: Vc<FileSystemPath>) -> Result<Vc<FileContent>> {
        bail!("Reading is not possible on the virtual file system")
    }

    #[titan_tasks::function]
    fn read_link(&self, _fs_path: Vc<FileSystemPath>) -> Result<Vc<LinkContent>> {
        bail!("Reading is not possible on the virtual file system")
    }

    #[titan_tasks::function]
    fn read_dir(&self, _fs_path: Vc<FileSystemPath>) -> Result<Vc<DirectoryContent>> {
        bail!("Reading is not possible on the virtual file system")
    }

    #[titan_tasks::function]
    fn track(&self, _fs_path: Vc<FileSystemPath>) -> Result<Vc<Completion>> {
        bail!("Tracking is not possible on the virtual file system")
    }

    #[titan_tasks::function]
    fn write(
        &self,
        _fs_path: Vc<FileSystemPath>,
        _content: Vc<FileContent>,
    ) -> Result<Vc<Completion>> {
        bail!("Writing is not possible on the virtual file system")
    }

    #[titan_tasks::function]
    fn write_link(
        &self,
        _fs_path: Vc<FileSystemPath>,
        _target: Vc<LinkContent>,
    ) -> Result<Vc<Completion>> {
        bail!("Writing is not possible on the virtual file system")
    }

    #[titan_tasks::function]
    fn metadata(&self, _fs_path: Vc<FileSystemPath>) -> Result<Vc<FileMeta>> {
        bail!("Reading is not possible on the virtual file system")
    }
}

#[titan_tasks::value_impl]
impl ValueToString for VirtualFileSystem {
    #[titan_tasks::function]
    fn to_string(&self) -> Vc<String> {
        Vc::cell("virtual file system".to_string())
    }
}
