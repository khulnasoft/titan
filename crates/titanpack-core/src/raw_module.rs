use titan_tasks::Vc;

use crate::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    module::Module,
    source::Source,
};

/// A module where source code doesn't need to be parsed but can be usd as is.
/// This module has no references to other modules.
#[titan_tasks::value]
pub struct RawModule {
    source: Vc<Box<dyn Source>>,
}

#[titan_tasks::value_impl]
impl Module for RawModule {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.source.ident()
    }
}

#[titan_tasks::value_impl]
impl Asset for RawModule {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}

#[titan_tasks::value_impl]
impl RawModule {
    #[titan_tasks::function]
    pub fn new(source: Vc<Box<dyn Source>>) -> Vc<RawModule> {
        RawModule { source }.cell()
    }
}
