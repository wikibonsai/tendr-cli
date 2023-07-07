# 🪴 tendr-cli 🎍

[![A WikiBonsai Project](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)](https://github.com/wikibonsai/wikibonsai)
[![NPM package](https://img.shields.io/npm/v/tendr-cli)](https://npmjs.org/package/tendr-cli)

<div style="width:100%; display: flex; justify-content: center;">
  <img src="./tendr.svg" width="300" height="300"/>
</div>

> ⚠️ 🌱 This project is newly sprouted! So please consider it a beta: Remember to backup all data and please use version control.

CLI tooling to edit [`[[wikirefs]]`](https://github.com/wikibonsai/wikirefs) and [semantic trees](https://github.com/wikibonsai/semtree) in a collection of markdown files. Commands will feel familiar to typical cli commands to inspect files and directories.

🧑‍🌾 🚰 ✂️ Tend your [🎋 WikiBonsai](https://github.com/wikibonsai/wikibonsai) digital garden with minimalist tooling.

## Install

Install with [npm](https://docs.npmjs.com/cli/v9/commands/npm-install):

```
npm install -g tendr-cli
```

## Use

Example:

```
$ tendr list <filename>
```

Manual:

```
usage: tendr <command>

cli tools for markdown-based digital gardening.

Commands:
  tendr list <filename>                 list all references for a given file
                                                                   [aliases: ls]
  tendr rename <old-fname> <new-fname>  rename a file and all of its references.
                                                                   [aliases: rn]
  tendr retype <old-type> <new-type>    rename reference type and all its occurr
                                        ences.                     [aliases: rt]
  tendr camltoyaml [glob]               convert between "caml" and "yaml" style
                                        attributes.              [aliases: ctoy]
  tendr yamltocaml [glob]               convert between "caml" and "yaml" style
                                        attributes.              [aliases: ytoc]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Commands

### `stat` (⚠️ TODO)

Generates a status report. Runs on all files in current directory and all subdirectories.

```
$ tendr stat
```

### `status`

Example:

```
$ tendr status <filename>
```

Manual:

```
tendr status <filename>

show status of file relationships

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -k, --kind     kind of relationships to list
                 (kinds: rel, fam, ancestor, child
                 , ref, attr, link, embed, fore, foreref, foreattr, forelink, fo
                 reembed, back, backref, backattr, backlink, backembed; default
                 is "rel")                             [string] [default: "rel"]

```

### `rename`

Example:

```
$ tendr rename <old-fname> <new-fname>
```

Manual:

```
tendr rename <old-fname> <new-fname>

rename a file and all of its references.

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

### `retype`

note: keep in mind this will **not** retype caml primitive properties! this is for wikirefs only.

Example:

```
$ tendr retype <old-type> <new-type>
```

Manual:

```
tendr retype <old-type> <new-type>

rename reference type and all its occurrences.

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -k, --kind     kind of entity to rename (kinds: "reftype", "attrtype", "linkty
                 pe"; default is "reftype")        [string] [default: "reftype"]
```

### `camltoyaml`

Example:

```
// caml -> yaml

$ tendr camltoyaml [glob]
```

Manual:

```
tendr retype <old-type> <new-type>

rename reference type and all its occurrences.

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -k, --kind     kind of entity to rename (kinds: "reftype", "attrtype", "linkty
                 pe"; default is "reftype")        [string] [default: "reftype"]
```

### `yamltocaml`

Example:

```
// yaml -> caml

$ tendr yamltocaml [glob]
```

Manual:

```
Usage: tendr yamltocaml|ytoc [options] [glob]

convert between "caml" and "yaml" style attributes.

Options:
  -f, --format [format]            how to format caml output (kinds: 'none',
                                   'pretty', or 'pad'; default is 'none')
  -l, --list-format [list-format]  how to format caml output lists (kinds:
                                   'mkdn' or 'comma'; default is 'mkdn')
  -p, --no-prefix                  do not use colon prefix in caml output
  -h, --help                       display help for command
```
