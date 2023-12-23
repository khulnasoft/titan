//! Environment Variable support for titanpack.
//!
//! Environment variables can come from multiple sources, including the rust
//! process's env (immutable and by passing `FOO=BAR` keys when executing the
//! titanpack binary) or loaded via dotenv files.
//!
//! Dotenv file loading is a chain. Dotenv files that come first in the chain
//! have higher priority to define a environment variable (later dotenv files
//! cannot override it). Later dotenv files can reference variables prior
//! defined variables.

#![feature(async_closure)]
#![feature(min_specialization)]
#![feature(arbitrary_self_types)]

mod asset;
pub mod dotenv;
mod embeddable;
mod issue;
mod try_env;

pub use asset::ProcessEnvAsset;
pub use embeddable::EmbeddableProcessEnv;
pub use issue::ProcessEnvIssue;
pub use try_env::TryDotenvProcessEnv;

pub fn register() {
    titan_tasks::register();
    titan_tasks_fs::register();
    titan_tasks_env::register();
    titanpack_core::register();
    titanpack_ecmascript::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
