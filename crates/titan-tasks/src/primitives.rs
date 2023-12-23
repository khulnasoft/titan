use std::{future::IntoFuture, ops::Deref};

use anyhow::Result;
use futures::TryFutureExt;
// This specific macro identifier is detected by titan-tasks-build.
use titan_tasks_macros::primitive as __titan_tasks_internal_primitive;

use crate::{
    TryJoinIterExt, Vc, {self as titan_tasks},
};

__titan_tasks_internal_primitive!(());
__titan_tasks_internal_primitive!(String);

#[titan_tasks::function]
fn empty_string() -> Vc<String> {
    Vc::cell(String::new())
}

impl Vc<String> {
    #[deprecated(note = "use Default::default() instead")]
    #[inline(always)]
    pub fn empty() -> Vc<String> {
        empty_string()
    }
}

__titan_tasks_internal_primitive!(Option<String>);
__titan_tasks_internal_primitive!(Vec<String>);

#[titan_tasks::function]
fn empty_string_vec() -> Vc<Vec<String>> {
    Vc::cell(Vec::new())
}

impl Vc<Vec<String>> {
    #[deprecated(note = "use Default::default() instead")]
    #[inline(always)]
    pub fn empty() -> Vc<Vec<String>> {
        empty_string_vec()
    }
}

__titan_tasks_internal_primitive!(Option<u16>);

#[titan_tasks::function]
fn option_string_none() -> Vc<Option<String>> {
    Vc::cell(None)
}

impl Vc<Option<String>> {
    #[deprecated(note = "use Default::default() instead")]
    pub fn none() -> Self {
        option_string_none()
    }
}

__titan_tasks_internal_primitive!(bool);
__titan_tasks_internal_primitive!(u8);
__titan_tasks_internal_primitive!(u16);
__titan_tasks_internal_primitive!(u32);
__titan_tasks_internal_primitive!(u64);
__titan_tasks_internal_primitive!(u128);
__titan_tasks_internal_primitive!(i8);
__titan_tasks_internal_primitive!(i16);
__titan_tasks_internal_primitive!(i32);
__titan_tasks_internal_primitive!(i64);
__titan_tasks_internal_primitive!(i128);
__titan_tasks_internal_primitive!(usize);
__titan_tasks_internal_primitive!(isize);
__titan_tasks_internal_primitive!(serde_json::Value);
__titan_tasks_internal_primitive!(Vec<u8>);

__titan_tasks_internal_primitive!(Vec<bool>);

#[titan_tasks::value(transparent)]
pub struct Bools(Vec<Vc<bool>>);

#[titan_tasks::value_impl]
impl Bools {
    #[titan_tasks::function]
    pub fn empty() -> Vc<Bools> {
        Vc::cell(Vec::new())
    }

    #[titan_tasks::function]
    async fn into_bools(self: Vc<Bools>) -> Result<Vc<Vec<bool>>> {
        let this = self.await?;

        let bools = this
            .iter()
            .map(|b| b.into_future().map_ok(|b| *b))
            .try_join()
            .await?;

        Ok(Vc::cell(bools))
    }

    #[titan_tasks::function]
    pub async fn all(self: Vc<Bools>) -> Result<Vc<bool>> {
        let bools = self.into_bools().await?;

        Ok(Vc::cell(bools.iter().all(|b| *b)))
    }

    #[titan_tasks::function]
    pub async fn any(self: Vc<Bools>) -> Result<Vc<bool>> {
        let bools = self.into_bools().await?;

        Ok(Vc::cell(bools.iter().any(|b| *b)))
    }
}

#[titan_tasks::value(transparent, eq = "manual")]
#[derive(Debug, Clone)]
pub struct Regex(
    #[titan_tasks(trace_ignore)]
    #[serde(with = "serde_regex")]
    pub regex::Regex,
);

impl Deref for Regex {
    type Target = regex::Regex;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl PartialEq for Regex {
    fn eq(&self, other: &Regex) -> bool {
        // Context: https://github.com/rust-lang/regex/issues/313#issuecomment-269898900
        self.0.as_str() == other.0.as_str()
    }
}
impl Eq for Regex {}
