use anyhow::Result;
use titan_tasks::{ReadRef, TryJoinIterExt, Vc};
use titan_tasks_hash::{encode_hex, Xxh3Hash64Hasher};
use titanpack_core::version::Version;

use super::super::version::EcmascriptDevChunkVersion;

/// The version of a [`super::content::EcmascriptMergedChunkContent`]. This is
/// essentially a composite [`EcmascriptChunkVersion`].
#[titan_tasks::value(serialization = "none", shared)]
pub(super) struct EcmascriptDevMergedChunkVersion {
    #[titan_tasks(trace_ignore)]
    pub(super) versions: Vec<ReadRef<EcmascriptDevChunkVersion>>,
}

#[titan_tasks::value_impl]
impl Version for EcmascriptDevMergedChunkVersion {
    #[titan_tasks::function]
    async fn id(&self) -> Result<Vc<String>> {
        let mut hasher = Xxh3Hash64Hasher::new();
        hasher.write_value(self.versions.len());
        let sorted_ids = {
            let mut sorted_ids = self
                .versions
                .iter()
                .map(|version| async move { ReadRef::cell(version.clone()).id().await })
                .try_join()
                .await?;
            sorted_ids.sort();
            sorted_ids
        };
        for id in sorted_ids {
            hasher.write_value(id);
        }
        let hash = hasher.finish();
        let hex_hash = encode_hex(hash);
        Ok(Vc::cell(hex_hash))
    }
}
