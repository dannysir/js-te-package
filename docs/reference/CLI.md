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
- [Reporters](#reporters)
- [Exit codes](#exit-codes)
- [Examples](#examples)
- [Zero-match behavior](#zero-match-behavior)
- [See also](#see-also)

---

## Overview

By default `js-te` discovers and runs every test file in the project (see [test file discovery](../../README.md#test-file-discovery)). The CLI accepts filters that narrow the run to a subset, intended for local iteration and editor/IDE integration.

Three filters exist:

- **File filter** — chosen by positional arguments (substring match on the file path).
- **Name filter** — chosen by `-t / --testNamePattern` (substring match on the full test name).
- **Location filter** — chosen by `--testLocation` (exact `<path>:<line>` of a single test), intended for editor "run this test" gutter actions.

All filters are optional. When several are provided they are AND-combined.

## Usage

```
js-te [options] [file patterns...]
```

## Options

| Option                            | Alias | Type   | Description                                                   |
| --------------------------------- | ----- | ------ | ------------------------------------------------------------- |
| `--testNamePattern <pattern>`     | `-t`  | string | Only run tests whose full name includes `<pattern>`.          |
| `--testLocation <path:line>`      |       | string | Only run the test whose `test(...)` call is on `<line>` of `<path>`. |
| `--reporter <name>`               |       | string | Output format. `default` (human-readable, the default) or `json`. |
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

### Location

- `--testLocation <path>:<line>` runs the single test whose `test(...)` call site sits on `<line>` of `<path>`.
- `<path>` may be relative (resolved against the current working directory) or absolute; `<line>` must be a positive integer. A malformed value exits with code `1` and `Invalid CLI arguments: ...`.
- The line must match the line where `test(...)` is called — not a line inside the test body. Pointing at any other line matches zero tests.
- Only the file at `<path>` is imported and run; other discovered files are skipped.
- `test.each(...)` cases all share the line of the `test.each` call, so a location filter cannot single out one generated case.

This filter is the reliable way to run **one** test even when several tests share the same name, which a name pattern cannot disambiguate.

### Combining filters

File and name filters are independent. When both are set, a test runs only if its **file** passes the file filter **and** its **full name** passes the name filter.

```bash
js-te auth -t "token"
# → runs tests whose file path contains "auth"
#   AND whose full name contains "token"
```

## Reporters

`--reporter <name>` selects how results are printed. Two reporters ship with `js-te`:

- `default` — colored, human-readable output to stdout. This is the default and matches the pre-existing CLI behavior.
- `json` — a single JSON object printed to stdout when the run completes. Intended for IDE extensions and CI scripts that need to read results programmatically. An unknown reporter name exits with code `1` and `Invalid CLI arguments: ...`.

### JSON schema

The `json` reporter emits exactly one JSON object on stdout, on a single line, after the run finishes:

```json
{
  "totals": {"passed": 10, "failed": 1, "skipped": 2, "todo": 1},
  "files": [
    {
      "path": "/abs/path/foo.test.js",
      "passed": 3,
      "failed": 1,
      "skipped": 1,
      "todo": 1,
      "tests": [
        {
          "path": "group > sub",
          "description": "ok case",
          "status": "passed",
          "location": {"file": "/abs/path/foo.test.js", "line": 42}
        },
        {
          "path": "",
          "description": "bad case",
          "status": "failed",
          "location": {"file": "/abs/path/foo.test.js", "line": 50},
          "error": {"message": "expected 1 to equal 2"}
        },
        {
          "path": "",
          "description": "explicit skip",
          "status": "skipped",
          "location": {"file": "/abs/path/foo.test.js", "line": 58}
        },
        {
          "path": "",
          "description": "write later",
          "status": "todo",
          "location": {"file": "/abs/path/foo.test.js", "line": 64}
        }
      ]
    }
  ]
}
```

Field notes:

- `files[].path` is the absolute path of the test file.
- `tests[].path` is the `describe` chain joined with `" > "`, or `""` for top-level tests. `tests[].description` is just the `test(...)` description — together they form the full test name.
- `tests[].status` is one of `"passed"`, `"failed"`, `"skipped"`, or `"todo"`. `"skipped"` covers `test.skip`, `describe.skip`, and tests demoted by a sibling `.only`. `"todo"` is registered via `test.todo(desc)`.
- `tests[].location` is the file and line where `test(...)` was called. It is omitted if the call site could not be captured (e.g., stack-parse failure).
- `tests[].error` is present only on `"failed"` tests, and currently exposes only `message`. Stack traces are intentionally not included.

Special cases:

- If no test matches the filters, the payload is `{"totals": {"passed": 0, "failed": 0, "skipped": 0, "todo": 0}, "files": [], "noTestsFound": true}` and the exit code is `1`.
- If the runner itself fails before any test runs (e.g., a setup error), the payload is `{"totals": {"passed": 0, "failed": 0, "skipped": 0, "todo": 0}, "files": [], "error": {"message": "..."}}` and the exit code is `1`.

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

# Location filter — single test by file and line
js-te --testLocation test/user.test.js:42

# JSON reporter — machine-readable output on stdout
js-te --reporter json

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
