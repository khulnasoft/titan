#![feature(future_join)]
#![feature(min_specialization)]

use std::path::Path;

use anyhow::{Context, Result};
use clap::Parser;
use titanpack_cli::{arguments::Arguments, register};
use titanpack_trace_utils::{
    exit::ExitGuard,
    raw_trace::RawTraceLayer,
    trace_writer::TraceWriter,
    tracing_presets::{
        TRACING_OVERVIEW_TARGETS, TRACING_TITANPACK_TARGETS, TRACING_TITAN_TASKS_TARGETS,
    },
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};

#[global_allocator]
static ALLOC: titan_tasks_malloc::TitanMalloc = titan_tasks_malloc::TitanMalloc;

fn main() {
    use titan_tasks_malloc::TitanMalloc;

    let args = Arguments::parse();

    let trace = std::env::var("TITANPACK_TRACING").ok();

    let _guard = if let Some(mut trace) = trace {
        // Trace presets
        match trace.as_str() {
            "overview" => {
                trace = TRACING_OVERVIEW_TARGETS.join(",");
            }
            "titanpack" => {
                trace = TRACING_TITANPACK_TARGETS.join(",");
            }
            "titan-tasks" => {
                trace = TRACING_TITAN_TASKS_TARGETS.join(",");
            }
            _ => {}
        }

        let subscriber = Registry::default();

        let subscriber = subscriber.with(EnvFilter::builder().parse(trace).unwrap());

        let internal_dir = args
            .dir()
            .unwrap_or_else(|| Path::new("."))
            .join(".titanpack");
        std::fs::create_dir_all(&internal_dir)
            .context("Unable to create .titanpack directory")
            .unwrap();
        let trace_file = internal_dir.join("trace.log");
        let trace_writer = std::fs::File::create(trace_file).unwrap();
        let (trace_writer, guard) = TraceWriter::new(trace_writer);
        let subscriber = subscriber.with(RawTraceLayer::new(trace_writer));

        let guard = ExitGuard::new(guard).unwrap();

        subscriber.init();

        Some(guard)
    } else {
        None
    };

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .on_thread_stop(|| {
            TitanMalloc::thread_stop();
        })
        .build()
        .unwrap()
        .block_on(main_inner(args))
        .unwrap();
}

async fn main_inner(args: Arguments) -> Result<()> {
    register();

    match args {
        Arguments::Build(args) => titanpack_cli::build::build(&args).await,
        Arguments::Dev(args) => titanpack_cli::dev::start_server(&args).await,
    }
}
