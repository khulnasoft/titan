use titan_tasks::Vc;

use crate::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    output::OutputAsset,
    source::Source,
};

/// A module where source code doesn't need to be parsed but can be used as is.
/// This module has no references to other modules.
#[titan_tasks::value]
pub struct RawOutput {
    source: Vc<Box<dyn Source>>,
}

#[titan_tasks::value_impl]
impl OutputAsset for RawOutput {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.source.ident()
    }
}

#[titan_tasks::value_impl]
impl Asset for RawOutput {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        self.source.content()
    }
}

#[titan_tasks::value_impl]
impl RawOutput {
    #[titan_tasks::function]
    pub fn new(source: Vc<Box<dyn Source>>) -> Vc<RawOutput> {
        RawOutput { source }.cell()
    }
}
