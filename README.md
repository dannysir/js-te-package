# js-te

[한국어](./README.ko.md)

A lightweight JavaScript test framework inspired by Jest.

## [📎 Latest Update — 0.9.2](./CHANGELOG.md)

### Browser entry gains `.only` / `.skip` / `.todo` (0.9.2)

- The `@dannysir/js-te/browser` entry now defines `test.only` / `.skip` / `.todo` and `describe.only` / `.skip`, which were declared in its types but missing at runtime — calling them in the browser previously threw a `TypeError`. See [Browser usage](#browser-usage).

### Browser bundle drops the `node:url` import (0.9.1)

- The `@dannysir/js-te/browser` bundle no longer imports the `node:url` builtin, so it loads correctly in browser/Web Worker bundlers (Vite, Turbopack, …). Node CLI behavior (`--testLocation`) is unchanged. See [Browser usage](#browser-usage).

### Focus & skip modifiers (0.9.0)

- **`.only` / `.skip` / `.todo`** — Jest/Vitest-style focus and skip modifiers for `test` and `describe`. See [Focusing & Skipping](#focusing--skipping).

### Location filter & JSON reporter (0.8.0)

- `--testLocation <path>:<line>` runs a single test by file and line; `--reporter json` prints machine-readable results for IDE/CI.

See the full [CHANGELOG](./CHANGELOG.md) for earlier releases.

---

## Requirements

- **Node.js >= 22.15.0** (version that introduced `module.registerHooks`)

## Installation

```bash
npm install --save-dev @dannysir/js-te
```

## Quick Start

### 1. Create a test file

Any `*.test.js` file is picked up and run automatically. No `import` needed — `describe`, `test`, `expect`, and friends are available globally.

```js
// math.test.js
describe('[arithmetic]', () => {
  test('addition', () => {
    expect(1 + 2).toBe(3);
  });
});
```

### 2. Add a script to package.json

Both ESM and CommonJS projects are supported.

```json
{
  "scripts": {
    "test": "js-te"
  }
}
```

### 3. Run

```bash
npm test
```

### Example output

<p align='center'>
  <img width="585" height="902" alt="js-te output example" src="https://github.com/user-attachments/assets/3d087a61-cc44-4f5b-8a2f-efd5f15c12b7" />
</p>

### Running a subset

```bash
js-te                 # all tests
js-te user            # files whose path includes "user"
js-te -t "login"      # tests whose full name includes "login"
js-te auth -t "token" # combine both
js-te --testLocation test/user.test.js:42  # single test by file and line
js-te --reporter json # JSON output for IDE/CI
js-te --help          # help
```

See the [CLI reference](./docs/reference/CLI.md) for full options, matching rules, and exit codes.

### `--help` output

<p align='center'>
  <img width="728" height="388" alt="스크린샷 2026-04-24 오후 5 06 47" src="https://github.com/user-attachments/assets/82bb1b83-030b-4f69-91c2-f3a88a81663a" />
</p>

---


## Features

- **Test writing** — `test()`, `describe()`, `beforeEach()`, `test.each()`, `test.only`, `test.skip`, `test.todo`, `describe.only`, `describe.skip`
- **Matchers** — `toBe`, `toEqual`, `toThrow`, `toBeTruthy`, `toBeFalsy`, `toContain`, `toBeInstanceOf`, `toBeNull`, `toBeUndefined`, `toBeDefined`, `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`, `.not` chaining
- **Mock Functions** — `fn()`, `mockImplementation`, `mockReturnValue`, `mockReturnValueOnce`, `mockClear`, `mock.calls`
- **Module Mocking** — `mock(path, mockObj)` (relative & absolute paths), `clearAllMocks`, `unmock`, `isMocked`
- **Module systems** — ESM (`import`) and CommonJS (`require`)
- **CLI** — single `js-te` command
- **Browser entry** — `@dannysir/js-te/browser` exposes the core API for browsers and Web Workers
- **TypeScript** — bundled `.d.ts` declarations for the main and `/browser` entries

## Examples

### Tests & Matchers

```js
describe('calculator', () => {
  test('addition', () => {
    expect(2 + 3).toBe(5);
  });

  test('object equality', () => {
    expect({ name: 'Alice' }).toEqual({ name: 'Alice' });
  });
});
```

### Focusing & Skipping

```js
describe('user', () => {
  test.only('focused — only this runs in this file', () => {
    expect(1 + 1).toBe(2);
  });

  test('skipped while .only exists in the same file', () => {
    // not executed
  });

  test.skip('explicitly skipped', () => {
    // not executed
  });

  test.todo('write reset-password test');
});

describe.only('whole group runs in focus mode', () => {
  test('a', () => {});
  test('b', () => {});
});

describe.skip('temporarily disabled suite', () => {
  test('all tests inside are reported as skipped', () => {});
});
```

`.only` is scoped to a single file: a file with at least one `.only` runs only the focused tests there, while other files are unaffected. The closest explicit modifier wins — `test.skip` inside `describe.only` stays skipped, and `test.only` inside `describe.skip` runs.

### Module Mocking

```js
// game.js
import { random } from './random.js';
export const play = () => random() * 10;

// game.test.js
import { play } from './game.js';

test('mock random function', () => {
  const mocked = mock('./random.js', {
    random: () => 0.5,
  });

  expect(play()).toBe(5);

  // dynamically change return value via mock function methods
  mocked.random.mockReturnValue(0.3);
  expect(play()).toBe(3);
});
```

> ⚠️ Mock function methods (`mockReturnValue`, etc.) are only accessible through the object returned by `mock()`. See [why](./docs/reference/API.md#why-must-i-use-the-returned-object) in the API docs.

---

## Browser usage

`@dannysir/js-te/browser` is a browser/Web Worker-safe entry that re-exports the pure test core. Reach for it when you run js-te test code directly in the browser (interactive demos, playgrounds) — the default `@dannysir/js-te` entry depends on the Node CLI runner and can't run there.

```js
import { describe, test, expect, fn, beforeEach, testManager } from '@dannysir/js-te/browser';

describe('math', () => {
  test('addition', () => {
    expect(1 + 2).toBe(3);
  });
});

await testManager.run();
```

**Exported:** `test` (with `test.each`, `test.only`, `test.skip`, `test.todo`), `describe` (with `describe.only`, `describe.skip`), `beforeEach`, `expect`, `fn`, `testManager`.

**Not exported:** module mocking (`mock`, `unmock`, `isMocked`, `clearAllMocks`, `mockStore`) and the CLI runner (`run`) — these are Node-only and intentionally left out.

> `testManager` is a module-level singleton. If you collect tests more than once on the same page, call `testManager.clearTests()` between runs.

**Node guard** — in a Node runtime this entry resolves to a guard build; calling any of its exports throws, pointing you to the main `@dannysir/js-te` entry (or the `js-te` CLI):

```
@dannysir/js-te/browser cannot be used in a Node.js runtime.
It is designed for browsers and Web Workers only.
```

**TypeScript** — type declarations ship with the package (`types/browser.d.ts`), so the entry is fully typed with no extra setup.

---

## Test File Discovery

The following files are found and run automatically:

1. `*.test.js` files anywhere in the project
2. All `.js` files inside a `test/` folder

```
project/
├── src/
│   ├── utils.js
│   └── utils.test.js       ✅
├── test/
│   ├── integration.js      ✅
│   └── e2e.js              ✅
└── calculator.test.js      ✅
```

---

## Documentation

- [API Reference](./docs/reference/API.md) — full usage for `test`, `expect`, `mock`, `fn`, `beforeEach`, `test.each`
- [CLI Reference](./docs/reference/CLI.md) — command-line options, matching rules, and exit codes
- [Loader hook-based in-memory transform](./docs/internal/로더훅기반인메모리변환.md) — 0.5.0 internals (Korean)
- [CHANGELOG](./CHANGELOG.md) — version history

## Links

- [GitHub](https://github.com/dannysir/js-te-package)
- [Blog series (Korean)](https://velog.io/@dannysir/series/npm-테스트-라이브러리-만들기)

## Motivation

Built out of curiosity about how JavaScript test frameworks like Jest work under the hood.

## License

ISC
