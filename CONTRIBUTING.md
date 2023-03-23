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
