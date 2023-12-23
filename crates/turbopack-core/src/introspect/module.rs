use anyhow::Result;
use titan_tasks::{ValueToString, Vc};

use super::{
    utils::{children_from_module_references, content_to_details},
    Introspectable, IntrospectableChildren,
};
use crate::{asset::Asset, module::Module};

#[titan_tasks::value]
pub struct IntrospectableModule(Vc<Box<dyn Module>>);

#[titan_tasks::value_impl]
impl IntrospectableModule {
    #[titan_tasks::function]
    pub async fn new(asset: Vc<Box<dyn Module>>) -> Result<Vc<Box<dyn Introspectable>>> {
        Ok(Vc::try_resolve_sidecast::<Box<dyn Introspectable>>(asset)
            .await?
            .unwrap_or_else(|| Vc::upcast(IntrospectableModule(asset).cell())))
    }
}

#[titan_tasks::function]
fn ty() -> Vc<String> {
    Vc::cell("asset".to_string())
}

#[titan_tasks::value_impl]
impl Introspectable for IntrospectableModule {
    #[titan_tasks::function]
    fn ty(&self) -> Vc<String> {
        ty()
    }

    #[titan_tasks::function]
    fn title(&self) -> Vc<String> {
        self.0.ident().to_string()
    }

    #[titan_tasks::function]
    fn details(&self) -> Vc<String> {
        content_to_details(self.0.content())
    }

    #[titan_tasks::function]
    fn children(&self) -> Vc<IntrospectableChildren> {
        children_from_module_references(self.0.references())
    }
}
