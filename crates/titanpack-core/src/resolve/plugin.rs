use anyhow::Result;
use titan_tasks::{Value, Vc};
use titan_tasks_fs::{glob::Glob, FileSystemPath};

use crate::{
    reference_type::ReferenceType,
    resolve::{parse::Request, ResolveResultOption},
};

/// A condition which determines if the hooks of a resolve plugin gets called.
#[titan_tasks::value]
pub struct ResolvePluginCondition {
    root: Vc<FileSystemPath>,
    glob: Vc<Glob>,
}

#[titan_tasks::value_impl]
impl ResolvePluginCondition {
    #[titan_tasks::function]
    pub fn new(root: Vc<FileSystemPath>, glob: Vc<Glob>) -> Vc<Self> {
        ResolvePluginCondition { root, glob }.cell()
    }

    #[titan_tasks::function]
    pub async fn matches(self: Vc<Self>, fs_path: Vc<FileSystemPath>) -> Result<Vc<bool>> {
        let this = self.await?;
        let root = this.root.await?;
        let glob = this.glob.await?;

        let path = fs_path.await?;

        if let Some(path) = root.get_path_to(&path) {
            if glob.execute(path) {
                return Ok(Vc::cell(true));
            }
        }

        Ok(Vc::cell(false))
    }
}

#[titan_tasks::value_trait]
pub trait ResolvePlugin {
    /// A condition which determines if the hooks gets called.
    fn after_resolve_condition(self: Vc<Self>) -> Vc<ResolvePluginCondition>;

    /// This hook gets called when a full filepath has been resolved and the
    /// condition matches. If a value is returned it replaces the resolve
    /// result.
    fn after_resolve(
        self: Vc<Self>,
        fs_path: Vc<FileSystemPath>,
        lookup_path: Vc<FileSystemPath>,
        reference_type: Value<ReferenceType>,
        request: Vc<Request>,
    ) -> Vc<ResolveResultOption>;
}
