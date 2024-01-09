#![feature(lint_reasons)]
#![feature(iter_intersperse)]
#![feature(int_roundings)]
#![feature(arbitrary_self_types)]

pub(crate) mod chunking_context;
pub(crate) mod ecmascript;
pub mod react_refresh;

pub use chunking_context::{DevChunkingContext, DevChunkingContextBuilder};

pub fn register() {
    titan_tasks::register();
    titan_tasks_fs::register();
    titanpack_core::register();
    titanpack_ecmascript::register();
    titanpack_ecmascript_runtime::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
