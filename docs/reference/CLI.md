# CLI Reference

> Korean version: [CLI.ko.md](./CLI.ko.md)

Reference for the `js-te` command-line interface — options, positional arguments, matching rules, exit codes, and examples.

- [Overview](#overview)
- [Usage](#usage)
- [Options](#options)
- [Positional arguments](#positional-arguments)
- [Matching rules](#matching-rules)
  - [File pattern](#file-pattern)
  - [Name pattern](#name-pattern)
  - [Combining filters](#combining-filters)
- [Exit codes](#exit-codes)
- [Examples](#examples)
- [Zero-match behavior](#zero-match-behavior)
- [See also](#see-also)

---

## Overview

By default `js-te` discovers and runs every test file in the project (see [test file discovery](../../README.md#test-file-discovery)). The CLI accepts filters that narrow the run to a subset, intended for local iteration and editor/IDE integration.

Two orthogonal filters exist:

- **File filter** — chosen by positional arguments (substring match on the file path).
- **Name filter** — chosen by `-t / --testNamePattern` (substring match on the full test name).

Both filters are optional. When both are provided they are AND-combined.

## Usage

```
js-te [options] [file patterns...]
```

## Options

| Option                            | Alias | Type   | Description                                                   |
| --------------------------------- | ----- | ------ | ------------------------------------------------------------- |
| `--testNamePattern <pattern>`     | `-t`  | string | Only run tests whose full name includes `<pattern>`.          |
| `--help`                          | `-h`  | flag   | Print usage, options, examples, and exit codes; then exit 0.  |

Unknown options cause `js-te` to exit with code `1` and print `Invalid CLI arguments: ...`.

## Positional arguments

Any non-option argument is treated as a **file pattern**. Multiple file patterns may be passed.

```bash
js-te user                 # one pattern
js-te user payment         # two patterns (OR)
js-te src/auth.test.js     # full path works too (it's still substring-matched)
```

## Matching rules

### File pattern

- **Case-sensitive substring match** against the absolute file path.
- Multiple patterns are **OR-combined** — a file matches if any pattern is a substring of its path.
- There is no separate "exact path" mode; a full path works because it is a substring of itself.
- If no positional arguments are given, every discovered test file is included.

### Name pattern

- **Case-sensitive substring match** against the test's **full name**.
- Full name is constructed as `"<describe path> > <test description>"`, joining nested `describe` blocks with `" > "`. If a test has no enclosing `describe`, the full name is just the test description.
- Regular expressions are not supported in this release.

Example full names:

```
calculator > addition > positive numbers
login flow > returns a token on success
standalone test with no describe
```

With `-t "token"`, only the middle test above would run.

### Combining filters

File and name filters are independent. When both are set, a test runs only if its **file** passes the file filter **and** its **full name** passes the name filter.

```bash
js-te auth -t "token"
# → runs tests whose file path contains "auth"
#   AND whose full name contains "token"
```

## Exit codes

| Code | Meaning                                                              |
| ---- | -------------------------------------------------------------------- |
| `0`  | All executed tests passed.                                           |
| `1`  | One or more tests failed, **or** no tests matched the given filters. |

The zero-match → `exit 1` behavior matches Vitest's default and is intentional: a typo in a CI filter should fail loudly rather than silently report success.

## Examples

```bash
# Run everything (same as the 0.6.x behavior)
js-te

# File filter — substring on path
js-te user                  # files whose path contains "user"
js-te user payment          # files whose path contains "user" OR "payment"
js-te src/auth.test.js      # specific file

# Name filter
js-te -t "login"            # tests whose full name contains "login"
js-te --testNamePattern "login flow > returns"

# Both filters combined
js-te auth -t "token"       # file path contains "auth" AND full name contains "token"

# Help
js-te --help
```

## Zero-match behavior

When no test matches the filter combination, `js-te` prints a warning and exits with code `1`:

```
⚠ No tests found matching file pattern(s) [nonexistent] and name pattern "token"
```

The exact suffix depends on which filters were active:

- file filter only  → `...matching file pattern(s) [<patterns>]`
- name filter only  → `...matching name pattern "<pattern>"`
- both filters      → `...matching file pattern(s) [<patterns>] and name pattern "<pattern>"`

To treat zero-match as success instead, clear the filters or broaden them. A `--passWithNoTests` flag is not provided in this release.

## See also

- [API Reference](./API.md) — `test`, `expect`, `mock`, and the rest of the public API
- [CHANGELOG](../../CHANGELOG.md) — version history
