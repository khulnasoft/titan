//! TODO(WEB-741) Remove this file once Sass is supported.

use anyhow::Result;
use titan_tasks::{Value, Vc};
use titan_tasks_fs::{glob::Glob, FileSystemPath};
use titanpack_core::{
    issue::{Issue, IssueExt, IssueSeverity, OptionStyledString, StyledString},
    reference_type::ReferenceType,
    resolve::{
        parse::Request,
        plugin::{ResolvePlugin, ResolvePluginCondition},
        ResolveResultOption,
    },
};

/// Resolve plugins that warns when importing a sass file.
#[titan_tasks::value]
pub(crate) struct UnsupportedSassResolvePlugin {
    root: Vc<FileSystemPath>,
}

#[titan_tasks::value_impl]
impl UnsupportedSassResolvePlugin {
    #[titan_tasks::function]
    pub fn new(root: Vc<FileSystemPath>) -> Vc<Self> {
        UnsupportedSassResolvePlugin { root }.cell()
    }
}

#[titan_tasks::value_impl]
impl ResolvePlugin for UnsupportedSassResolvePlugin {
    #[titan_tasks::function]
    fn after_resolve_condition(&self) -> Vc<ResolvePluginCondition> {
        ResolvePluginCondition::new(self.root.root(), Glob::new("**/*.{sass,scss}".to_string()))
    }

    #[titan_tasks::function]
    async fn after_resolve(
        &self,
        fs_path: Vc<FileSystemPath>,
        lookup_path: Vc<FileSystemPath>,
        _reference_type: Value<ReferenceType>,
        request: Vc<Request>,
    ) -> Result<Vc<ResolveResultOption>> {
        let extension = fs_path.extension().await?;
        if ["sass", "scss"].iter().any(|ext| ext == &*extension) {
            UnsupportedSassModuleIssue {
                file_path: lookup_path,
                request,
            }
            .cell()
            .emit();
        }

        Ok(ResolveResultOption::none())
    }
}

#[titan_tasks::value(shared)]
struct UnsupportedSassModuleIssue {
    file_path: Vc<FileSystemPath>,
    request: Vc<Request>,
}

#[titan_tasks::value_impl]
impl Issue for UnsupportedSassModuleIssue {
    #[titan_tasks::function]
    fn severity(&self) -> Vc<IssueSeverity> {
        IssueSeverity::Warning.into()
    }

    #[titan_tasks::function]
    fn category(&self) -> Vc<String> {
        Vc::cell("resolve".to_string())
    }

    #[titan_tasks::function]
    async fn title(&self) -> Result<Vc<StyledString>> {
        Ok(StyledString::Text(format!(
            "Unsupported Sass request: {}",
            self.request.await?.request().as_deref().unwrap_or("N/A")
        ))
        .cell())
    }

    #[titan_tasks::function]
    fn file_path(&self) -> Vc<FileSystemPath> {
        self.file_path
    }

    #[titan_tasks::function]
    fn description(&self) -> Vc<OptionStyledString> {
        Vc::cell(Some(
            StyledString::Text(
                "Titanpack does not yet support importing Sass modules.".to_string(),
            )
            .cell(),
        ))
    }
}
