use titan_tasks::Vc;
use titan_tasks_fs::{embed_directory, FileContent, FileSystem, FileSystemPath};

#[titan_tasks::function]
fn embed_fs() -> Vc<Box<dyn FileSystem>> {
    embed_directory!("titanpack-cli", "$CARGO_MANIFEST_DIR/js/src")
}

#[titan_tasks::function]
pub(crate) fn embed_file(path: String) -> Vc<FileContent> {
    embed_fs().root().join(path).read()
}

#[titan_tasks::function]
pub(crate) fn embed_file_path(path: String) -> Vc<FileSystemPath> {
    embed_fs().root().join(path)
}
