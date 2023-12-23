## Setup:

Install JS dependencies:

```
pnpm i
```

## Build:

Build native library and js wrapper

```
pnpm exec napi build --platform
```

## Test

```
greg@crisp:titanrepo-napi (inference_crate *)$ node
Welcome to Node.js v18.14.1.
Type ".help" for more information.
> let tr = require('./index.js');
undefined
> tr
{
  Repository: [Function: Repository],
}
> let repo = tr.Repository.detectJS('..')
undefined
> repo.root
'/Users/greg/workspace/titanrepo'
> repo.isMonorepo
true
>
> let napiPackage = tr.Repository.detectJS()
undefined
> napiPackage.root
'/Users/greg/workspace/titanrepo/crates/titanrepo-napi'
> napiPackage.isMonorepo
false
>
```
