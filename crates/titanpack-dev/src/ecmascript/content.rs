use std::io::Write;

use anyhow::{bail, Result};
use indoc::writedoc;
use titan_tasks::Vc;
use titan_tasks_fs::File;
use titanpack_core::{
    asset::AssetContent,
    chunk::{ChunkingContext, ModuleId},
    code_builder::{Code, CodeBuilder},
    output::OutputAsset,
    source_map::{GenerateSourceMap, OptionSourceMap},
    version::{MergeableVersionedContent, Version, VersionedContent, VersionedContentMerger},
};
use titanpack_ecmascript::{chunk::EcmascriptChunkContent, utils::StringifyJs};

use super::{
    chunk::EcmascriptDevChunk, content_entry::EcmascriptDevChunkContentEntries,
    merged::merger::EcmascriptDevChunkContentMerger, version::EcmascriptDevChunkVersion,
};
use crate::DevChunkingContext;

#[titan_tasks::value(serialization = "none")]
pub(super) struct EcmascriptDevChunkContent {
    pub(super) entries: Vc<EcmascriptDevChunkContentEntries>,
    pub(super) chunking_context: Vc<DevChunkingContext>,
    pub(super) chunk: Vc<EcmascriptDevChunk>,
}

#[titan_tasks::value_impl]
impl EcmascriptDevChunkContent {
    #[titan_tasks::function]
    pub(crate) async fn new(
        chunking_context: Vc<DevChunkingContext>,
        chunk: Vc<EcmascriptDevChunk>,
        content: Vc<EcmascriptChunkContent>,
    ) -> Result<Vc<Self>> {
        let entries = EcmascriptDevChunkContentEntries::new(content)
            .resolve()
            .await?;
        Ok(EcmascriptDevChunkContent {
            entries,
            chunking_context,
            chunk,
        }
        .cell())
    }
}

#[titan_tasks::value_impl]
impl EcmascriptDevChunkContent {
    #[titan_tasks::function]
    pub(crate) async fn own_version(self: Vc<Self>) -> Result<Vc<EcmascriptDevChunkVersion>> {
        let this = self.await?;
        Ok(EcmascriptDevChunkVersion::new(
            this.chunking_context.output_root(),
            this.chunk.ident().path(),
            this.entries,
        ))
    }

    #[titan_tasks::function]
    async fn code(self: Vc<Self>) -> Result<Vc<Code>> {
        let this = self.await?;
        let output_root = this.chunking_context.output_root().await?;
        let chunk_path = this.chunk.ident().path().await?;
        let chunk_server_path = if let Some(path) = output_root.get_path_to(&chunk_path) {
            path
        } else {
            bail!(
                "chunk path {} is not in output root {}",
                chunk_path.to_string(),
                output_root.to_string()
            );
        };
        let mut code = CodeBuilder::default();

        // When a chunk is executed, it will either register itself with the current
        // instance of the runtime, or it will push itself onto the list of pending
        // chunks (`self.TITANPACK`).
        //
        // When the runtime executes (see the `evaluate` module), it will pick up and
        // register all pending chunks, and replace the list of pending chunks
        // with itself so later chunks can register directly with it.
        writedoc!(
            code,
            r#"
                (globalThis.TITANPACK = globalThis.TITANPACK || []).push([{chunk_path}, {{
            "#,
            chunk_path = StringifyJs(chunk_server_path)
        )?;

        for (id, entry) in this.entries.await?.iter() {
            write!(code, "\n{}: ", StringifyJs(&id))?;
            code.push_code(&*entry.code.await?);
            write!(code, ",")?;
        }

        write!(code, "\n}}]);")?;

        if code.has_source_map() {
            let filename = chunk_path.file_name();
            write!(code, "\n\n//# sourceMappingURL={}.map", filename)?;
        }

        Ok(code.build().cell())
    }
}

#[titan_tasks::value_impl]
impl VersionedContent for EcmascriptDevChunkContent {
    #[titan_tasks::function]
    async fn content(self: Vc<Self>) -> Result<Vc<AssetContent>> {
        let code = self.code().await?;
        Ok(AssetContent::file(
            File::from(code.source_code().clone()).into(),
        ))
    }

    #[titan_tasks::function]
    fn version(self: Vc<Self>) -> Vc<Box<dyn Version>> {
        Vc::upcast(self.own_version())
    }
}

#[titan_tasks::value_impl]
impl MergeableVersionedContent for EcmascriptDevChunkContent {
    #[titan_tasks::function]
    fn get_merger(&self) -> Vc<Box<dyn VersionedContentMerger>> {
        Vc::upcast(EcmascriptDevChunkContentMerger::new())
    }
}

#[titan_tasks::value_impl]
impl GenerateSourceMap for EcmascriptDevChunkContent {
    #[titan_tasks::function]
    fn generate_source_map(self: Vc<Self>) -> Vc<OptionSourceMap> {
        self.code().generate_source_map()
    }

    #[titan_tasks::function]
    async fn by_section(&self, section: String) -> Result<Vc<OptionSourceMap>> {
        // Weirdly, the ContentSource will have already URL decoded the ModuleId, and we
        // can't reparse that via serde.
        if let Ok(id) = ModuleId::parse(&section) {
            for (entry_id, entry) in self.entries.await?.iter() {
                if id == **entry_id {
                    let sm = entry.code.generate_source_map();
                    return Ok(sm);
                }
            }
        }

        Ok(Vc::cell(None))
    }
}
