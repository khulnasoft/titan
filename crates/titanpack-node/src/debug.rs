use std::env;

const DEBUG_JS_VAR: &str = "TITANPACK_DEBUG_JS";

/// Checks if the operation passed is included in the `TITANPACK_DEBUG_JS` env
/// var to enable node.js debugging at runtime.
///
/// This is preferable to manually passing a boolean because recompiling won't
/// be necessary.
pub fn should_debug(operation: &str) -> bool {
    // TODO(sokra) It's not persistent caching safe to read an env var this way.
    // This must use titan_tasks_env instead.
    let Ok(val) = env::var(DEBUG_JS_VAR) else {
        return false;
    };

    val == "*" || val.split(',').any(|part| part == operation)
}
