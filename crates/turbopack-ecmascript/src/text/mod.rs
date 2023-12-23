use anyhow::Result;
use titan_tasks::Vc;
use titan_tasks_fs::FileContent;
use titanpack_core::{
    asset::{Asset, AssetContent},
    ident::AssetIdent,
    source::Source,
};

use crate::utils::StringifyJs;

#[titan_tasks::function]
fn modifier() -> Vc<String> {
    Vc::cell("text content".to_string())
}

/// A source asset that exports the string content of an asset as the default
/// export of a JS module.
#[titan_tasks::value]
pub struct TextContentFileSource {
    pub source: Vc<Box<dyn Source>>,
}

#[titan_tasks::value_impl]
impl TextContentFileSource {
    #[titan_tasks::function]
    pub fn new(source: Vc<Box<dyn Source>>) -> Vc<Self> {
        TextContentFileSource { source }.cell()
    }
}

#[titan_tasks::value_impl]
impl Source for TextContentFileSource {
    #[titan_tasks::function]
    fn ident(&self) -> Vc<AssetIdent> {
        self.source
            .ident()
            .with_modifier(modifier())
            .rename_as("*.mjs".to_string())
    }
}

#[titan_tasks::value_impl]
impl Asset for TextContentFileSource {
    #[titan_tasks::function]
    async fn content(&self) -> Result<Vc<AssetContent>> {
        let source = self.source.content().file_content();
        let FileContent::Content(content) = &*source.await? else {
            return Ok(AssetContent::file(FileContent::NotFound.cell()));
        };
        let text = content.content().to_str()?;
        let code = format!("export default {};", StringifyJs(&text));
        let content = FileContent::Content(code.into()).cell();
        Ok(AssetContent::file(content))
    }
}
