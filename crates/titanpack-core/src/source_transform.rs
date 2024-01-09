use anyhow::Result;
use titan_tasks::Vc;

use crate::source::Source;

#[titan_tasks::value_trait]
pub trait SourceTransform {
    fn transform(self: Vc<Self>, source: Vc<Box<dyn Source>>) -> Vc<Box<dyn Source>>;
}

#[titan_tasks::value(transparent)]
pub struct SourceTransforms(Vec<Vc<Box<dyn SourceTransform>>>);

#[titan_tasks::value_impl]
impl SourceTransforms {
    #[titan_tasks::function]
    pub async fn transform(
        self: Vc<Self>,
        source: Vc<Box<dyn Source>>,
    ) -> Result<Vc<Box<dyn Source>>> {
        Ok(self
            .await?
            .iter()
            .fold(source, |source, transform| transform.transform(source)))
    }
}
