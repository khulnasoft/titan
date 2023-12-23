#![feature(arbitrary_self_types)]

pub mod transform;

pub fn register() {
    titan_tasks::register();
    titanpack_ecmascript::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
