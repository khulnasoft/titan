use std::collections::BTreeMap;

use anyhow::{bail, Context, Result};
use titan_tasks::Vc;
use titanpack_core::{
    asset::{Asset, AssetContent},
    chunk::{ChunkableModule, ChunkingContext},
    ident::AssetIdent,
    module::Module,
    reference::ModuleReferences,
    resolve::ModulePart,
};

use super::chunk_item::EcmascriptModuleLocalsChunkItem;
use crate::{
    chunk::{EcmascriptChunkPlaceable, EcmascriptChunkingContext, EcmascriptExports},
    references::esm::{EsmExport, EsmExports},
    EcmascriptModuleAsset,
};

/// A module derived from an original ecmascript module that only contains the
/// local declarations, but excludes all reexports. These reexports are exposed
/// from [EcmascriptModuleFacadeModule] instead.
#[titan_tasks::value]
pub struct EcmascriptModuleLocalsModule {
    pub module: Vc<EcmascriptModuleAsset>,
}

#[titan_tasks::value_impl]
impl EcmascriptModuleLocalsModule {
    #[titan_tasks::function]
    pub fn new(module: Vc<EcmascriptModuleAsset>) -> Vc<Self> {
        EcmascriptModuleLocalsModule { module }.cell()
    }
}

#[titan_tasks::value_impl]
impl Module for EcmascriptModuleLocalsModule {
    #[titan_tasks::function]
    async fn ident(&self) -> Result<Vc<AssetIdent>> {
        let inner = self.module.ident();

        Ok(inner.with_part(ModulePart::locals()))
    }

    #[titan_tasks::function]
    async fn references(&self) -> Result<Vc<ModuleReferences>> {
        let result = self.module.failsafe_analyze().await?;
        Ok(result.local_references)
    }
}

#[titan_tasks::value_impl]
impl Asset for EcmascriptModuleLocalsModule {
    #[titan_tasks::function]
    fn content(&self) -> Vc<AssetContent> {
        // This is not reachable because EcmascriptModuleLocalsModule implements
        // ChunkableModule and ChunkableModule::as_chunk_item is called instead.
        todo!("EcmascriptModuleLocalsModule::content is not implemented")
    }
}

#[titan_tasks::value_impl]
impl EcmascriptChunkPlaceable for EcmascriptModuleLocalsModule {
    #[titan_tasks::function]
    async fn get_exports(&self) -> Result<Vc<EcmascriptExports>> {
        let result = self.module.failsafe_analyze().await?;
        let EcmascriptExports::EsmExports(exports) = *result.exports.await? else {
            bail!("EcmascriptModuleLocalsModule must only be used on modules with EsmExports");
        };
        let esm_exports = exports.await?;
        let mut exports = BTreeMap::new();

        for (name, export) in &esm_exports.exports {
            match export {
                EsmExport::ImportedBinding(..) | EsmExport::ImportedNamespace(..) => {
                    // not included in locals module
                }
                EsmExport::LocalBinding(name) => {
                    exports.insert(name.clone(), EsmExport::LocalBinding(name.clone()));
                }
                EsmExport::Error => {
                    exports.insert(name.clone(), EsmExport::Error);
                }
            }
        }

        let exports = EsmExports {
            exports,
            star_exports: vec![],
        }
        .cell();
        Ok(EcmascriptExports::EsmExports(exports).cell())
    }

    #[titan_tasks::function]
    fn is_marked_as_side_effect_free(&self) -> Vc<bool> {
        self.module.is_marked_as_side_effect_free()
    }
}

#[titan_tasks::value_impl]
impl ChunkableModule for EcmascriptModuleLocalsModule {
    #[titan_tasks::function]
    async fn as_chunk_item(
        self: Vc<Self>,
        chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Result<Vc<Box<dyn titanpack_core::chunk::ChunkItem>>> {
        let chunking_context =
            Vc::try_resolve_downcast::<Box<dyn EcmascriptChunkingContext>>(chunking_context)
                .await?
                .context(
                    "chunking context must impl EcmascriptChunkingContext to use \
                     EcmascriptModuleLocalsModule",
                )?;
        Ok(Vc::upcast(
            EcmascriptModuleLocalsChunkItem {
                module: self,
                chunking_context,
            }
            .cell(),
        ))
    }
}
