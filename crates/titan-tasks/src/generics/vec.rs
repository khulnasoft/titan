use anyhow::Result;
// This specific macro identifier is detected by titan-tasks-build.
use titan_tasks_macros::generic_type as __titan_tasks_internal_generic_type;

use crate::{
    self as titan_tasks,
    debug::{ValueDebug, ValueDebugFormat, ValueDebugString},
    ValueDefault, Vc,
};

__titan_tasks_internal_generic_type!(<T>, Vec<Vc<T>>);

#[titan_tasks::function]
async fn vec_len(vec: Vc<Vec<Vc<()>>>) -> Result<Vc<usize>> {
    let vec = vec.await?;
    Ok(Vc::cell(vec.len()))
}

#[titan_tasks::function]
async fn vec_is_empty(vec: Vc<Vec<Vc<()>>>) -> Result<Vc<bool>> {
    let vec = vec.await?;
    Ok(Vc::cell(vec.is_empty()))
}

impl<T> Vc<Vec<Vc<T>>>
where
    T: Send,
{
    /// See [`Vec::len`].
    pub fn len(self) -> Vc<usize> {
        vec_len(Self::to_repr(self))
    }

    /// See [`Vec::is_empty`].
    pub fn is_empty(self) -> Vc<bool> {
        vec_is_empty(Self::to_repr(self))
    }
}

#[titan_tasks::function]
fn vec_default() -> Vc<Vec<Vc<()>>> {
    Vc::cell(Default::default())
}

impl<T> ValueDefault for Vec<Vc<T>>
where
    T: Send,
{
    fn value_default() -> Vc<Self> {
        // Safety: `vec_default` creates an empty vector, which is a valid
        // representation of any vector of `Vc`s.
        unsafe { Vc::<Self>::from_repr(vec_default()) }
    }
}

#[titan_tasks::function]
async fn vec_dbg_depth(vec: Vc<Vec<Vc<()>>>, depth: usize) -> Result<Vc<ValueDebugString>> {
    vec.await?
        .value_debug_format(depth)
        .try_to_value_debug_string()
        .await
}

impl<T> ValueDebug for Vec<Vc<T>>
where
    T: Send,
{
    fn dbg(self: Vc<Self>) -> Vc<ValueDebugString> {
        vec_dbg_depth(Vc::<Self>::to_repr(self), usize::MAX)
    }

    fn dbg_depth(self: Vc<Self>, depth: usize) -> Vc<ValueDebugString> {
        vec_dbg_depth(Vc::<Self>::to_repr(self), depth)
    }
}
