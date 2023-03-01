# 🪴 tendr-cli 🎍

![[A WikiBonsai Project](https://github.com/wikibonsai/wikibonsai)](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)
[![NPM package](https://img.shields.io/npm/v/tendr-cli)](https://npmjs.org/package/tendr-cli)

<div style="width:35%; display: flex; justify-content: center;">
  <img src="./tendr.svg" width="300" height="300"/>
</div>

CLI tooling to edit [`[[wikirefs]]`](https://github.com/wikibonsai/wikirefs) and [semantic trees](https://github.com/wikibonsai/semtree) in a collection of markdown files.

🧑‍🌾 🚰 ✂️ Tend your [🎋 WikiBonsai](https://github.com/wikibonsai/wikibonsai) digital garden with minimalist tooling.

⚠️ 🌱 This project is newly sprouted! So please consider it a beta: Remember to backup all data and please use version control.

## Install

Install with [npm](https://docs.npmjs.com/cli/v9/commands/npm-install):

```
npm install -g tendr-cli
```


## Use

```
$ tendr ls <filename>
```

`tend` and `t` are also valid command aliases.

## Commands

### `stat` (⚠️ TODO)

Generates a status report. Runs on all files in current directory and all subdirectories.

```
$ tendr stat
```

### `list`

list all references for a given file.

```
$ tendr list <filename>
```

`ref-kinds` (reference kinds):
- ref / attr / link / embed
- foreref / backref
- foreattr / backattr
- forelink / backlink
- foreembed / backembed

### `rename`

rename a file/doc and all of its references.

```
$ tendr rename <old-fname> <new-fname>
```

kinds:
- filename / fname

### `retype`

retype a reference type and all its occurrences. the default targets all references (`ref`), but you may target just wikiattrs (`attr`), wikilinks (`link`), or suppress reference renames (`only`).

note: keep in mind this will **not** retype caml primitive properties! this is for wikirefs only.

```
$ tendr retype <old-type> <new-type>
```

kinds:
- ref
- attr
- link

### `camltoyaml`

convert attributes from `caml` to `yaml` format.

```
// caml -> yaml

$ tendr ctoy [glob]
```

### `yamltocaml`

convert attributes from `yaml` to `caml` format. (note: will only handle scalar yaml values)

```
// yaml -> caml

$ tendr ytoc [glob]
```

## Development

When testing locally, use the following command to run the script from any location:

```
$ node -r ts-node/register <path-to-index.ts> <cmd-listed-above>
```

For example, to list the references for a file in the `./test/fixtures` directory:

```
$ node -r ts-node/register ../src/index.ts list test.md
```
