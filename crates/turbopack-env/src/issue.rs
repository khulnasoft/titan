use titan_tasks::Vc;
use titan_tasks_fs::FileSystemPath;
use titanpack_core::issue::{Issue, OptionStyledString, StyledString};

/// An issue that occurred while resolving the parsing or evaluating the .env.
#[titan_tasks::value(shared)]
pub struct ProcessEnvIssue {
    pub path: Vc<FileSystemPath>,
    pub description: Vc<StyledString>,
}

#[titan_tasks::value_impl]
impl Issue for ProcessEnvIssue {
    #[titan_tasks::function]
    fn title(&self) -> Vc<StyledString> {
        StyledString::Text("Error loading dotenv file".to_string()).cell()
    }

    #[titan_tasks::function]
    fn category(&self) -> Vc<String> {
        Vc::cell("parse".to_string())
    }

    #[titan_tasks::function]
    fn file_path(&self) -> Vc<FileSystemPath> {
        self.path
    }

    #[titan_tasks::function]
    fn description(&self) -> Vc<OptionStyledString> {
        Vc::cell(Some(self.description))
    }
}
