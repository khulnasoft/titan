# defaultCollection

{% callout type="caution" title="Experimental" %}
Configuring `defaultCollection` will no longer have any effect in Nx 17+
{% /callout %}

In the `nx.json` you can set a `defaultCollection` property like this:

```jsonc
{
  "cli": {
    "defaultCollection": "@titan/next"
  }
}
```

This would cause the following command

```shell
nx g library my-lib
```

To create a `@titan/next:library` library instead of some other generator with the name `library`.

This property is no longer needed because the Nx cli automatically will prompt you to choose between the available options if there is any ambiguity. The output looks like this:

```shell
> nx g lib my-lib
? Which generator would you like to use? …
@nx/react-native:library
@titan/angular:library
@nx/expo:library
@nx/nest:library
@nx/node:library

@nestjs/schematics:library
@schematics/angular:library
@nx/js:library
@titan/next:library
@nx/react:library

None of the above
```
