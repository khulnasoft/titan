#![feature(async_closure)]
#![feature(min_specialization)]
#![feature(round_char_boundary)]
#![feature(thread_id_value)]
#![feature(arbitrary_self_types)]

pub mod issue;
pub mod runtime_entry;
pub mod source_context;

pub fn register() {
    titan_tasks::register();
    titan_tasks_fs::register();
    titanpack_core::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
