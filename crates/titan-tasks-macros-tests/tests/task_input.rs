//! Tests for the `#[derive(TaskInput)]` macro are in `titan_tasks` itself.
//! However, we keep one test here as an integration test between the derive
//! macro and the `#[titan_tasks::function]` macro.

use titan_tasks::{Completion, TaskInput, Vc};
use titan_tasks_testing::{register, run};

register!();

#[derive(Clone, TaskInput)]
struct OneUnnamedField(u32);

#[titan_tasks::function]
async fn one_unnamed_field(input: OneUnnamedField) -> Vc<Completion> {
    assert_eq!(input.0, 42);
    Completion::immutable()
}

#[tokio::test]
async fn tests() {
    run! {
        one_unnamed_field(OneUnnamedField(42)).await?;
    }
}
