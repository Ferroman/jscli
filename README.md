[![Actions Status](https://github.com/Ferroman/jscli/workflows/build/badge.svg)](https://github.com/Ferroman/jscli/actions)
# JavaScript CLI Projen project

[Projen](https://projen.io) project type to create CLI tools on JavaScript (ES6) based on [command-line-args](https://github.com/75lb/command-line-args) and [command-line-usage](https://github.com/75lb/command-line-usage).  
Produces binary with https://github.com/nexe/nexe

## Usage

```sh
mkdir mycli
cd mycli
npx projen new @brankovskyi/jscli
npx projen build:binary
```

## Development

```sh
npx projen
```
