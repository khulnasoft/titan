use titan_tasks::Vc;

use crate::{self as titan_tasks};

#[titan_tasks::value_trait]
pub trait ValueToString {
    fn to_string(self: Vc<Self>) -> Vc<String>;
}
