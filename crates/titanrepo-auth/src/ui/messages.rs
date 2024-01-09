use titanrepo_ui::{BOLD, CYAN, UI};

pub fn print_cli_authorized(user: &str, ui: &UI) {
    println!(
        "
{} Titanrepo CLI authorized for {}
{}
{}
",
        ui.rainbow(">>> Success!"),
        user,
        ui.apply(
            CYAN.apply_to("To connect to your Remote Cache, run the following in any titanrepo:")
        ),
        ui.apply(BOLD.apply_to("  npx titan link"))
    );
}
