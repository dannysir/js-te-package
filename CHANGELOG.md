# CHANGELOG

> Korean version: [CHANGELOG.ko.md](./CHANGELOG.ko.md)

## [0.6.0] 2026-04-20

### Added (Matcher)
- `toContain(item)` — checks array element / substring inclusion
- `toBeInstanceOf(Class)` — `instanceof`-based type check
- `toBeNull()` / `toBeUndefined()` / `toBeDefined()` — dedicated null/undefined matchers
- `toHaveBeenCalled()` / `toHaveBeenCalledWith(...args)` / `toHaveBeenCalledTimes(n)` — mock call assertions
- `.not` chaining — every matcher can be negated (e.g. `expect(x).not.toBe(y)`)

### Added (Mock)
- `fn().mock.calls` — exposes the accumulated argument arrays from each mock invocation

### Changed (Matcher)
- `toThrow()` argument expansion
  - no argument — only verifies that a throw happened
  - `RegExp` — matches against the error message
  - `Error` subclass — `instanceof` check
  - predicate function — receives the error object for custom inspection

### Improved (Internal)
- Added unit tests for the babel plugin, CLI, `loaderHook`, and reporter
- Improved testability of `loaderHook` / `setupEnvironment` (refactor Phases 1–5)
- Strengthened mock / lifecycle edge-case tests

### Docs
- Reorganized `docs/` into `docs/reference/` (user-facing) and `docs/internal/` (personal notes)
- Split CHANGELOG and API docs into English and Korean versions (`*.md` = English, `*.ko.md` = Korean)

## [0.5.0] 2026-04-16

### Added
- Virtual memory-based test execution
  - Replaced disk-based Babel transform with `module.registerHooks()` `load` hook
  - Test and source files are Babel-transformed **in memory only** and fed to Node — no disk writes
  - A single hook handles ESM `import`, dynamic `import()`, and CJS `require()`
- New `src/cli/loaderHook.js` — installs `registerHooks({ load })`
- New `src/cli/utils/transformSource.js` — pure Babel transform function with `filename:length:hash` cache

### Changed
- `setupFiles()` — simplified to only pre-collect mock paths
  - Removed the previous logic that eagerly transformed and overwrote every source file
- `runTests()` — removed per-file `transformFiles()` calls; uses `pathToFileURL` for `import`
- `bin/cli.js` — added `installLoaderHook()`; removed `finally { restoreFiles() }`
- `engines.node` → `>=22.15.0` (version that introduced `module.registerHooks`)

### Removed
- `src/cli/utils/transformFiles.js` — disk transform/restore logic and the `originalFiles` Map are no longer needed
- `findAllSourceFiles` from `src/cli/utils/findFiles.js` — eager scan no longer required

### Improvements
- Eliminated the risk of corrupting user source files on abnormal termination (SIGKILL, OOM, …)
- Tests can run even when source files are read-only (`chmod 444`)
- Projects without mocks pay zero Babel transform cost

### Docs
- Added `docs/가상메모리기반테스트실행.md` — design background and detailed flow
- Moved the detailed API reference from README to `docs/API.md`
- Rewrote README in present tense (removed strikethrough notes about past versions)

## [0.4.1] 2026-02-16

### Mock improvements
- `mock(path, moduleObject)`
  - Issue: previously required `path` to be registered as an absolute path
  - Fix:
    - Updated `babelTransformImport` to convert mock paths to absolute paths
    - Made `babelCollectMock` register paths as absolute

### Refactor
- Removed duplicated logic by reusing `findAbsolutePath`
- Renamed `babelTransformImport` to `babelTransform` since it now also handles mock path conversion

## [0.4.0] 2026-01-01

### Added
- Mock Functions
  - `fn()` — creates a mockable function
  - `mockImplementation()` — changes the mock function's implementation
  - `mockReturnValue()` — makes the mock always return a specific value
  - `mockReturnValueOnce()` — makes the mock return a specific value just once
  - `mockClear()` — resets the mock's internal state
- Module mocking improvements
  - `mock()` automatically converts every function in a module into a mock function
  - The converted mock functions support `mockImplementation()`, `mockReturnValue()`, etc.

## [0.3.3] 2025-12-26

### Refactor
**This refactor is the final cleanup before 0.4.0.**
- File reorganization
  - Moved CLI-related utilities from the shared `utils` directory into `src/cli/utils`
  - Restructured per-feature utility files for easier maintenance
- `formatString.js`
  - Moved the file-level `placeHolder` into the test class to drop an unnecessary module
  - Made `getMatcherForReplace` a private method on the class
  - Standardized naming conventions inside the file

## [0.3.2] 2025-12-10

### Refactor
- `cli.js`
  - Split the monolithic `main()` into `setupEnvironment.js`, `setupFiles.js`, and `runTests.js`
  - `main()` now only orchestrates the flow
- Babel plugins
  - Extracted shared wrapper-pattern generation logic out of the plugins
  - Each plugin now focuses solely on AST transformations
- Added JSDoc
  - Documented Babel-related logic and user-facing APIs
  - Specified parameter/return types and added usage examples
- Misc
  - Unified code style (function → arrow function in some places)
  - Filled in missing constants

### Doc fixes
- README typos
  - Fixed the partial-mocking import example
  - Refreshed the recent updates section at the top

## [0.3.1] 2025-12-08

### Bug fix
- Added missing files to `package.json` `files` field
  - Restored the `babelCollectMocks.js` plugin that had been left out

## [0.3.0] 2025-12-08

### Added
- Removed the requirement to `import` after `mock()`
  - Issue: previously, mocked modules had to be imported dynamically *after* the `mock()` call
  - Fix:
    - Replaced direct `mockStore` lookups at import time with a wrapper-pattern
    - Each module function becomes a wrapper that consults `mockStore` at call time
- Module transform optimization
  - Issue: the change above meant every imported module's functions consulted `mockStore` on every call
  - Fix:
    - The CLI now pre-scans `mock()` calls and collects the mocked paths
    - Babel transform only runs on imports whose path matches a pre-collected mock path

## [0.2.3] 2025-12-04

### Doc fixes
- Updated the `type` setting explanation in README
  - From 0.2.1, both ESM and CommonJS are supported
  - Added the dev blog link

### Config fixes
- `package.json`
  - Added repository and issue tracker links

### `rollup.config.js` output filenames
- Renamed `.cjs.js` → `.cjs`
- Renamed `esm.js` → `.mjs`

## [0.2.2] 2025-12-04

### Doc fixes
- README typo
  - Partial-mocking introduction version: 0.1.3 (typo) → 0.2.1

## [0.2.1] 2025-12-02

### Bug fixes
- CLI errors
  - Issue 1: `index.js` is built rather than directly exported, so the index file could not be located
  - Issue 2: Rollup produced two `testManager`s, and depending on the user's environment the package was loaded as ESM internally — breaking the CJS methods
  - Fix: the CLI now picks the correct index for the user's module system

## [0.2.0] 2025-12-02

### Added
- CommonJS support
  - Works in projects that use `require()`
  - Supports both ESM (`import`) and CommonJS (`require`)
  - Dual-package distribution (ESM + CJS) via Rollup
- Partial mocking
  - Allows mocking only some functions of a module while keeping the rest as the original
  - Improved mocking via the spread operator
  - Partial mocking works in both ESM and CommonJS

## [0.1.2] 2025-11-27

### Added
- Updated GitHub URLs after the repository move
- `cli.js`
  - `transformFiles`: extracted the Babel transform logic
  - `findFiles`: extracted file discovery logic for tests and sources
- `index.js`
  - Removed `run` from the public surface (users do not need it)
  - Split `expect` and matcher logic
- Renamed `tests.js`
  - Switched from exporting the class directly to exporting an instance variable

## [0.1.1] 2025-11-24

### Added
- Fixed Babel-transformed files not being restored when a syntax error occurred
  - The `transform → restore` cycle was skipped on syntax errors

## [0.1.0] 2025-11-20

### Added
- `test.each()`
  - Repeats the same test for each row in an array of cases
  - Supports placeholders (`%s`, `%o`)
  - Lets you exercise the same test logic against multiple datasets
- `beforeEach()`
  - Runs initialization code before each test
  - Outer `beforeEach` automatically runs in nested `describe` blocks
  - Guarantees test isolation
- Babel absolute-path conversion
  - Normalizes user-provided paths (relative or absolute) to absolute paths
  - Ensures consistent mocking behavior

### Changed
- Improved internal test management structure

## [0.0.2] 2025-11-17

### Added
- Fixed a bug introduced when the package became scoped
  - Updated the `js-te` path inside `babelTransformImport` to `@dannysir/js-te`

## [0.0.1] 2025-11-17

### Added
- Initial release
- Test authoring (`test`, `describe`, `expect`)
- Matchers
  - `toBe()` — value equality
  - `toEqual()` — object/array equality
  - `toThrow()` — error assertions
  - `toBeTruthy()` / `toBeFalsy()` — truthiness checks
- Mocking system
  - `mock()` — module mocking
  - `clearAllMocks()` — clear every mock
  - `unmock()` — clear a single mock
  - `isMocked()` — check whether a mock is registered
- Babel plugin that uses dynamic `import` to implement mocking
- Automatic test file discovery (`*.test.js` files, `test/` folder)
- CLI tool (`js-te` command)
- Nested `describe` blocks
- Colorized console output
