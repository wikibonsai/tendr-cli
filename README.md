# 🪴 tendr-cli 🎍

![[A WikiBonsai Project](https://github.com/wikibonsai/wikibonsai)](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)
[![NPM package](https://img.shields.io/npm/v/tendr-cli)](https://npmjs.org/package/tendr-cli)

<div style="width:100%; display: flex; justify-content: center;">
  <img src="./tendr.svg" width="300" height="300"/>
</div>

⚠️ 🌱 This project is newly sprouted! So please consider it a beta: Remember to backup all data and please use version control.

CLI tooling to edit [`[[wikirefs]]`](https://github.com/wikibonsai/wikirefs) and [semantic trees](https://github.com/wikibonsai/semtree) in a collection of markdown files.

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
Usage: tendr|tend|t [options] [command]

cli tools for markdown-based digital gardening

Options:
  -V, --version                              output the version number
  -h, --help                                 display help for command

Commands:
  list|ls [options] <filename>               list all references for a given file
  rename|rn <old-fname> <new-fname>          rename a file and all of its references.
  retype|rt [options] <old-type> <new-type>  rename reference type and all its occurrences.
  camltoyaml|ctoy [glob]                     convert between "caml" and "yaml" style attributes.
  yamltocaml|ytoc [options] [glob]           convert between "caml" and "yaml" style attributes.
  help [command]                             display help for command
```

## Commands

### `stat` (⚠️ TODO)

Generates a status report. Runs on all files in current directory and all subdirectories.

```
$ tendr stat
```

### `list`

Example:

```
$ tendr list <filename>
```

Manual:

```
Usage: tendr list|ls [options] <filename>

list all references for a given file

Options:
  -k, --kind [ref_kinds]  kind of references to list
                          (kinds: 'ref', 'foreref', 'backref', 'attr',
                          'foreattr', 'backattr', 'link', 'forelink',
                          'backlink'; default is 'ref')
  -h, --help              display help for command

```

### `rename`

Example:

```
$ tendr rename <old-fname> <new-fname>
```

Manual:

```
Usage: tendr rename|rn [options] <old-fname> <new-fname>

rename a file and all of its references.

Options:
  -h, --help  display help for command
```

### `retype`

note: keep in mind this will **not** retype caml primitive properties! this is for wikirefs only.

Example:

```
$ tendr retype <old-type> <new-type>
```

Manual:

```
Usage: tendr retype|rt [options] <old-type> <new-type>

rename reference type and all its occurrences.

Options:
  -k, --kind [kind]  kind of entity to rename (kinds: 'reftype', 'attrtype',
                     'linktype'; default is 'reftype')
  -h, --help         display help for command
```

### `camltoyaml`

Example:

```
// caml -> yaml

$ tendr camltoyaml [glob]
```

Manual:

```
Usage: tendr camltoyaml|ctoy [options] [glob]

convert between "caml" and "yaml" style attributes.

Options:
  -h, --help  display help for command
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
