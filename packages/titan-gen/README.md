# `@titan/gen`

Types for working with [Titanrepo Generators](https://titan.build/repo/docs/core-concepts/monorepos/code-generation).

## Usage

Install:

```bash
pnpm add @titan/gen --save-dev
```

Use types within your generator `config.ts`:

```ts filename="titan/generators/config.ts"
import type { PlopTypes } from "@titan/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // create a generator
  plop.setGenerator("Generator name", {
    description: "Generator description",
    // gather information from the user
    prompts: [
      ...
    ],
    // perform actions based on the prompts
    actions: [
      ...
    ],
  });
}
```

Learn more about Titanrepo Generators in the [docs](https://titan.build/repo/docs/core-concepts/monorepos/code-generation)

---

For more information about Titanrepo, visit [titan.build](https://titan.build) and follow us on X ([@titanrepo](https://x.com/titanrepo))!
