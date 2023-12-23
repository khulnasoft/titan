mod change_detector;
mod filter;
mod simple_glob;
mod target_selector;

use std::collections::HashSet;

use filter::{FilterResolver, PackageInference};
use titanpath::AbsoluteSystemPath;
use titanrepo_repository::package_graph::{PackageGraph, WorkspaceName};
use titanrepo_scm::SCM;

use crate::opts::ScopeOpts;
pub use crate::run::scope::filter::ResolutionError;

#[tracing::instrument(skip(opts, pkg_graph, scm))]
pub fn resolve_packages(
    opts: &ScopeOpts,
    titan_root: &AbsoluteSystemPath,
    pkg_graph: &PackageGraph,
    scm: &SCM,
) -> Result<(HashSet<WorkspaceName>, bool), ResolutionError> {
    let pkg_inference = opts.pkg_inference_root.as_ref().map(|pkg_inference_path| {
        PackageInference::calculate(titan_root, pkg_inference_path, pkg_graph)
    });

    FilterResolver::new(opts, pkg_graph, titan_root, pkg_inference, scm)
        .resolve(&opts.get_filters())
}
