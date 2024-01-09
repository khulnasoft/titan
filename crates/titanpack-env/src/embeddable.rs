use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_env::{EnvMap, ProcessEnv};
use titanpack_ecmascript::utils::StringifyJs;

/// Encodes values as JS strings so that they can be safely injected into a JS
/// output.
#[titan_tasks::value]
pub struct EmbeddableProcessEnv {
    prior: Vc<Box<dyn ProcessEnv>>,
}

#[titan_tasks::value_impl]
impl EmbeddableProcessEnv {
    #[titan_tasks::function]
    pub fn new(prior: Vc<Box<dyn ProcessEnv>>) -> Vc<Self> {
        EmbeddableProcessEnv { prior }.cell()
    }
}

#[titan_tasks::value_impl]
impl ProcessEnv for EmbeddableProcessEnv {
    #[titan_tasks::function]
    async fn read_all(&self) -> Result<Vc<EnvMap>> {
        let prior = self.prior.read_all().await?;

        let encoded = prior
            .iter()
            .map(|(k, v)| (k.clone(), StringifyJs(v).to_string()))
            .collect();

        Ok(Vc::cell(encoded))
    }

    #[titan_tasks::function]
    async fn read(&self, name: String) -> Result<Vc<Option<String>>> {
        let prior = self.prior.read(name).await?;
        let encoded = prior.as_deref().map(|s| StringifyJs(s).to_string());
        Ok(Vc::cell(encoded))
    }
}
