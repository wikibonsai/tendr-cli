# Contributing

## clone

```bash
$ git clone https://github.com/wikibonsai/tendr-cli
```

## install

```bash
$ yarn install
```

## build

```bash
$ yarn build
```

## run unit tests

Note: Be very careful with tests as they perform operations on real files generated at runtime. This means if variables like `cwd` (current working directory) aren't set properly, you may perform cli operations on project files themselves during test runs.

```bash
$ yarn test
```

## run cmds directly from project

```bash
$ yarn tendr <cmd>
```

note: aliases (`tend`, `t`) should also work.

## install project locally

after (re)building project, copy/paste `package.json` into the `dist/` directory (this will be automatically genenerated in a production deploy).

```bash
$ yarn global add file://path/to/tendr-cli/
```

## qa checklist

- unit tests
- tendr package script
- install locally
- ensure prod vars are ready
