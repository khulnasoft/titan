#[macro_export]
macro_rules! register {
    () => {
        lazy_static::lazy_static! {
            static ref REGISTER: () = {
                titan_tasks::register();
                include!(concat!(env!("OUT_DIR"), "/register_test_", module_path!(), ".rs"));
            };
        }
    };
}

#[macro_export]
macro_rules! run {
    ($($stmt:tt)+) => {{
        use titan_tasks::TitanTasks;
        use titan_tasks_memory::MemoryBackend;
        *REGISTER;
        let tt = TitanTasks::new(MemoryBackend::default());
        tt.run_once(async {
            $($stmt)+
            Ok(())
        })
        .await.unwrap();
    }};
}
