use titan_tasks::Vc;
use titanpack_core::chunk::ChunkingContext;

use crate::chunk::CssImport;

/// impl of code generation inferred from a ModuleReference.
/// This is rust only and can't be implemented by non-rust plugins.
#[titan_tasks::value(
    shared,
    serialization = "none",
    eq = "manual",
    into = "new",
    cell = "new"
)]
pub struct CodeGeneration {
    #[titan_tasks(debug_ignore, trace_ignore)]
    pub imports: Vec<CssImport>,
}

#[titan_tasks::value_trait]
pub trait CodeGenerateable {
    fn code_generation(
        self: Vc<Self>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Vc<CodeGeneration>;
}

#[titan_tasks::value(transparent)]
pub struct CodeGenerateables(Vec<Vc<Box<dyn CodeGenerateable>>>);
