use std::fmt::Write;

use anyhow::Result;
use titan_tasks::{ValueToString, Vc};
use titan_tasks_fs::File;
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::{Chunk, ChunkItem, ChunkingContext},
    code_builder::{Code, CodeBuilder},
    ident::AssetIdent,
    introspect::Introspectable,
    output::{OutputAsset, OutputAssets},
    source_map::{GenerateSourceMap, OptionSourceMap},
};

use super::source_map::SingleItemCssChunkSourceMapAsset;
use crate::chunk::CssChunkItem;

/// A CSS chunk that only contains a single item. This is used for selectively
/// loading CSS modules that are part of a larger chunk in development mode, and
/// avoiding rule duplication.
#[titan_tasks::value]
pub struct SingleItemCssChunk {
    chunking_context: Vc<Box<dyn ChunkingContext>>,
    item: Vc<Box<dyn CssChunkItem>>,
}

#[titan_tasks::value_impl]
impl SingleItemCssChunk {
    /// Creates a new [`Vc<SingleItemCssChunk>`].
    #[titan_tasks::function]
    pub fn new(
        chunking_context: Vc<Box<dyn ChunkingContext>>,
        item: Vc<Box<dyn CssChunkItem>>,
    ) -> Vc<Self> {
        SingleItemCssChunk {
            chunking_context,
            item,
        }
        .cell()
    }
}

#[titan_tasks::value_impl]
impl SingleItemCssChunk {
    #[titan_tasks::function]
    async fn code(self: Vc<Self>) -> Result<Vc<Code>> {
        use std::io::Write;

        let this = self.await?;
        let mut code = CodeBuilder::default();

        let id = &*this.item.id().await?;

        writeln!(code, "/* {} */", id)?;
        let content = this.item.content().await?;
        code.push_source(&content.inner_code, content.source_map.map(Vc::upcast));

        if *this
            .chunking_context
            .reference_chunk_source_maps(Vc::upcast(self))
            .await?
            && code.has_source_map()
        {
            let chunk_path = self.path().await?;
            write!(
                code,
                "\n/*# sourceMappingURL={}.map*/",
                chunk_path.file_name()
            )?;
        }

        let c = code.build().cell();
        Ok(c)
    }
}

#[titan_tasks::value_impl]
impl Chunk for SingleItemCssChunk {
    #[titan_tasks::function]
    fn ident(self: Vc<Self>) -> Vc<AssetIdent> {
        let self_as_output_asset: Vc<Box<dyn OutputAsset>> = Vc::upcast(self);
        self_as_output_asset.ident()
    }

    #[titan_tasks::function]
    fn chunking_context(&self) -> Vc<Box<dyn ChunkingContext>> {
        self.chunking_context
    }
}

#[titan_tasks::function]
fn single_item_modifier() -> Vc<String> {
    Vc::cell("single item css chunk".to_string())
}

#[titan_tasks::value_impl]
impl OutputAsset for SingleItemCssChunk {
    #[titan_tasks::function]
    async fn ident(&self) -> Result<Vc<AssetIdent>> {
        Ok(AssetIdent::from_path(
            self.chunking_context.chunk_path(
                self.item
                    .asset_ident()
                    .with_modifier(single_item_modifier()),
                ".css".to_string(),
            ),
        ))
    }

    #[titan_tasks::function]
    async fn references(self: Vc<Self>) -> Result<Vc<OutputAssets>> {
        let this = self.await?;
        let mut references = Vec::new();
        if *this
            .chunking_context
            .reference_chunk_source_maps(Vc::upcast(self))
            .await?
        {
            references.push(Vc::upcast(SingleItemCssChunkSourceMapAsset::new(self)));
        }
        Ok(Vc::cell(references))
    }
}

#[titan_tasks::value_impl]
impl Asset for SingleItemCssChunk {
    #[titan_tasks::function]
    async fn content(self: Vc<Self>) -> Result<Vc<AssetContent>> {
        let code = self.code().await?;
        Ok(AssetContent::file(
            File::from(code.source_code().clone()).into(),
        ))
    }
}

#[titan_tasks::value_impl]
impl GenerateSourceMap for SingleItemCssChunk {
    #[titan_tasks::function]
    fn generate_source_map(self: Vc<Self>) -> Vc<OptionSourceMap> {
        self.code().generate_source_map()
    }
}

#[titan_tasks::function]
fn introspectable_type() -> Vc<String> {
    Vc::cell("single asset css chunk".to_string())
}

#[titan_tasks::function]
fn entry_module_key() -> Vc<String> {
    Vc::cell("entry module".to_string())
}

#[titan_tasks::value_impl]
impl Introspectable for SingleItemCssChunk {
    #[titan_tasks::function]
    fn ty(&self) -> Vc<String> {
        introspectable_type()
    }

    #[titan_tasks::function]
    fn title(self: Vc<Self>) -> Vc<String> {
        self.path().to_string()
    }

    #[titan_tasks::function]
    async fn details(self: Vc<Self>) -> Result<Vc<String>> {
        let this = self.await?;
        let mut details = String::new();
        write!(
            details,
            "Chunk item: {}",
            this.item.asset_ident().to_string().await?
        )?;
        Ok(Vc::cell(details))
    }
}
