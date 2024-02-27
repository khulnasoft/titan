import {
  apply,
  branchAndMerge,
  chain,
  externalSchematic,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { Schema } from './schema';
import * as stringUtils from '@schematics/angular/strings';
import { addImportToModule, insert, toFileName } from '@khulnasoft/schematics';
import * as ts from 'typescript';
import { addBootstrapToModule } from '@schematics/angular/utility/ast-utils';
import { insertImport } from '@schematics/angular/utility/route-utils';
import { addApp, serializeJson } from '../utility/fileutils';
import { addImportToTestBed } from '../utility/ast-utils';

function addBootstrap(path: string): Rule {
  return (host: Tree) => {
    const modulePath = `${path}/app/app.module.ts`;
    const moduleSource = host.read(modulePath)!.toString('utf-8');
    const sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
    insert(host, modulePath, [
      insertImport(sourceFile, modulePath, 'BrowserModule', '@angular/platform-browser'),
      ...addImportToModule(sourceFile, modulePath, 'BrowserModule'),
      ...addBootstrapToModule(sourceFile, modulePath, 'AppComponent', './app.component')
    ]);
    return host;
  };
}

function addTitanModule(path: string): Rule {
  return (host: Tree) => {
    const modulePath = `${path}/app/app.module.ts`;
    const moduleSource = host.read(modulePath)!.toString('utf-8');
    const sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
    insert(host, modulePath, [
      insertImport(sourceFile, modulePath, 'TitanModule', '@khulnasoft/titan'),
      ...addImportToModule(sourceFile, modulePath, 'TitanModule.forRoot()')
    ]);
    return host;
  };
}
function addAppToAngularCliJson(options: Schema): Rule {
  return (host: Tree) => {
    if (!host.exists('.angular-cli.json')) {
      throw new Error('Missing .angular-cli.json');
    }

    const sourceText = host.read('.angular-cli.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);
    json.apps = addApp(json.apps, {
      name: options.name,
      root: fullPath(options),
      outDir: `dist/apps/${options.name}`,
      assets: ['assets', 'favicon.ico'],
      index: 'index.html',
      main: 'main.ts',
      polyfills: 'polyfills.ts',
      test: '../../../test.js',
      tsconfig: '../../../tsconfig.app.json',
      testTsconfig: '../../../tsconfig.spec.json',
      prefix: options.prefix,
      styles: [`styles.${options.style}`],
      scripts: [],
      environmentSource: 'environments/environment.ts',
      environments: {
        dev: 'environments/environment.ts',
        prod: 'environments/environment.prod.ts'
      }
    });

    host.overwrite('.angular-cli.json', serializeJson(json));
    return host;
  };
}

function addRouterRootConfiguration(path: string): Rule {
  return (host: Tree) => {
    const modulePath = `${path}/app/app.module.ts`;
    const moduleSource = host.read(modulePath)!.toString('utf-8');
    const sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
    insert(host, modulePath, [
      insertImport(sourceFile, modulePath, 'RouterModule', '@angular/router'),
      ...addImportToModule(sourceFile, modulePath, `RouterModule.forRoot([], {initialNavigation: 'enabled'})`)
    ]);

    const componentSpecPath = `${path}/app/app.component.spec.ts`;
    const componentSpecSource = host.read(componentSpecPath)!.toString('utf-8');
    const componentSpecSourceFile = ts.createSourceFile(
      componentSpecPath,
      componentSpecSource,
      ts.ScriptTarget.Latest,
      true
    );
    insert(host, componentSpecPath, [
      insertImport(componentSpecSourceFile, componentSpecPath, 'RouterTestingModule', '@angular/router/testing'),
      ...addImportToTestBed(componentSpecSourceFile, componentSpecPath, `RouterTestingModule`)
    ]);
    return host;
  };
}

export default function(schema: Schema): Rule {
  const options = { ...schema, name: toFileName(schema.name) };
  const templateSource = apply(url('./files'), [
    template({ utils: stringUtils, dot: '.', tmpl: '', ...(options as object) })
  ]);

  const selector = `${options.prefix}-root`;
  return chain([
    branchAndMerge(chain([mergeWith(templateSource)])),
    externalSchematic('@schematics/angular', 'module', {
      name: 'app',
      commonModule: false,
      flat: true,
      routing: false,
      sourceDir: fullPath(options),
      spec: false
    }),
    externalSchematic('@schematics/angular', 'component', {
      name: 'app',
      selector: selector,
      sourceDir: fullPath(options),
      flat: true,
      inlineStyle: options.inlineStyle,
      inlineTemplate: options.inlineTemplate,
      spec: !options.skipTests,
      styleext: options.style,
      viewEncapsulation: options.viewEncapsulation,
      changeDetection: options.changeDetection
    }),

    mergeWith(
      apply(url('./component-files'), [
        options.inlineTemplate ? filter(path => !path.endsWith('.html')) : noop(),
        template({ ...options, tmpl: '' }),
        move(`${fullPath(options)}/app`)
      ]),
      MergeStrategy.Overwrite
    ),
    addBootstrap(fullPath(options)),
    addTitanModule(fullPath(options)),
    addAppToAngularCliJson(options),
    options.routing ? addRouterRootConfiguration(fullPath(options)) : noop()
  ]);
}

function fullPath(options: Schema) {
  return `apps/${options.name}/${options.sourceDir}`;
}
