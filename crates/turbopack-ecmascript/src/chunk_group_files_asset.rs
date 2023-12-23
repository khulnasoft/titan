use anyhow::{Context, Result};
use indexmap::IndexSet;
use titan_tasks::{TryJoinIterExt, ValueToString, Vc};
use titan_tasks_fs::{File, FileSystemPath};
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::{
        ChunkItem, ChunkType, ChunkableModule, ChunkingContext, ChunkingContextExt,
        EvaluatableAssets,
    },
    ident::AssetIdent,
    introspect::{
        module::IntrospectableModule, utils::content_to_details, Introspectable,
        IntrospectableChildren,
    },
    module::Module,
    output::{OutputAsset, OutputAssets},
    reference::{
        ModuleReference, ModuleReferences, SingleModuleReference, SingleOutputAssetReference,
    },
};

use crate::{
    chunk::{
        EcmascriptChunkItem, EcmascriptChunkItemContent, EcmascriptChunkPlaceable,
        EcmascriptChunkType, EcmascriptChunkingContext, EcmascriptExports,
    },
    utils::StringifyJs,
    EcmascriptModuleAsset,
};

#[titan_tasks::function]
fn modifier() -> Vc<String> {
    Vc::cell("chunk group files".to_string())
}

/// An asset that exports a list of chunk URLs by putting the [asset] into a
/// ChunkGroup with the provided ChunkingContext.
#[titan_tasks::value(shared)]
pub struct ChunkGroupFilesAsset {
    pub module: Vc<Box<dyn ChunkableModule>>,
    pub client_root: Vc<FileSystemPath>,
    pub chunking_context: Vc<Box<dyn ChunkingContext>>,
    pub runtime_entries: Option<Vc<EvaluatableAssets>>,
}

#[titan_tasks::function]
fn module_description() -> Vc<String> {
    Vc::cell("module".to_string())
}

#[titan_tasks::function]
fn runtime_entry_description() -> Vc<String> {
    Vc::cell("runtime entry".to_string())
}

#[titan_tasks::value_impl]
impl Module for ChunkGroupFilesAsset {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.module.ident().with_modifier(modifier())
    }

    #[titan_tasks::function]
    async fn references(&self) -> Result<Vc<ModuleReferences>> {
        let mut references: Vec<Vc<Box<dyn ModuleReference>>> = vec![Vc::upcast(
            SingleModuleReference::new(Vc::upcast(self.module), module_description()),
        )];

        if let Some(runtime_entries) = self.runtime_entries {
            references.extend(runtime_entries.await?.iter().map(|&entry| {
                Vc::upcast(SingleModuleReference::new(
                    Vc::upcast(entry),
                    runtime_entry_description(),
                ))
            }));
        }

        Ok(Vc::cell(references))
    }
}

#[titan_tasks::value_impl]
impl Asset for ChunkGroupFilesAsset {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        AssetContent::file(File::from("// Chunking only content".to_string()).into())
    }
}

#[titan_tasks::value_impl]
impl ChunkableModule for ChunkGroupFilesAsset {
    #[titan_tasks::function]
    async fn as_chunk_item(
        self: Vc<Self>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Result<Vc<Box<dyn titanpack_core::chunk::ChunkItem>>> {
        let this = self.await?;
        let chunking_context =
            Vc::try_resolve_downcast::<Box<dyn EcmascriptChunkingContext>>(chunking_context)
                .await?
                .context(
                    "chunking context must impl EcmascriptChunkingContext to use \
                     ChunkGroupFilesAsset",
                )?;
        Ok(Vc::upcast(
            ChunkGroupFilesChunkItem {
                chunking_context,
                client_root: this.client_root,
                inner: self,
            }
            .cell(),
        ))
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkPlaceable for ChunkGroupFilesAsset {
    #[titan_tasks::function]
    fn get_exports(&self) -> Vc<EcmascriptExports> {
        EcmascriptExports::Value.cell()
    }
}

#[titan_tasks::value]
struct ChunkGroupFilesChunkItem {
    chunking_context: Vc<Box<dyn EcmascriptChunkingContext>>,
    client_root: Vc<FileSystemPath>,
    inner: Vc<ChunkGroupFilesAsset>,
}

#[titan_tasks::value_impl]
impl ChunkGroupFilesChunkItem {
    #[titan_tasks::function]
    async fn chunks(self: Vc<Self>) -> Result<Vc<OutputAssets>> {
        let this = self.await?;
        let inner = this.inner.await?;
        let chunks = if let Some(ecma) =
            Vc::try_resolve_downcast_type::<EcmascriptModuleAsset>(inner.module).await?
        {
            inner.chunking_context.evaluated_chunk_group(
                inner.module.ident(),
                inner
                    .runtime_entries
                    .unwrap_or_else(EvaluatableAssets::empty)
                    .with_entry(Vc::upcast(ecma)),
            )
        } else {
            inner
                .chunking_context
                .root_chunk_group(Vc::upcast(inner.module))
        };
        Ok(chunks)
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkItem for ChunkGroupFilesChunkItem {
    #[titan_tasks::function]
    fn chunking_context(&self) -> Vc<Box<dyn EcmascriptChunkingContext>> {
        self.chunking_context
    }

    #[titan_tasks::function]
    async fn content(self: Vc<Self>) -> Result<Vc<EcmascriptChunkItemContent>> {
        let chunks = self.chunks();
        let this = self.await?;
        let module = this.inner.await?;
        let client_root = module.client_root.await?;
        let chunks_paths = chunks
            .await?
            .iter()
            .map(|chunk| chunk.ident().path())
            .try_join()
            .await?;
        let chunks_paths: Vec<_> = chunks_paths
            .iter()
            .filter_map(|path| client_root.get_path_to(path))
            .collect();
        Ok(EcmascriptChunkItemContent {
            inner_code: format!(
                "__titanpack_export_value__({:#});\n",
                StringifyJs(&chunks_paths)
            )
            .into(),
            ..Default::default()
        }
        .cell())
    }
}

#[titan_tasks::function]
fn chunk_group_chunk_reference_description() -> Vc<String> {
    Vc::cell("chunk group chunk".to_string())
}

#[titan_tasks::value_impl]
impl ChunkItem for ChunkGroupFilesChunkItem {
    #[titan_tasks::function]
    fn asset_ident(&self) -> Vc<AssetIdent> {
        self.inner.ident()
    }

    #[titan_tasks::function]
    async fn references(self: Vc<Self>) -> Result<Vc<ModuleReferences>> {
        let chunks = self.chunks();

        Ok(Vc::cell(
            chunks
                .await?
                .iter()
                .copied()
                .map(|chunk| {
                    SingleOutputAssetReference::new(
                        chunk,
                        chunk_group_chunk_reference_description(),
                    )
                })
                .map(Vc::upcast)
                .collect(),
        ))
    }

    #[titan_tasks::function]
    async fn chunking_context(&self) -> Vc<Box<dyn ChunkingContext>> {
        Vc::upcast(self.chunking_context)
    }

    #[titan_tasks::function]
    async fn ty(&self) -> Result<Vc<Box<dyn ChunkType>>> {
        Ok(Vc::upcast(
            Vc::<EcmascriptChunkType>::default().resolve().await?,
        ))
    }

    #[titan_tasks::function]
    fn module(&self) -> Vc<Box<dyn Module>> {
        Vc::upcast(self.inner)
    }
}

#[titan_tasks::value_impl]
impl Introspectable for ChunkGroupFilesAsset {
    #[titan_tasks::function]
    fn ty(&self) -> Vc<String> {
        Vc::cell("chunk group files asset".to_string())
    }

    #[titan_tasks::function]
    fn details(self: Vc<Self>) -> Vc<String> {
        content_to_details(self.content())
    }

    #[titan_tasks::function]
    fn title(self: Vc<Self>) -> Vc<String> {
        self.ident().to_string()
    }

    #[titan_tasks::function]
    async fn children(self: Vc<Self>) -> Result<Vc<IntrospectableChildren>> {
        let mut children = IndexSet::new();
        children.insert((
            Vc::cell("inner asset".to_string()),
            IntrospectableModule::new(Vc::upcast(self.await?.module)),
        ));
        Ok(Vc::cell(children))
    }
}
