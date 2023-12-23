#![feature(min_specialization)]

use std::sync::Arc;

use anyhow::Result;
use clap::Parser;
use node_file_trace::{start, Args};

#[global_allocator]
static ALLOC: titan_tasks_malloc::TitanMalloc = titan_tasks_malloc::TitanMalloc;

#[tokio::main]
async fn main() -> Result<()> {
    #[cfg(feature = "tokio_console")]
    console_subscriber::init();
    let args = Arc::new(Args::parse());
    let should_print = matches!(&*args, Args::Print { .. });
    let result = start(args, None, None, None).await?;
    if should_print {
        for file in result.iter() {
            println!("{}", file);
        }
    }
    Ok(())
}
