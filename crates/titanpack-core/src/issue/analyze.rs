use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_fs::FileSystemPath;

use super::{
    Issue, IssueSeverity, IssueSource, OptionIssueSource, OptionStyledString, StyledString,
};
use crate::ident::AssetIdent;

#[titan_tasks::value(shared)]
pub struct AnalyzeIssue {
    pub severity: Vc<IssueSeverity>,
    pub source_ident: Vc<AssetIdent>,
    pub title: Vc<String>,
    pub message: Vc<StyledString>,
    pub category: Vc<String>,
    pub code: Option<String>,
    pub source: Option<Vc<IssueSource>>,
}

#[titan_tasks::value_impl]
impl Issue for AnalyzeIssue {
    #[titan_tasks::function]
    fn severity(&self) -> Vc<IssueSeverity> {
        self.severity
    }

    #[titan_tasks::function]
    async fn title(&self) -> Result<Vc<StyledString>> {
        let title = &*self.title.await?;
        Ok(if let Some(code) = self.code.as_ref() {
            StyledString::Line(vec![
                StyledString::Strong(code.to_string()),
                StyledString::Text(" ".to_string()),
                StyledString::Text(title.to_string()),
            ])
        } else {
            StyledString::Text(title.to_string())
        }
        .cell())
    }

    #[titan_tasks::function]
    fn category(&self) -> Vc<String> {
        self.category
    }

    #[titan_tasks::function]
    fn file_path(&self) -> Vc<FileSystemPath> {
        self.source_ident.path()
    }

    #[titan_tasks::function]
    fn description(&self) -> Vc<OptionStyledString> {
        Vc::cell(Some(self.message))
    }

    #[titan_tasks::function]
    fn source(&self) -> Vc<OptionIssueSource> {
        Vc::cell(self.source)
    }
}
