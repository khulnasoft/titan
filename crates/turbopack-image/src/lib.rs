#![feature(arbitrary_self_types)]

pub mod process;

pub fn register() {
    titan_tasks::register();
    titan_tasks_fs::register();
    titanpack_core::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
