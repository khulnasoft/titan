# `titan-ignore`

To get started, use the following command as your [Ignored Build Step](https://vercel.com/docs/concepts/projects/overview#ignored-build-step):

```sh
$ npx titan-ignore
```

This uses `titan` to automatically determine if the current app has new changes that need to be deployed.

## Usage

Use `npx titan-ignore --help` to see list of options:

```sh
titan-ignore

Automatically ignore builds that have no changes

Usage:
  $ npx titan-ignore [<workspace>] [flags...]

If <workspace> is not provided, it will be inferred from the "name"
field of the "package.json" located at the current working directory.

Flags:
  --fallback=<ref>    On Vercel, if no previously deployed SHA is available to compare against,
                      fallback to comparing against the provided ref [default: None]. When not on Vercel,
                      compare against the provided fallback
  --help, -h          Show this help message
  --version, -v       Show the version of this script

---

titan-ignore will also check for special commit messages to indicate if a build should be skipped or not.

Skip titan-ignore check and automatically ignore:
  - [skip ci]
  - [ci skip]
  - [no ci]
  - [skip vercel]
  - [vercel skip]
  - [vercel skip <workspace>]

Skip titan-ignore check and automatically deploy:
  - [vercel deploy]
  - [vercel build]
  - [vercel deploy <workspace>]
  - [vercel build <workspace>]

Skip titan-ignore check and automatically deploy specific workspace and ignore others:
  - [vercel only <workspace>]
```

### Examples

```sh
npx titan-ignore
```

> Only build if there are changes to the workspace in the current working directory, or any of it's dependencies. On Vercel, compare against the last successful deployment for the current branch. When not on Vercel, compare against the parent commit (`HEAD^`).

---

```sh
npx titan-ignore docs
```

> Only build if there are changes to the `docs` workspace, or any of its dependencies. On Vercel, compare against the last successful deployment for the current branch. When not on Vercel compare against the parent commit (`HEAD^`).

---

```sh
npx titan-ignore --fallback=HEAD~10
```

> Only build if there are changes to the workspace in the current working directory, or any of it's dependencies. On Vercel, compare against the last successful deployment for the current branch. If this does not exist (first deploy of the branch), compare against the previous 10 commits. When not on Vercel, compare against the parent commit (`HEAD^`) or the fallback provided.

---

```sh
npx titan-ignore --fallback=HEAD^
```

> Only build if there are changes to the workspace in the current working directory, or any of it's dependencies. On Vercel, compare against the last successful deployment for the current branch. If this does not exist (first deploy of the branch), compare against the parent commit (`HEAD^`). When not on Vercel, compare against the parent commit (`HEAD^`) or the fallback provided.

## How it Works

`titan-ignore` determines if a build should continue by analyzing the package dependency graph of the given workspace.

The _given workspace_ is determined by reading the "name" field in the "package.json" file located at the current working directory, or by passing in a workspace name as the first argument to `titan-ignore`.

Next, it uses `titan run build --dry` to determine if the given workspace, _or any dependencies of the workspace_, have changed since the previous commit.

**NOTE:** `titan` determines dependencies from reading the dependency graph of the given workspace. This means a workspace **must** be listed as a `dependency` (or `devDependency`) in the given workspaces `package.json` for `titan` to recognize it.

When deploying on [Vercel](https://vercel.com), `titan-ignore` can make a more accurate decision by comparing between the current commit, and the last successfully deployed commit for the current branch.

**NOTE:** By default on Vercel, `titan-ignore` will always deploy the first commit of a new branch. This behavior can be changed by providing the `ref` to compare against to the `--fallback` flag. See the [Examples](#Examples) section for more details.

---

For more information about Titanrepo, visit [titan.build](https://titan.build) and follow us on X ([@titanrepo](https://x.com/titanrepo))!
