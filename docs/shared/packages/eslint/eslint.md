The ESLint plugin integrates [ESLint](https://eslint.org/) with Nx. It allows you to run ESLint through Nx with caching enabled. It also includes code generators to help you set up ESLint in your workspace.

## Setting Up @titan/eslint

### Installation

{% callout type="note" title="Keep Nx Package Versions In Sync" %}
Make sure to install the `@titan/eslint` version that matches the version of `nx` in your repository. If the version numbers get out of sync, you can encounter some difficult to debug errors. You can [fix Nx version mismatches with this recipe](/recipes/tips-n-tricks/keep-nx-versions-in-sync).
{% /callout %}

In any Nx workspace, you can install `@titan/eslint` by running the following command:

{% tabs %}
{% tab label="Nx 18+" %}

```shell {% skipRescope=true %}
nx add @titan/eslint
```

This will install the correct version of `@titan/eslint`.

### How @titan/eslint Infers Tasks

The `@titan/eslint` plugin will create a task for any project that has an ESLint configuration file present. Any of the following files will be recognized as an ESLint configuration file:

- `.eslintrc`
- `.eslintrc.js`
- `.eslintrc.cjs`
- `.eslintrc.yaml`
- `.eslintrc.yml`
- `.eslintrc.json`
- `eslint.config.js`

Because ESLint applies configuration files to all subdirectories, the `@titan/eslint` plugin will also infer tasks for projects in subdirectories. So, if there is an ESLint configuration file in the root of the repository, every project will have an inferred ESLint task.

### View Inferred Tasks

To view inferred tasks for a project, open the [project details view](/concepts/inferred-tasks) in Nx Console or run `nx show project my-project --web` in the command line.

### @titan/eslint Configuration

The `@titan/eslint/plugin` is configured in the `plugins` array in `nx.json`.

```json {% fileName="nx.json" %}
{
  "plugins": [
    {
      "plugin": "@titan/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    }
  ]
}
```

- The `targetName` option controls the name of the inferred ESLint tasks. The default name is `lint`.

{% /tab %}
{% tab label="Nx 17" %}

Install the `@titan/eslint` package with your package manager.

```shell {% skipRescope=true %}
npm add -D @titan/eslint
```

{% /tab %}
{% tab label="Nx < 17" %}

Install the `@nx/linter` package with your package manager.

```shell
npm add -D @nx/linter
```

{% /tab %}
{% /tabs %}

## Lint

You can lint an application or a library with the following command:

```shell
nx lint my-project
```

## Utils

- [convert-to-flat-config](/nx-api/eslint/generators/convert-to-flat-config) - Converts the workspace's [ESLint](https://eslint.org/) configs to the new [Flat Config](https://eslint.org/blog/2022/08/new-config-system-part-2)

## ESLint plugin

Read about our dedicated ESLint plugin - [eslint-plugin-nx](/nx-api/eslint-plugin/documents/overview).
