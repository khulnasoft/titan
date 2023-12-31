use titan_tasks::Vc;
use titan_tasks_fs::{embed_directory, FileContent, FileSystem, FileSystemPath};
use titanpack_core::{code_builder::Code, context::AssetContext};
use titanpack_ecmascript::StaticEcmascriptCode;

#[titan_tasks::function]
pub fn embed_fs() -> Vc<Box<dyn FileSystem>> {
    embed_directory!("titanpack", "$CARGO_MANIFEST_DIR/js/src")
}

#[titan_tasks::function]
pub fn embed_file(path: String) -> Vc<FileContent> {
    embed_fs().root().join(path).read()
}

#[titan_tasks::function]
pub fn embed_file_path(path: String) -> Vc<FileSystemPath> {
    embed_fs().root().join(path)
}

#[titan_tasks::function]
pub fn embed_static_code(asset_context: Vc<Box<dyn AssetContext>>, path: String) -> Vc<Code> {
    StaticEcmascriptCode::new(asset_context, embed_file_path(path)).code()
}
