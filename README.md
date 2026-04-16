# js-te

[한국어](./README.ko.md)

A lightweight JavaScript test framework inspired by Jest.

## [📎 Latest Update — 0.5.0](./CHANGELOG.md)

### Virtual Memory-based Test Execution

Uses `module.registerHooks()` to Babel-transform test and source files **entirely in memory** — no disk writes.

- Eliminates source file corruption on abnormal process termination
- Works with read-only files (`chmod 444`)
- Zero transform cost for projects without mocks

See [Virtual Memory-based Test Execution](./docs/가상메모리기반테스트실행.md) for design details.

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

---

## Features

- **Test writing** — `test()`, `describe()`, `beforeEach()`, `test.each()`
- **Matchers** — `toBe`, `toEqual`, `toThrow`, `toBeTruthy`, `toBeFalsy`
- **Mock Functions** — `fn()`, `mockImplementation`, `mockReturnValue`, `mockReturnValueOnce`, `mockClear`
- **Module Mocking** — `mock(path, mockObj)` (relative & absolute paths), `clearAllMocks`, `unmock`, `isMocked`
- **Module systems** — ESM (`import`) and CommonJS (`require`)
- **CLI** — single `js-te` command

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

> ⚠️ Mock function methods (`mockReturnValue`, etc.) are only accessible through the object returned by `mock()`. See [why](./docs/API.md#왜-반환-객체를-사용해야-하나요) in the API docs.

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

- [API Reference](./docs/API.md) — full usage for `test`, `expect`, `mock`, `fn`, `beforeEach`, `test.each`
- [Virtual Memory-based Test Execution](./docs/가상메모리기반테스트실행.md) — 0.5.0 internals
- [CHANGELOG](./CHANGELOG.md) — version history

## Links

- [GitHub](https://github.com/dannysir/js-te-package)
- [Blog series (Korean)](https://velog.io/@dannysir/series/npm-테스트-라이브러리-만들기)

## Motivation

Built out of curiosity about how JavaScript test frameworks like Jest work under the hood.

## License

ISC
