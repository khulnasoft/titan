use crate::{self as titan_tasks, RawVc, Vc};
/// Just an empty type, but it's never equal to itself.
/// [Vc<Completion>] can be used as return value instead of `()`
/// to have a concrete reference that can be awaited.
/// It will invalidate the awaiting task everytime the referenced
/// task has been executed.
#[titan_tasks::value(cell = "new")]
pub struct Completion;

#[titan_tasks::value_impl]
impl Completion {
    /// This will always be the same and never invalidates the reading task.
    #[titan_tasks::function]
    pub fn immutable() -> Vc<Self> {
        Completion::cell(Completion)
    }
}

// no #[titan_tasks::value_impl] to inline new into the caller task
// this ensures it's re-created on each execution
impl Completion {
    /// This will always be a new completion and invalidates the reading task.
    pub fn new() -> Vc<Self> {
        Completion::cell(Completion)
    }

    /// Uses the previous completion. Can be used to cancel without triggering a
    /// new invalidation.
    pub fn unchanged() -> Vc<Self> {
        // This is the same code that Completion::cell uses except that it
        // only updates the cell when it is empty (Completion::cell opted-out of
        // that via `#[titan_tasks::value(cell = "new")]`)
        let cell = titan_tasks::macro_helpers::find_cell_by_type(*COMPLETION_VALUE_TYPE_ID);
        cell.conditional_update_shared(|old| old.is_none().then_some(Completion));
        let raw: RawVc = cell.into();
        raw.into()
    }
}

#[titan_tasks::value(transparent)]
pub struct Completions(Vec<Vc<Completion>>);

#[titan_tasks::value_impl]
impl Completions {
    /// Merges multiple completions into one. The passed list will be part of
    /// the cache key, so this function should not be used with varying lists.
    ///
    /// Varying lists should use `Vc::cell(list).completed()`
    /// instead.
    #[titan_tasks::function]
    pub fn all(completions: Vec<Vc<Completion>>) -> Vc<Completion> {
        Vc::<Completions>::cell(completions).completed()
    }

    /// Merges the list of completions into one.
    #[titan_tasks::function]
    pub async fn completed(self: Vc<Self>) -> anyhow::Result<Vc<Completion>> {
        for c in self.await?.iter() {
            c.await?;
        }
        Ok(Completion::new())
    }
}
