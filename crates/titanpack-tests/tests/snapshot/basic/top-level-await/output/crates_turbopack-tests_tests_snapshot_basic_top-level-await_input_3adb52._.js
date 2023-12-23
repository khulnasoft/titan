(globalThis.TITANPACK = globalThis.TITANPACK || []).push(["output/crates_titanpack-tests_tests_snapshot_basic_top-level-await_input_3adb52._.js", {

"[project]/crates/titanpack-tests/tests/snapshot/basic/top-level-await/input/Actions.js [test] (ecmascript)": (({ r: __titanpack_require__, f: __titanpack_require_context__, i: __titanpack_import__, s: __titanpack_esm__, v: __titanpack_export_value__, n: __titanpack_export_namespace__, c: __titanpack_cache__, l: __titanpack_load__, j: __titanpack_dynamic__, p: __titanpack_resolve_absolute_path__, U: __titanpack_relative_url__, R: __titanpack_resolve_module_id_path__, g: global, __dirname, k: __titanpack_refresh__ }) => (() => {
"use strict";

// import() doesn't care about whether a module is an async module or not
__titanpack_esm__({
    "AlternativeCreateUserAction": ()=>AlternativeCreateUserAction,
    "CreateUserAction": ()=>CreateUserAction
});
const UserApi = __titanpack_require__("[project]/crates/titanpack-tests/tests/snapshot/basic/top-level-await/input/UserAPI.js [test] (ecmascript, loader)")(__titanpack_import__);
const CreateUserAction = async (name)=>{
    console.log("Creating user", name);
    // These are normal awaits, because they are in an async function
    const { createUser } = await UserApi;
    await createUser(name);
};
const AlternativeCreateUserAction = async (name)=>{
    const { createUser } = await __titanpack_require__("[project]/crates/titanpack-tests/tests/snapshot/basic/top-level-await/input/UserAPI.js [test] (ecmascript, loader)")(__titanpack_import__);
    await createUser(name);
}; // Note: Using await import() at top-level doesn't make much sense
 //       except in rare cases. It will import modules sequentially.

})()),
"[project]/crates/titanpack-tests/tests/snapshot/basic/top-level-await/input/index.js [test] (ecmascript)": (({ r: __titanpack_require__, f: __titanpack_require_context__, i: __titanpack_import__, s: __titanpack_esm__, v: __titanpack_export_value__, n: __titanpack_export_namespace__, c: __titanpack_cache__, l: __titanpack_load__, j: __titanpack_dynamic__, p: __titanpack_resolve_absolute_path__, U: __titanpack_relative_url__, R: __titanpack_resolve_module_id_path__, g: global, __dirname, k: __titanpack_refresh__ }) => (() => {
"use strict";

__titanpack_esm__({});
var __TITANPACK__imported__module__$5b$project$5d2f$crates$2f$titanpack$2d$tests$2f$tests$2f$snapshot$2f$basic$2f$top$2d$level$2d$await$2f$input$2f$Actions$2e$js__$5b$test$5d$__$28$ecmascript$29$__ = __titanpack_import__("[project]/crates/titanpack-tests/tests/snapshot/basic/top-level-await/input/Actions.js [test] (ecmascript)");
"__TITANPACK__ecmascript__hoisting__location__";
;
(async ()=>{
    await __TITANPACK__imported__module__$5b$project$5d2f$crates$2f$titanpack$2d$tests$2f$tests$2f$snapshot$2f$basic$2f$top$2d$level$2d$await$2f$input$2f$Actions$2e$js__$5b$test$5d$__$28$ecmascript$29$__["CreateUserAction"]("John");
    console.log("created user John");
})();

})()),
}]);

//# sourceMappingURL=crates_titanpack-tests_tests_snapshot_basic_top-level-await_input_3adb52._.js.map