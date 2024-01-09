use anyhow::Result;
use titan_tasks::{ValueToString, Vc};

use super::{utils::content_to_details, Introspectable};
use crate::{asset::Asset, source::Source};

#[titan_tasks::value]
pub struct IntrospectableSource(Vc<Box<dyn Source>>);

#[titan_tasks::value_impl]
impl IntrospectableSource {
    #[titan_tasks::function]
    pub async fn new(asset: Vc<Box<dyn Source>>) -> Result<Vc<Box<dyn Introspectable>>> {
        Ok(Vc::try_resolve_sidecast::<Box<dyn Introspectable>>(asset)
            .await?
            .unwrap_or_else(|| Vc::upcast(IntrospectableSource(asset).cell())))
    }
}

#[titan_tasks::function]
fn ty() -> Vc<String> {
    Vc::cell("source".to_string())
}

#[titan_tasks::value_impl]
impl Introspectable for IntrospectableSource {
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
}
