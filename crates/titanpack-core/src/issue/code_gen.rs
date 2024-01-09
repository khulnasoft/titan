use titan_tasks::Vc;
use titan_tasks_fs::FileSystemPath;

use super::{Issue, IssueSeverity, OptionStyledString, StyledString};

#[titan_tasks::value(shared)]
pub struct CodeGenerationIssue {
    pub severity: Vc<IssueSeverity>,
    pub path: Vc<FileSystemPath>,
    pub title: Vc<StyledString>,
    pub message: Vc<StyledString>,
}

#[titan_tasks::value_impl]
impl Issue for CodeGenerationIssue {
    #[titan_tasks::function]
    fn severity(&self) -> Vc<IssueSeverity> {
        self.severity
    }

    #[titan_tasks::function]
    fn title(&self) -> Vc<StyledString> {
        self.title
    }

    #[titan_tasks::function]
    fn category(&self) -> Vc<String> {
        Vc::cell("code generation".to_string())
    }

    #[titan_tasks::function]
    fn file_path(&self) -> Vc<FileSystemPath> {
        self.path
    }

    #[titan_tasks::function]
    fn description(&self) -> Vc<OptionStyledString> {
        Vc::cell(Some(self.message))
    }
}
