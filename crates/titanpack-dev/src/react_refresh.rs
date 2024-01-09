use anyhow::Result;
use titan_tasks::{Value, Vc};
use titan_tasks_fs::FileSystemPath;
use titanpack::resolve_options_context::ResolveOptionsContext;
use titanpack_core::{
    issue::{Issue, IssueExt, IssueSeverity, OptionStyledString, StyledString},
    reference_type::{CommonJsReferenceSubType, ReferenceType},
    resolve::parse::Request,
};
use titanpack_ecmascript::resolve::apply_cjs_specific_options;

#[titan_tasks::function]
fn react_refresh_request() -> Vc<Request> {
    Request::parse_string("@next/react-refresh-utils/dist/runtime".to_string())
}

#[titan_tasks::function]
fn react_refresh_request_in_next() -> Vc<Request> {
    Request::parse_string("next/dist/compiled/@next/react-refresh-utils/dist/runtime".to_string())
}

#[titan_tasks::value]
pub enum ResolveReactRefreshResult {
    NotFound,
    Found(Vc<Request>),
}

impl ResolveReactRefreshResult {
    pub fn as_request(&self) -> Option<Vc<Request>> {
        match self {
            ResolveReactRefreshResult::NotFound => None,
            ResolveReactRefreshResult::Found(r) => Some(*r),
        }
    }
    pub fn is_found(&self) -> bool {
        match self {
            ResolveReactRefreshResult::NotFound => false,
            ResolveReactRefreshResult::Found(_) => true,
        }
    }
}

/// Checks whether we can resolve the React Refresh runtime module from the
/// given path. Emits an issue if we can't.
#[titan_tasks::function]
pub async fn assert_can_resolve_react_refresh(
    path: Vc<FileSystemPath>,
    resolve_options_context: Vc<ResolveOptionsContext>,
) -> Result<Vc<ResolveReactRefreshResult>> {
    let resolve_options =
        apply_cjs_specific_options(titanpack::resolve_options(path, resolve_options_context));
    for request in [react_refresh_request_in_next(), react_refresh_request()] {
        let result = titanpack_core::resolve::resolve(
            path,
            Value::new(ReferenceType::CommonJs(CommonJsReferenceSubType::Undefined)),
            request,
            resolve_options,
        )
        .first_source();

        if result.await?.is_some() {
            return Ok(ResolveReactRefreshResult::Found(request).cell());
        }
    }
    ReactRefreshResolvingIssue { path }.cell().emit();
    Ok(ResolveReactRefreshResult::NotFound.cell())
}

/// An issue that occurred while resolving the React Refresh runtime module.
#[titan_tasks::value(shared)]
pub struct ReactRefreshResolvingIssue {
    path: Vc<FileSystemPath>,
}

#[titan_tasks::value_impl]
impl Issue for ReactRefreshResolvingIssue {
    #[titan_tasks::function]
    fn severity(&self) -> Vc<IssueSeverity> {
        IssueSeverity::Warning.into()
    }

    #[titan_tasks::function]
    fn title(&self) -> Vc<StyledString> {
        StyledString::Text("Could not resolve React Refresh runtime".to_string()).cell()
    }

    #[titan_tasks::function]
    fn category(&self) -> Vc<String> {
        Vc::cell("other".to_string())
    }

    #[titan_tasks::function]
    fn file_path(&self) -> Vc<FileSystemPath> {
        self.path
    }

    #[titan_tasks::function]
    fn description(&self) -> Vc<OptionStyledString> {
        Vc::cell(Some(
            StyledString::Line(vec![
                StyledString::Text(
                    "React Refresh will be disabled.\nTo enable React Refresh, install the "
                        .to_string(),
                ),
                StyledString::Code("react-refresh".to_string()),
                StyledString::Text(" and ".to_string()),
                StyledString::Code("@next/react-refresh-utils".to_string()),
                StyledString::Text(" modules.".to_string()),
            ])
            .cell(),
        ))
    }
}
