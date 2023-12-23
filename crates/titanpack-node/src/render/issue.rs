use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_fs::FileSystemPath;
use titanpack_core::issue::{Issue, OptionStyledString, StyledString};

#[titan_tasks::value(shared)]
#[derive(Copy, Clone)]
pub struct RenderingIssue {
    pub file_path: Vc<FileSystemPath>,
    pub message: Vc<StyledString>,
    pub status: Option<i32>,
}

#[titan_tasks::value_impl]
impl Issue for RenderingIssue {
    #[titan_tasks::function]
    fn title(&self) -> Vc<StyledString> {
        StyledString::Text("Error during SSR Rendering".to_string()).cell()
    }

    #[titan_tasks::function]
    fn category(&self) -> Vc<String> {
        Vc::cell("rendering".to_string())
    }

    #[titan_tasks::function]
    fn file_path(&self) -> Vc<FileSystemPath> {
        self.file_path
    }

    #[titan_tasks::function]
    fn description(&self) -> Vc<OptionStyledString> {
        Vc::cell(Some(self.message))
    }

    #[titan_tasks::function]
    async fn detail(&self) -> Result<Vc<OptionStyledString>> {
        let mut details = vec![];

        if let Some(status) = self.status {
            if status != 0 {
                details.push(StyledString::Text(format!("Node.js exit code: {status}")));
            }
        }

        Ok(Vc::cell(Some(StyledString::Stack(details).cell())))
    }

    // TODO parse stack trace into source location
}
