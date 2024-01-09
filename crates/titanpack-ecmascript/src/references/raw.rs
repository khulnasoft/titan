use anyhow::Result;
use titan_tasks::{ValueToString, Vc};
use titanpack_core::{
    reference::ModuleReference,
    resolve::{pattern::Pattern, resolve_raw, ModuleResolveResult},
    source::Source,
};

#[titan_tasks::value]
#[derive(Hash, Debug)]
pub struct FileSourceReference {
    pub source: Vc<Box<dyn Source>>,
    pub path: Vc<Pattern>,
}

#[titan_tasks::value_impl]
impl FileSourceReference {
    #[titan_tasks::function]
    pub fn new(source: Vc<Box<dyn Source>>, path: Vc<Pattern>) -> Vc<Self> {
        Self::cell(FileSourceReference { source, path })
    }
}

#[titan_tasks::value_impl]
impl ModuleReference for FileSourceReference {
    #[titan_tasks::function]
    fn resolve_reference(&self) -> Vc<ModuleResolveResult> {
        let context_dir = self.source.ident().path().parent();

        resolve_raw(context_dir, self.path, false).as_raw_module_result()
    }
}

#[titan_tasks::value_impl]
impl ValueToString for FileSourceReference {
    #[titan_tasks::function]
    async fn to_string(&self) -> Result<Vc<String>> {
        Ok(Vc::cell(format!(
            "raw asset {}",
            self.path.to_string().await?,
        )))
    }
}
