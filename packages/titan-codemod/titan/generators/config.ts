import path from "path";
import fs from "fs-extra";
import type { PlopTypes } from "@titan/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("transformer", {
    description: "Add a new transformer",
    prompts: [
      {
        type: "input",
        name: "name",
        message: 'key for the transform (example: "create-titan-config")',
      },
      {
        type: "input",
        name: "description",
        message:
          'description for the transform (example: "Create the `titan.json` file from an existing "titan" key in `package.json`")',
      },
      {
        type: "input",
        name: "introducedIn",
        message:
          'the semantic version of titan where this change was introduced (example: "1.1.0")',
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/transforms/{{name}}.ts",
        templateFile: "templates/transformer.hbs",
      },
      {
        type: "add",
        path: "__tests__/{{name}}.test.ts",
        templateFile: "templates/transformer.test.hbs",
      },
      function createFixturesDirectory(answers: { name?: string }) {
        if (!answers.name) {
          return "no name provided, skipping fixture directory creation";
        }

        const directory = path.join(
          // resolves to the root of the current workspace
          plop.getDestBasePath(),
          "__tests__",
          "__fixtures__",
          answers.name
        );
        fs.mkdirSync(directory);

        return `created empty ${directory} directory for fixtures`;
      },
    ],
  });
}
