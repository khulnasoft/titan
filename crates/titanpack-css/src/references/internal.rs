use anyhow::Result;
use titan_tasks::{ValueToString, Vc};
use titanpack_core::{
    chunk::ChunkableModuleReference, module::Module, reference::ModuleReference,
    resolve::ModuleResolveResult,
};

/// A reference to an internal CSS asset.
#[titan_tasks::value]
#[derive(Hash, Debug)]
pub struct InternalCssAssetReference {
    module: Vc<Box<dyn Module>>,
}

#[titan_tasks::value_impl]
impl InternalCssAssetReference {
    /// Creates a new [`Vc<InternalCssAssetReference>`].
    #[titan_tasks::function]
    pub fn new(module: Vc<Box<dyn Module>>) -> Vc<Self> {
        Self::cell(InternalCssAssetReference { module })
    }
}

#[titan_tasks::value_impl]
impl ModuleReference for InternalCssAssetReference {
    #[titan_tasks::function]
    fn resolve_reference(&self) -> Vc<ModuleResolveResult> {
        ModuleResolveResult::module(self.module).cell()
    }
}

#[titan_tasks::value_impl]
impl ValueToString for InternalCssAssetReference {
    #[titan_tasks::function]
    async fn to_string(&self) -> Result<Vc<String>> {
        Ok(Vc::cell(format!(
            "internal css {}",
            self.module.ident().to_string().await?
        )))
    }
}

#[titan_tasks::value_impl]
impl ChunkableModuleReference for InternalCssAssetReference {}
