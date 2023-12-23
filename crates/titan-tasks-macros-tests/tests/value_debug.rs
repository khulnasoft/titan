use titan_tasks::debug::ValueDebugFormat;
use titan_tasks_testing::{register, run};

register!();

#[tokio::test]
async fn ignored_indexes() {
    #[derive(ValueDebugFormat)]
    struct IgnoredIndexes(
        #[titan_tasks(debug_ignore)] i32,
        i32,
        #[titan_tasks(debug_ignore)] i32,
    );

    run! {
        let input = IgnoredIndexes(-1, 2, -3);
        let debug = input.value_debug_format(usize::MAX).try_to_string().await?;
        assert!(!debug.contains("-1"));
        assert!(debug.contains('2'));
        assert!(!debug.contains("-3"));
    }
}
