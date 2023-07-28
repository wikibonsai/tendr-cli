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
$ tendr stat <filename>
```

Manual:

```
usage: tendr <command>

cli tools for markdown-based digital gardening.

Commands:
  tendr tree                             print full knowledge bonsai.
  tendr status <filename>                show status of file relationships.
                                                                 [aliases: stat]
  tendr rename <old-fname> <new-fname>   rename a file and all of its references
                                         .                         [aliases: rn]
  tendr retypedoc <old-type> <new-type>  rename document type and update all occ
                                         urrences.         [aliases: rtdoc, rtd]
  tendr retyperef <old-type> <new-type>  rename reference type and all its occur
                                         rences.           [aliases: rtref, rtr]
  tendr mkdntowiki [glob]                convert from "[markdown](style)" to "[[
                                         wiki-style]]" internal links.
                                                                 [aliases: mtow]
  tendr wikitomkdn [glob]                convert from "[[wiki-style]]" to "[mark
                                         down](style)" internal links.
                                                                 [aliases: wtom]
  tendr camltoyaml [glob]                convert from "caml" to "yaml" style att
                                         ributes.                [aliases: ctoy]
  tendr yamltocaml [glob]                convert from "yaml" to "caml" style att
                                         ributes.                [aliases: ytoc]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Commands

### `list`

Generates a status report. Runs on all files in current directory and all subdirectories.

```
$ tendr list
```

### `tree`

Example:

```
$ tendr tree
```

Manual:

```
tendr tree

print full knowledge bonsai/semantic tree

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -c, --config   relative path to config file, including filename; defaults to "
                 ./config.toml"              [string] [default: "./config.toml"]
  -d, --doctype  relative path to doctype file, including filename; defaults to
                 "t.doc.toml"                 [string] [default: "./t.doc.toml"]
  -r, --root     filename for root of tree                              [string]
  -g, --glob     glob to index files                                    [string]
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

### `retyperef`

note: keep in mind this will **not** retype caml primitive properties! this is for wikirefs only.

Example:

```
$ tendr retyperef <old-type> <new-type>
```

Manual:

```
tendr retyperef <old-type> <new-type>

rename reference type and all its occurrences.

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -k, --kind     kind of entity to rename (kinds: "reftype", "attrtype", "linkty
                 pe"; default is "reftype")        [string] [default: "reftype"]
```

### `mkdntowiki`

Example:

```
$ tendr mkdntowiki
```

Manual:

```
tendr mkdntowiki [glob]

convert from "[markdown](style)" to "[[wiki-style]]" internal links.

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -F, --format   how to parse markdown links -- "filename", "relative" urls, or
                 "absolute" urls                  [string] [default: "filename"]
  -k, --kind     kind of references to convert
                 (kinds: rel, fam, ancestor, child
                 , ref, attr, link, embed, fore, foreref, foreattr, forelink, fo
                 reembed, back, backref, backattr, backlink, backembed; default
                 is "rel")                             [string] [default: "ref"]
```

### `wikitomkdn`

Example:

```
$ tendr wikitomkdn
```

Manual:

```
tendr wikitomkdn [glob]

convert from "[[wiki-style]]" to "[markdown](style)" internal links.

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -F, --format   how to format the resulting markdown links -- "filename", "rela
                 tive" urls, or "absolute" urls   [string] [default: "filename"]
  -k, --kind     kind of references to convert
                 (kinds: rel, fam, ancestor, child
                 , ref, attr, link, embed, fore, foreref, foreattr, forelink, fo
                 reembed, back, backref, backattr, backlink, backembed; default
                 is "rel")                             [string] [default: "ref"]
```

### `camltoyaml`

Example:

```
// caml -> yaml

$ tendr camltoyaml [glob]
```

Manual:

```
tendr camltoyaml [glob]

convert from "caml" to "yaml" style attributes.

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

### `yamltocaml`

Example:

```
// yaml -> caml

$ tendr yamltocaml [glob]
```

Manual:

```
tendr yamltocaml [glob]

convert from "yaml" to "caml" style attributes.

Options:
      --version      Show version number                               [boolean]
      --help         Show help                                         [boolean]
  -f, --format       how to format caml output (kinds: "none", "pretty", or "pad
                     "; default is "none")          [string] [default: "pretty"]
  -l, --list-format  how to format caml output lists (kinds: "mkdn" or "comma";
                     default is "mkdn")               [string] [default: "mkdn"]
  -p, --no-prefix    do not use colon prefix in caml output
                                                       [boolean] [default: true]
```
