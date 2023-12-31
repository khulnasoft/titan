#![feature(future_join)]
#![feature(min_specialization)]
#![feature(arbitrary_self_types)]

pub mod arguments;
pub mod build;
pub(crate) mod contexts;
pub mod dev;
pub(crate) mod embed_js;
pub(crate) mod util;

pub fn register() {
    titanpack::register();
    titanpack_build::register();
    titanpack_dev::register();
    titanpack_ecmascript_plugins::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
