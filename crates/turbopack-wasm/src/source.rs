use anyhow::Result;
use serde::{Deserialize, Serialize};
use titan_tasks::{trace::TraceRawVcs, TaskInput, Vc};
use titan_tasks_fs::{File, FileContent};
use titanpack_core::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    source::Source,
};

#[derive(
    PartialOrd,
    Ord,
    Eq,
    PartialEq,
    Hash,
    Debug,
    Copy,
    Clone,
    Serialize,
    Deserialize,
    TaskInput,
    TraceRawVcs,
)]
pub enum WebAssemblySourceType {
    /// Binary WebAssembly files (.wasm).
    Binary,
    /// WebAssembly text format (.wat).
    Text,
}

/// Returns the raw binary WebAssembly source or the assembled version of a text
/// format source.
#[titan_tasks::value]
#[derive(Clone)]
pub struct WebAssemblySource {
    source: Vc<Box<dyn Source>>,
    source_ty: WebAssemblySourceType,
}

#[titan_tasks::value_impl]
impl WebAssemblySource {
    #[titan_tasks::function]
    pub fn new(source: Vc<Box<dyn Source>>, source_ty: WebAssemblySourceType) -> Vc<Self> {
        Self::cell(WebAssemblySource { source, source_ty })
    }
}

#[titan_tasks::value_impl]
impl Source for WebAssemblySource {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        match self.source_ty {
            WebAssemblySourceType::Binary => self.source.ident(),
            WebAssemblySourceType::Text => self
                .source
                .ident()
                .with_path(self.source.ident().path().append("_.wasm".to_string())),
        }
    }
}

#[titan_tasks::value_impl]
impl Asset for WebAssemblySource {
    #[titan_tasks::function]
    async fn content(&self) -> Result<Vc<AssetContent>> {
        let content = match self.source_ty {
            WebAssemblySourceType::Binary => return Ok(self.source.content()),
            WebAssemblySourceType::Text => self.source.content(),
        };

        let content = content.file_content().await?;

        let FileContent::Content(file) = &*content else {
            return Ok(AssetContent::file(FileContent::NotFound.cell()));
        };

        let bytes = file.content().to_bytes()?;
        let parsed = wat::parse_bytes(&bytes)?;

        Ok(AssetContent::file(File::from(&*parsed).into()))
    }
}
