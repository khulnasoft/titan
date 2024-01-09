#![feature(lint_reasons)]
#![feature(iter_intersperse)]
#![feature(arbitrary_self_types)]

pub(crate) mod chunking_context;
pub(crate) mod ecmascript;

pub use chunking_context::{BuildChunkingContext, BuildChunkingContextBuilder, MinifyType};

pub fn register() {
    titan_tasks::register();
    titan_tasks_fs::register();
    titanpack_core::register();
    titanpack_ecmascript::register();
    titanpack_ecmascript_runtime::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
