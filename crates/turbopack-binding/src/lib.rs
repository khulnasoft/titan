#[cfg(feature = "__swc")]
pub mod swc {
    #[cfg(feature = "__swc_core")]
    pub use swc_core as core;

    #[cfg(feature = "__swc_custom_transform")]
    pub mod custom_transform {
        #[cfg(feature = "__swc_transform_modularize_imports")]
        pub use modularize_imports;
        #[cfg(feature = "__swc_transform_styled_components")]
        pub use styled_components;
        #[cfg(feature = "__swc_transform_styled_jsx")]
        pub use styled_jsx;
        #[cfg(feature = "__swc_transform_emotion")]
        pub use swc_emotion as emotion;
        #[cfg(feature = "__swc_transform_relay")]
        pub use swc_relay as relay;
    }

    #[cfg(feature = "testing")]
    pub use testing;
}

#[cfg(feature = "__titan")]
pub mod titan {
    #[cfg(feature = "__titan_tasks")]
    pub use titan_tasks as tasks;
    #[cfg(feature = "__titan_tasks_build")]
    pub use titan_tasks_build as tasks_build;
    #[cfg(feature = "__titan_tasks_bytes")]
    pub use titan_tasks_bytes as tasks_bytes;
    #[cfg(feature = "__titan_tasks_env")]
    pub use titan_tasks_env as tasks_env;
    #[cfg(feature = "__titan_tasks_fetch")]
    pub use titan_tasks_fetch as tasks_fetch;
    #[cfg(feature = "__titan_tasks_fs")]
    pub use titan_tasks_fs as tasks_fs;
    #[cfg(feature = "__titan_tasks_hash")]
    pub use titan_tasks_hash as tasks_hash;
    #[cfg(feature = "__titan_tasks_macros")]
    pub use titan_tasks_macros as tasks_macros;
    #[cfg(feature = "__titan_tasks_macros_shared")]
    pub use titan_tasks_macros_shared as tasks_macros_shared;
    #[cfg(feature = "__titan_tasks_malloc")]
    pub use titan_tasks_malloc as malloc;
    #[cfg(feature = "__titan_tasks_memory")]
    pub use titan_tasks_memory as tasks_memory;
    #[cfg(feature = "__titan_tasks_testing")]
    pub use titan_tasks_testing as tasks_testing;
    #[cfg(feature = "__titan_updater")]
    pub use titan_updater as updater;
}

#[cfg(feature = "__titanpack")]
pub mod titanpack {
    pub use titanpack;
    #[cfg(feature = "__titanpack_bench")]
    pub use titanpack_bench as bench;
    #[cfg(feature = "__titanpack_build")]
    pub use titanpack_build as build;
    #[cfg(feature = "__titanpack_cli_utils")]
    pub use titanpack_cli_utils as cli_utils;
    #[cfg(feature = "__titanpack_core")]
    pub use titanpack_core as core;
    #[cfg(feature = "__titanpack_create_test_app")]
    pub use titanpack_create_test_app as create_test_app;
    #[cfg(feature = "__titanpack_css")]
    pub use titanpack_css as css;
    #[cfg(feature = "__titanpack_dev")]
    pub use titanpack_dev as dev;
    #[cfg(feature = "__titanpack_dev_server")]
    pub use titanpack_dev_server as dev_server;
    #[cfg(feature = "__titanpack_ecmascript")]
    pub use titanpack_ecmascript as ecmascript;
    #[cfg(feature = "__titanpack_ecmascript_hmr_protocol")]
    pub use titanpack_ecmascript_hmr_protocol as ecmascript_hmr_protocol;
    #[cfg(feature = "__titanpack_ecmascript_plugin")]
    pub use titanpack_ecmascript_plugins as ecmascript_plugin;
    #[cfg(feature = "__titanpack_ecmascript_runtime")]
    pub use titanpack_ecmascript_runtime as ecmascript_runtime;
    #[cfg(feature = "__titanpack_env")]
    pub use titanpack_env as env;
    #[cfg(feature = "__titanpack_image")]
    pub use titanpack_image as image;
    #[cfg(feature = "__titanpack_json")]
    pub use titanpack_json as json;
    #[cfg(feature = "__titanpack_mdx")]
    pub use titanpack_mdx as mdx;
    #[cfg(feature = "__titanpack_node")]
    pub use titanpack_node as node;
    #[cfg(feature = "__titanpack_static")]
    pub use titanpack_static as r#static;
    #[cfg(feature = "__titanpack_swc_utils")]
    pub use titanpack_swc_utils as swc_utils;
    #[cfg(feature = "__titanpack_test_utils")]
    pub use titanpack_test_utils as test_utils;
    #[cfg(feature = "__titanpack_tests")]
    pub use titanpack_tests as tests;
    #[cfg(feature = "__titanpack_trace_utils")]
    pub use titanpack_trace_utils as trace_utils;
}

#[cfg(feature = "__features")]
pub mod features {
    #[cfg(feature = "__feature_auto_hash_map")]
    pub use auto_hash_map;
    #[cfg(feature = "__feature_mdx_rs")]
    pub use mdxjs;
    #[cfg(feature = "__feature_node_file_trace")]
    pub use node_file_trace;
    #[cfg(feature = "__feature_swc_ast_explorer")]
    pub use swc_ast_explorer;
    #[cfg(feature = "__feature_tracing_signpost")]
    pub use tracing_signpost;
}
