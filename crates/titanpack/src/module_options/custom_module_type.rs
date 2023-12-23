use titan_tasks::Vc;
use titanpack_core::{module::Module, resolve::ModulePart, source::Source};

use crate::ModuleAssetContext;

#[titan_tasks::value_trait]
pub trait CustomModuleType {
    fn create_module(
        self: Vc<Self>,
        source: Vc<Box<dyn Source>>,
        module_asset_context: Vc<ModuleAssetContext>,
        part: Option<Vc<ModulePart>>,
    ) -> Vc<Box<dyn Module>>;
}
