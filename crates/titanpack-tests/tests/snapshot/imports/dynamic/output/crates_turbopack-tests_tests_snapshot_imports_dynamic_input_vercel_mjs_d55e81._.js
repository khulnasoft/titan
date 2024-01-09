(globalThis.TITANPACK = globalThis.TITANPACK || []).push([
  "output/crates_titanpack-tests_tests_snapshot_imports_dynamic_input_vercel_mjs_d55e81._.js",
  {
    "[project]/crates/titanpack-tests/tests/snapshot/imports/dynamic/input/vercel.mjs [test] (ecmascript, loader)":
      ({
        r: __titanpack_require__,
        f: __titanpack_require_context__,
        i: __titanpack_import__,
        s: __titanpack_esm__,
        v: __titanpack_export_value__,
        n: __titanpack_export_namespace__,
        c: __titanpack_cache__,
        l: __titanpack_load__,
        j: __titanpack_dynamic__,
        p: __titanpack_resolve_absolute_path__,
        U: __titanpack_relative_url__,
        R: __titanpack_resolve_module_id_path__,
        g: global,
        __dirname,
      }) =>
        (() => {
          __titanpack_export_value__((__titanpack_import__) => {
            return Promise.all(
              [
                "output/crates_titanpack-tests_tests_snapshot_imports_dynamic_input_vercel_mjs_b1b725._.js",
                "output/crates_titanpack-tests_tests_snapshot_imports_dynamic_input_vercel_mjs_c3bc31._.js",
              ].map((chunk) => __titanpack_load__(chunk))
            )
              .then(() => {
                return __titanpack_require__(
                  "[project]/crates/titanpack-tests/tests/snapshot/imports/dynamic/input/vercel.mjs [test] (ecmascript, manifest chunk)"
                );
              })
              .then((chunks) => {
                return Promise.all(
                  chunks.map((chunk) => __titanpack_load__(chunk))
                );
              })
              .then(() => {
                return __titanpack_import__(
                  "[project]/crates/titanpack-tests/tests/snapshot/imports/dynamic/input/vercel.mjs [test] (ecmascript)"
                );
              });
          });
        })(),
  },
]);
