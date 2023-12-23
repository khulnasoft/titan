use std::marker::PhantomData;

use auto_hash_map::AutoSet;
// This specific macro identifier is detected by titan-tasks-build.
use titan_tasks_macros::primitive as __titan_tasks_internal_primitive;

use crate as titan_tasks;
use crate::{RawVc, TaskId, Vc};

__titan_tasks_internal_primitive!(AutoSet<RawVc>);

impl Vc<AutoSet<RawVc>> {
    /// Casts a `TaskId` to a `Vc<AutoSet<RawVc>>`.
    ///
    /// # Safety
    ///
    /// The `TaskId` must be point to a valid `AutoSet<RawVc>`.
    pub unsafe fn from_task_id(task_id: TaskId) -> Self {
        Vc {
            node: RawVc::TaskOutput(task_id),
            _t: PhantomData,
        }
    }
}
