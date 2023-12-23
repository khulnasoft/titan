use indexmap::IndexMap;
use titan_tasks::Vc;

use crate::{sorted_env_vars, EnvMap, ProcessEnv, GLOBAL_ENV_LOCK};

/// Load the environment variables defined via command line.
#[titan_tasks::value]
pub struct CommandLineProcessEnv;

#[titan_tasks::value_impl]
impl CommandLineProcessEnv {
    #[titan_tasks::function]
    pub fn new() -> Vc<Self> {
        CommandLineProcessEnv.cell()
    }
}

/// Clones the current env vars into a IndexMap.
fn env_snapshot() -> IndexMap<String, String> {
    let _lock = GLOBAL_ENV_LOCK.lock().unwrap();
    sorted_env_vars()
}

#[titan_tasks::value_impl]
impl ProcessEnv for CommandLineProcessEnv {
    #[titan_tasks::function]
    fn read_all(&self) -> Vc<EnvMap> {
        Vc::cell(env_snapshot())
    }
}
