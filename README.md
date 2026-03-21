# 🪴 tendr-cli 🎍

[![A WikiBonsai Project](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)](https://github.com/wikibonsai/wikibonsai)
[![NPM package](https://img.shields.io/npm/v/tendr-cli)](https://npmjs.org/package/tendr-cli)

<p align="center">
  <img src="./tendr.svg" width="300" height="300"/>
</p>

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
  tendr doctor                           check garden health.          [aliases: doc, dr]
  tendr lint                             deprecated: use doctor.
  tendr list                             list garden contents.              [aliases: ls]
  tendr seed <concept>                   seed a concept file from an llm.
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

Note:

- Commands expect markdown files using the `.md` extension.
- Commands that perform anything other than read operations will display a confirmation prompt before executing. This may typically be skipped with the force flag (`-f`).

### `doctor`, `doc`, `dr`

Example:

```
$ tendr doctor
```

Sample output:

```
// success

✅ all clean
```

```
// config warning

⚠️  [config] [lint] is deprecated — rename to [format]
```

```
// type error

❌ [types] "hypernym" syncs to "nonexistent" but "nonexistent" does not exist in types
```

```
// tree warning

⚠️  [tree] orphan trunk files found:

- i.orphan-trunk-1
- i.orphan-trunk-2
```

```
// tree error

❌ [tree] duplicate entity names found:

- "duplicate-filename"
  - File "i.bonsai" Line 1
  - File "i.bonsai" Line 4
```

Manual:

```
tendr doctor

check garden health

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -c, --config   relative path to config file, including filename; defaults to "
                 ./config.toml"              [string] [default: "./config.toml"]
  -d, --doctype  relative path to doctype file, including filename; defaults to
                 "t.doc.toml"                 [string] [default: "./t.doc.toml"]
      --reltype  relative path to reltype file, including filename; defaults to
                 "t.rel.toml"                [string] [default: "./t.rel.toml"]
  -r, --root     filename for root of tree                              [string]
  -g, --glob     glob to index files                                    [string]
```

### `lint`

`lint` is a backwards-compatible shim that delegates to `doctor` for now.

Example:

```
$ tendr lint
```

### `seed`

Seed a concept file with generated content from an LLM. Uses the [wisp-ai](https://github.com/wikibonsai/wisp-ai) package.

Example:

```
$ tendr seed 4-levels-of-reading
```

Sample output:

```
[[knowledge]] > [[learning]] > [[literacy]] > [[reading]] > [[the-art-of-reading]] > [[4-levels-of-reading]]

: title    :: 4 Levels Of Reading
: alias    :: ''
: hypernym :: [[the-art-of-reading]]
: hyponym  ::
             - [[elementary-reading]]
             - [[inspectional-reading]]
             - [[analytical-reading]]
             - [[syntopical-reading]]
: synonym  :: ''
: antonym  :: ''
: tldr     :: "The four levels of reading represent the ideal steps and skills in the art of reading."

- [[4-levels-of-reading]]
  - [[elementary-reading]]
    - [[reading-readiness]]
    - [[word-mastery]]
  - [[inspectional-reading]]
    - [[skimming]]
    - [[superficial-reading]]
  - [[analytical-reading]]
    - [[outline]]
    - [[interpret]]
    - [[criticize]]
  - [[syntopical-reading]]
    - [[prepare-bibliography]]
    - [[inspect-passages]]
```

Manual:

```
tendr seed <concept>

seed a concept file from an llm.

Options:
      --version    Show version number                                  [boolean]
      --help       Show help                                            [boolean]
  -p, --provider   llm provider (anthropic, openai, xai)
                                                  [string] [default: "anthropic"]
  -k, --api-key    api key (overrides env var)                           [string]
  -m, --model      model name (overrides default per provider)           [string]
  -o, --output     write to <concept>.md file instead of stdout
                                                      [boolean] [default: false]
  -c, --config     relative path to config file       [string] [default: "./config.toml"]
      --attrs      attribute format (caml, yaml)                         [string]
      --case       case style (upper, lower)                             [string]
      --text       text format (regular, [[wikitext]])                   [string]
      --indent     indent style (2 spaces, 4 spaces, 1 tab)             [string]
      --whitespace whitespace style (white space, snake_case, kabob-case)
                                                                         [string]
```

### `list`, `ls`

List garden information. Runs on all files in current directory and all subdirectories.

Example:

```
$ tendr list
```

Sample output:

```
🌱 garden census

structure

  nodes              5
  tree               3
  web                3
  orphans            2
  isolates           2

references

  wikiattrs          1
  wikilinks          3
  wikiembeds         0

types

  doctypes           1
  attrtypes          1
  linktypes          1
```

Manual:

```
tendr list

list garden contents

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -c, --config   relative path to config file, including filename; defaults to "
                 ./config.toml"              [string] [default: "./config.toml"]
  -d, --doctype  relative path to doctype file, including filename; defaults to
                 "t.doc.toml"                 [string] [default: "./t.doc.toml"]
```

### `tree`

Example:

```
$ tendr tree
```

Sample output:

```
bk.how-to-read-a-book
├── demanding-reader
|   └── active-reading
|       ├── reading-comprehension
|       └── the-art-of-reading
└── 4-levels-of-reading
    ├── elementary-reading
    ├── inspectional-reading
    ├── analytical-reading
    └── syntopical-reading
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

### `status`, `stat`

Example:

```
$ tendr status <filename>
```

Sample output:

```
📄 fname-a [default]

🌳 Tree

  ancestors: i.bonsai
  children: fname-b, fname-c, fname-d, fname-e

🕸️ Web
          back                          fore
  attr    ◦ attrtype                    ◦ reftype
            • fname-b                   • fname-b
                                        ◦ attrtype
                                        • fname-c
  link    • fname-c [linktype]          • fname-d [linktype]
          • fname-d                     • fname-e
          • i.bonsai                    • no-doc
  embed   • fname-f                     --
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

### `find` , `f`

Example:

```
$ tendr find <fname>
```

Sample output:

Single file:

```
/path/to/notes/fname.md
```

Multiple files:

```
/path/to/notes/fname.md
/path/to/notes/folder/fname.md
```

Manual:

```
tendr find <fname>

show full path of markdown file(s) with the given filename.

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -r, --regex    usage: find <regex>; use regex pattern instead of string -- thi
                 s will find all filenames containing matches to the regex patte
                 rn. (use quotes around regex if the terminal is preemptively ex
                 ecuting it)                          [boolean] [default: false]
```

### `rename`, `rn`

Example:

```
$ tendr rename <old-fname> <new-fname>
```

Sample Output:

```
$ tendr rename '4-levels-of-reading' 'four-levels-of-reading'
are you sure you want to rename "4-levels-of-reading" to "four-levels-of-reading"? [y/n]
y
UPDATED FILENAMES:
  4-levels-of-reading -> four-levels-of-reading
UPDATED FILE CONTENT:
  analytical-reading
  demanding-reading
  elementary-reading
  inspectional-reading
  syntopical-reading
```

Manual:

```
tendr rename <old-fname> <new-fname>

rename a file and all of its references.

Options:
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
  -r, --regex    usage: rename <regex> <replace-string>; use regex replacement i
                 nstead of string replacement -- this will rename all filenames
                 containing matches to the regex pattern; the regex argument wil
                 l be replaced by the string argument. (use quotes around regex
                 if the terminal is preemptively executing it)
                                                      [boolean] [default: false]
  -f, --force    skip verification prompt and perform operation
                                                      [boolean] [default: false]
      --no-title  skip updating the renamed note title attribute
                                                      [boolean] [default: false]
      --title     explicit title value to set on the renamed note       [string]
      --title-case, --case
                  override config.format.title_case
                  (kinds: "Title Case", "lower case", "kabob-case", "snake_case")
                                                                        [string]
```

### `retyperef`, `rtref`, `rtr`

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

### `mkdntowiki`, `mtow`

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

### `wikitomkdn`, `wtom`

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

### `camltoyaml`, `ctoy`

Example:

```
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

### `yamltocaml`, `ytoc`

Example:

```
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