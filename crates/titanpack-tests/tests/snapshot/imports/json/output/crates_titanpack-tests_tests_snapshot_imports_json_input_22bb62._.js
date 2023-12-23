(globalThis.TITANPACK = globalThis.TITANPACK || []).push([
  "output/crates_titanpack-tests_tests_snapshot_imports_json_input_22bb62._.js",
  {
    "[project]/crates/titanpack-tests/tests/snapshot/imports/json/input/package.json (json)":
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
          __titanpack_export_value__(JSON.parse('{"name":"json-snapshot"}'));
        })(),
    "[project]/crates/titanpack-tests/tests/snapshot/imports/json/input/invalid.json (json)":
      () => {
        {
          throw new Error(
            'An error occurred while generating the chunk item [project]/crates/titanpack-tests/tests/snapshot/imports/json/input/invalid.json (json)\n\nCaused by:\n- Unable to make a module from invalid JSON: expected `,` or `}` at line 3 column 26\n\nDebug info:\n- An error occurred while generating the chunk item [project]/crates/titanpack-tests/tests/snapshot/imports/json/input/invalid.json (json)\n- Execution of EcmascriptChunkItemContent::module_factory failed\n- Execution of <JsonChunkItem as EcmascriptChunkItem>::content failed\n- Unable to make a module from invalid JSON: expected `,` or `}` at line 3 column 26\n    at nested.?\n       1 | {\n       2 |   "nested": {\n         |                          v\n       3 +     "this-is": "invalid" // lint-staged will remove trailing commas, so here\'s a comment\n         |                          ^\n       4 |   }\n       5 | }'
          );
        }
      },
    "[project]/crates/titanpack-tests/tests/snapshot/imports/json/input/index.js [test] (ecmascript)":
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
        k: __titanpack_refresh__,
      }) =>
        (() => {
          "use strict";

          __titanpack_esm__({});
          var __TITANPACK__imported__module__$5b$project$5d2f$crates$2f$titanpack$2d$tests$2f$tests$2f$snapshot$2f$imports$2f$json$2f$input$2f$package$2e$json__$28$json$29$__ =
            __titanpack_import__(
              "[project]/crates/titanpack-tests/tests/snapshot/imports/json/input/package.json (json)"
            );
          var __TITANPACK__imported__module__$5b$project$5d2f$crates$2f$titanpack$2d$tests$2f$tests$2f$snapshot$2f$imports$2f$json$2f$input$2f$invalid$2e$json__$28$json$29$__ =
            __titanpack_import__(
              "[project]/crates/titanpack-tests/tests/snapshot/imports/json/input/invalid.json (json)"
            );
          ("__TITANPACK__ecmascript__hoisting__location__");
          console.log(
            __TITANPACK__imported__module__$5b$project$5d2f$crates$2f$titanpack$2d$tests$2f$tests$2f$snapshot$2f$imports$2f$json$2f$input$2f$package$2e$json__$28$json$29$__[
              "default"
            ].name
          );
          console.log(
            __TITANPACK__imported__module__$5b$project$5d2f$crates$2f$titanpack$2d$tests$2f$tests$2f$snapshot$2f$imports$2f$json$2f$input$2f$invalid$2e$json__$28$json$29$__[
              "default"
            ]["this-is"]
          );
        })(),
  },
]);

//# sourceMappingURL=crates_titanpack-tests_tests_snapshot_imports_json_input_22bb62._.js.map
