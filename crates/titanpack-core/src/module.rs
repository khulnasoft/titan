use indexmap::IndexSet;
use titan_tasks::Vc;

use crate::{asset::Asset, ident::AssetIdent, reference::ModuleReferences};

/// A module. This usually represents parsed source code, which has references
/// to other modules.
#[titan_tasks::value_trait]
pub trait Module: Asset {
    /// The identifier of the [Module]. It's expected to be unique and capture
    /// all properties of the [Module].
    fn ident(&self) -> Vc<AssetIdent>;

    /// Other [Module]s or [OutputAsset]s referenced from this [Module].
    // TODO refactor to avoid returning [OutputAsset]s here
    fn references(self: Vc<Self>) -> Vc<ModuleReferences> {
        ModuleReferences::empty()
    }
}

#[titan_tasks::value(transparent)]
pub struct OptionModule(Option<Vc<Box<dyn Module>>>);

#[titan_tasks::value(transparent)]
pub struct Modules(Vec<Vc<Box<dyn Module>>>);

#[titan_tasks::value_impl]
impl Modules {
    #[titan_tasks::function]
    pub fn empty() -> Vc<Self> {
        Vc::cell(Vec::new())
    }
}

/// A set of [Module]s
#[titan_tasks::value(transparent)]
pub struct ModulesSet(IndexSet<Vc<Box<dyn Module>>>);

#[titan_tasks::value_impl]
impl ModulesSet {
    #[titan_tasks::function]
    pub fn empty() -> Vc<Self> {
        Vc::cell(IndexSet::new())
    }
}

// TODO All Vc::try_resolve_downcast::<Box<dyn Module>> calls should be removed
