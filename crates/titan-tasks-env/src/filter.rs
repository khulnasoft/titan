use anyhow::Result;
use indexmap::IndexMap;
use titan_tasks::Vc;

use crate::{EnvMap, ProcessEnv};

/// Filters env variables by some prefix. Casing of the env vars is ignored for
/// filtering.
#[titan_tasks::value]
pub struct FilterProcessEnv {
    prior: Vc<Box<dyn ProcessEnv>>,
    filters: Vec<String>,
}

#[titan_tasks::value_impl]
impl FilterProcessEnv {
    #[titan_tasks::function]
    pub fn new(prior: Vc<Box<dyn ProcessEnv>>, filters: Vec<String>) -> Vc<Self> {
        FilterProcessEnv {
            prior,
            filters: filters.into_iter().map(|f| f.to_uppercase()).collect(),
        }
        .cell()
    }
}

#[titan_tasks::value_impl]
impl ProcessEnv for FilterProcessEnv {
    #[titan_tasks::function]
    async fn read_all(&self) -> Result<Vc<EnvMap>> {
        let prior = self.prior.read_all().await?;
        let mut filtered = IndexMap::new();
        for (key, value) in &*prior {
            let uppercase = key.to_uppercase();
            for filter in &self.filters {
                if uppercase.starts_with(filter) {
                    filtered.insert(key.clone(), value.clone());
                    break;
                }
            }
        }
        Ok(Vc::cell(filtered))
    }

    #[titan_tasks::function]
    fn read(&self, name: String) -> Vc<Option<String>> {
        for filter in &self.filters {
            if name.to_uppercase().starts_with(filter) {
                return self.prior.read(name);
            }
        }
        Vc::cell(None)
    }
}
