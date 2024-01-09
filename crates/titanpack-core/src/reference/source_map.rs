use anyhow::Result;
use titan_tasks::{ValueToString, Vc};
use titan_tasks_fs::{FileSystemEntryType, FileSystemPath};

use super::ModuleReference;
use crate::{
    file_source::FileSource,
    raw_module::RawModule,
    resolve::ModuleResolveResult,
    source_map::{GenerateSourceMap, OptionSourceMap, SourceMap},
};

#[titan_tasks::value]
pub struct SourceMapReference {
    from: Vc<FileSystemPath>,
    file: Vc<FileSystemPath>,
}

#[titan_tasks::value_impl]
impl SourceMapReference {
    #[titan_tasks::function]
    pub fn new(from: Vc<FileSystemPath>, file: Vc<FileSystemPath>) -> Vc<Self> {
        Self::cell(SourceMapReference { from, file })
    }
}

impl SourceMapReference {
    async fn get_file(&self) -> Option<Vc<FileSystemPath>> {
        let file_type = self.file.get_type().await;
        if let Ok(file_type_result) = file_type.as_ref() {
            if let FileSystemEntryType::File = &**file_type_result {
                return Some(self.file);
            }
        }
        None
    }
}

#[titan_tasks::value_impl]
impl ModuleReference for SourceMapReference {
    #[titan_tasks::function]
    async fn resolve_reference(&self) -> Vc<ModuleResolveResult> {
        if let Some(file) = self.get_file().await {
            return ModuleResolveResult::module(Vc::upcast(RawModule::new(Vc::upcast(
                FileSource::new(file),
            ))))
            .cell();
        }
        ModuleResolveResult::unresolveable().into()
    }
}

#[titan_tasks::value_impl]
impl GenerateSourceMap for SourceMapReference {
    #[titan_tasks::function]
    async fn generate_source_map(&self) -> Result<Vc<OptionSourceMap>> {
        let Some(file) = self.get_file().await else {
            return Ok(Vc::cell(None));
        };
        let source_map = SourceMap::new_from_file(file).await?;
        Ok(Vc::cell(source_map.map(|m| m.cell())))
    }
}

#[titan_tasks::value_impl]
impl ValueToString for SourceMapReference {
    #[titan_tasks::function]
    async fn to_string(&self) -> Result<Vc<String>> {
        Ok(Vc::cell(format!(
            "source map file is referenced by {}",
            self.from.to_string().await?
        )))
    }
}
