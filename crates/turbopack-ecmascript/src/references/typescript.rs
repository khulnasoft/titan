use anyhow::Result;
use titan_tasks::{Value, ValueToString, Vc};
use titan_tasks_fs::FileSystemPath;
use titanpack_core::{
    context::AssetContext,
    file_source::FileSource,
    reference::ModuleReference,
    reference_type::{ReferenceType, TypeScriptReferenceSubType},
    resolve::{origin::ResolveOrigin, parse::Request, ModuleResolveResult},
};

use crate::typescript::{resolve::type_resolve, TsConfigModuleAsset};

#[titan_tasks::value]
#[derive(Hash, Clone, Debug)]
pub struct TsConfigReference {
    pub tsconfig: Vc<FileSystemPath>,
    pub origin: Vc<Box<dyn ResolveOrigin>>,
}

#[titan_tasks::value_impl]
impl TsConfigReference {
    #[titan_tasks::function]
    pub fn new(origin: Vc<Box<dyn ResolveOrigin>>, tsconfig: Vc<FileSystemPath>) -> Vc<Self> {
        Self::cell(TsConfigReference { tsconfig, origin })
    }
}

#[titan_tasks::value_impl]
impl ModuleReference for TsConfigReference {
    #[titan_tasks::function]
    fn resolve_reference(&self) -> Vc<ModuleResolveResult> {
        ModuleResolveResult::module(Vc::upcast(TsConfigModuleAsset::new(
            self.origin,
            Vc::upcast(FileSource::new(self.tsconfig)),
        )))
        .into()
    }
}

#[titan_tasks::value_impl]
impl ValueToString for TsConfigReference {
    #[titan_tasks::function]
    async fn to_string(&self) -> Result<Vc<String>> {
        Ok(Vc::cell(format!(
            "tsconfig {}",
            self.tsconfig.to_string().await?,
        )))
    }
}

#[titan_tasks::value]
#[derive(Hash, Debug)]
pub struct TsReferencePathAssetReference {
    pub origin: Vc<Box<dyn ResolveOrigin>>,
    pub path: String,
}

#[titan_tasks::value_impl]
impl TsReferencePathAssetReference {
    #[titan_tasks::function]
    pub fn new(origin: Vc<Box<dyn ResolveOrigin>>, path: String) -> Vc<Self> {
        Self::cell(TsReferencePathAssetReference { origin, path })
    }
}

#[titan_tasks::value_impl]
impl ModuleReference for TsReferencePathAssetReference {
    #[titan_tasks::function]
    async fn resolve_reference(&self) -> Result<Vc<ModuleResolveResult>> {
        Ok(
            if let Some(path) = &*self
                .origin
                .origin_path()
                .parent()
                .try_join(self.path.clone())
                .await?
            {
                let module = self
                    .origin
                    .asset_context()
                    .process(
                        Vc::upcast(FileSource::new(*path)),
                        Value::new(ReferenceType::TypeScript(
                            TypeScriptReferenceSubType::Undefined,
                        )),
                    )
                    .module();
                ModuleResolveResult::module(module).cell()
            } else {
                ModuleResolveResult::unresolveable().cell()
            },
        )
    }
}

#[titan_tasks::value_impl]
impl ValueToString for TsReferencePathAssetReference {
    #[titan_tasks::function]
    async fn to_string(&self) -> Result<Vc<String>> {
        Ok(Vc::cell(format!(
            "typescript reference path comment {}",
            self.path,
        )))
    }
}

#[titan_tasks::value]
#[derive(Hash, Debug)]
pub struct TsReferenceTypeAssetReference {
    pub origin: Vc<Box<dyn ResolveOrigin>>,
    pub module: String,
}

#[titan_tasks::value_impl]
impl TsReferenceTypeAssetReference {
    #[titan_tasks::function]
    pub fn new(origin: Vc<Box<dyn ResolveOrigin>>, module: String) -> Vc<Self> {
        Self::cell(TsReferenceTypeAssetReference { origin, module })
    }
}

#[titan_tasks::value_impl]
impl ModuleReference for TsReferenceTypeAssetReference {
    #[titan_tasks::function]
    fn resolve_reference(&self) -> Vc<ModuleResolveResult> {
        type_resolve(
            self.origin,
            Request::module(
                self.module.clone(),
                Value::new("".to_string().into()),
                Vc::<String>::default(),
            ),
        )
    }
}

#[titan_tasks::value_impl]
impl ValueToString for TsReferenceTypeAssetReference {
    #[titan_tasks::function]
    async fn to_string(&self) -> Result<Vc<String>> {
        Ok(Vc::cell(format!(
            "typescript reference type comment {}",
            self.module,
        )))
    }
}
