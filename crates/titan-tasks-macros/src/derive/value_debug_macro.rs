use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

/// This macro generates the implementation of the `ValueDebug` trait for a
/// given type.
///
/// This requires the type to implement the `ValueDebugFormat` trait.
pub fn derive_value_debug(input: TokenStream) -> TokenStream {
    let derive_input = parse_macro_input!(input as DeriveInput);
    let ident = &derive_input.ident;
    quote! {
        #[titan_tasks::value_impl]
        impl titan_tasks::debug::ValueDebug for #ident {
            #[titan_tasks::function]
            async fn dbg(&self) -> anyhow::Result<titan_tasks::Vc<titan_tasks::debug::ValueDebugString>> {
                titan_tasks::debug::ValueDebugFormat::value_debug_format(self, usize::MAX).try_to_value_debug_string().await
            }

            #[titan_tasks::function]
            async fn dbg_depth(&self, depth: usize) -> anyhow::Result<titan_tasks::Vc<titan_tasks::debug::ValueDebugString>> {
                titan_tasks::debug::ValueDebugFormat::value_debug_format(self, depth).try_to_value_debug_string().await
            }
        }
    }
    .into()
}
