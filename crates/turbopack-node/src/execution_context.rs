use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_env::ProcessEnv;
use titan_tasks_fs::FileSystemPath;
use titanpack_core::chunk::ChunkingContext;

#[titan_tasks::value]
pub struct ExecutionContext {
    pub project_path: Vc<FileSystemPath>,
    pub chunking_context: Vc<Box<dyn ChunkingContext>>,
    pub env: Vc<Box<dyn ProcessEnv>>,
}

#[titan_tasks::value_impl]
impl ExecutionContext {
    #[titan_tasks::function]
    pub fn new(
        project_path: Vc<FileSystemPath>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
        env: Vc<Box<dyn ProcessEnv>>,
    ) -> Vc<Self> {
        ExecutionContext {
            project_path,
            chunking_context,
            env,
        }
        .cell()
    }

    #[titan_tasks::function]
    pub async fn project_path(self: Vc<Self>) -> Result<Vc<FileSystemPath>> {
        Ok(self.await?.project_path)
    }

    #[titan_tasks::function]
    pub async fn chunking_context(self: Vc<Self>) -> Result<Vc<Box<dyn ChunkingContext>>> {
        Ok(self.await?.chunking_context)
    }

    #[titan_tasks::function]
    pub async fn env(self: Vc<Self>) -> Result<Vc<Box<dyn ProcessEnv>>> {
        Ok(self.await?.env)
    }
}
