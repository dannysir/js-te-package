# API Reference

> Korean version: [API.ko.md](./API.ko.md)

A complete reference for every public API of `@dannysir/js-te`.

- [Writing tests](#writing-tests)
  - [`test(desc, fn)`](#testdesc-fn)
  - [`describe(name, fn)`](#describename-fn)
  - [`beforeEach(fn)`](#beforeeachfn)
  - [`test.each(cases)(template, fn)`](#testeachcasestemplate-fn)
- [Matchers](#matchers)
  - [`expect(value).toBe(expected)`](#expectvaluetobeexpected)
  - [`expect(value).toEqual(expected)`](#expectvaluetoequalexpected)
  - [`expect(fn).toThrow(matcher?)`](#expectfntothrowmatcher)
  - [`expect(value).toBeTruthy() / toBeFalsy()`](#expectvaluetobetruthy--tobefalsy)
  - [`expect(value).toContain(item)`](#expectvaluetocontainitem)
  - [`expect(value).toBeInstanceOf(Class)`](#expectvaluetobeinstanceofclass)
  - [`expect(value).toBeNull() / toBeUndefined() / toBeDefined()`](#expectvaluetobenull--tobeundefined--tobedefined)
  - [`expect(mockFn).toHaveBeenCalled() / toHaveBeenCalledWith(...args) / toHaveBeenCalledTimes(n)`](#expectmockfntohavebeencalled--tohavebeencalledwithargs--tohavebeencalledtimesn)
  - [`.not` chaining](#not-chaining)
- [Mock Functions](#mock-functions)
  - [`fn(implementation?)`](#fnimplementation)
  - [`mockImplementation(fn)`](#mockimplementationfn)
  - [`mockReturnValue(value)`](#mockreturnvaluevalue)
  - [`mockReturnValueOnce(...values)`](#mockreturnvalueoncevalues)
  - [`mockClear()`](#mockclear)
  - [`mock.calls`](#mockcalls)
- [Module Mocking](#module-mocking)
  - [`mock(path, mockObj)`](#mockpath-mockobj)
  - [Partial mocking](#partial-mocking)
  - [Why must I use the returned object?](#why-must-i-use-the-returned-object)
  - [ESM / CommonJS support](#esm--commonjs-support)
  - [`clearAllMocks()`](#clearallmocks)
  - [`unmock(path)`](#unmockpath)
  - [`isMocked(path)`](#ismockedpath)
- [How execution works](#how-execution-works)

---

## Writing tests

### `test(desc, fn)`

Defines a single test.

```js
test('array length', () => {
  expect([1, 2, 3].length).toBe(3);
});
```

### `describe(name, fn)`

Groups tests. Can be nested.

```js
describe('calculator', () => {
  describe('add', () => {
    test('positive numbers', () => {
      expect(2 + 3).toBe(5);
    });
  });

  describe('subtract', () => {
    test('positive numbers', () => {
      expect(5 - 3).toBe(2);
    });
  });
});
```

### `beforeEach(fn)`

Registers a function to run before every test. In nested `describe` blocks, **outer `beforeEach` runs first, then the inner one.**

```js
describe('counter', () => {
  let counter;

  beforeEach(() => {
    counter = 0;
  });

  test('increment', () => {
    counter++;
    expect(counter).toBe(1);
  });

  test('starts at 0', () => {
    expect(counter).toBe(0);
  });

  describe('nested describe', () => {
    beforeEach(() => {
      counter = 10;
    });

    test('counter is 10', () => {
      // outer beforeEach (0) → inner beforeEach (10)
      expect(counter).toBe(10);
    });
  });
});
```

### `test.each(cases)(template, fn)`

Runs the same test once per row in `cases`. `cases` **must be an array**.

#### Placeholders

- `%s` — string / number
- `%o` — object (rendered with `JSON.stringify`)

```js
test.each([
  [1, 2, 3, 6],
  [3, 4, 5, 12],
  [10, 20, 13, 43],
  [10, 12, 13, 35],
])('[each test] - input : %s, %s, %s, %s', (a, b, c, result) => {
  expect(a + b + c).toBe(result);
});

/* output
✓ [each test] - input : 1, 2, 3, 6
✓ [each test] - input : 3, 4, 5, 12
✓ [each test] - input : 10, 20, 13, 43
✓ [each test] - input : 10, 12, 13, 35
*/

test.each([
  [{ name: 'dannysir', age: null }],
])('[each placeholder] - input : %o', (arg) => {
  expect(arg.name).toBe('dannysir');
});

/* output
✓ [each placeholder] - input : {"name":"dannysir","age":null}
*/
```

---

## Matchers

### `expect(value).toBe(expected)`

Compares with `===`. Use for primitives like numbers and strings.

```js
expect(5).toBe(5);
expect('hello').toBe('hello');
```

### `expect(value).toEqual(expected)`

Recursively compares the contents of objects and arrays. The comparison is **key-order independent** and **safe against circular references**.

```js
expect({ name: 'Alice' }).toEqual({ name: 'Alice' });
expect([1, 2, 3]).toEqual([1, 2, 3]);

// equal regardless of key order
expect({ a: 1, b: 2 }).toEqual({ b: 2, a: 1 });

// circular references are handled without crashing
const a = { name: 'x' }; a.self = a;
const b = { name: 'x' }; b.self = b;
expect(a).toEqual(b);
```

### `expect(fn).toThrow(matcher?)`

Asserts that the function throws. The argument decides how the thrown error is checked.

| Argument | Meaning |
| --- | --- |
| (none) | Only verifies that a throw happened |
| `string` | Error message **contains** the string |
| `RegExp` | Error message matches the pattern |
| `Error` subclass | `instanceof` check |
| `(err) => boolean` | Predicate returns `true` for the error |

```js
// throw or not
expect(() => { throw new Error('boom'); }).toThrow();

// substring
expect(() => { throw new Error('Something failed'); }).toThrow('failed');

// regex
expect(() => { throw new Error('code: 42'); }).toThrow(/code: \d+/);

// Error subclass
class CustomError extends Error {}
expect(() => { throw new CustomError(); }).toThrow(CustomError);

// predicate
expect(() => { throw new Error('boom'); }).toThrow((err) => err.message.length > 3);
```

### `expect(value).toBeTruthy() / toBeFalsy()`

Checks truthiness.

```js
expect(true).toBeTruthy();
expect(0).toBeFalsy();
```

### `expect(value).toContain(item)`

Checks whether an array contains the item, or whether a string contains the substring.

```js
expect([1, 2, 3]).toContain(2);
expect('hello world').toContain('world');
```

### `expect(value).toBeInstanceOf(Class)`

Checks `value instanceof Class`.

```js
class Animal {}
class Dog extends Animal {}

expect(new Dog()).toBeInstanceOf(Dog);
expect(new Dog()).toBeInstanceOf(Animal);
expect([]).toBeInstanceOf(Array);
```

### `expect(value).toBeNull() / toBeUndefined() / toBeDefined()`

Strict checks for `null` / `undefined`.

```js
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect(0).toBeDefined();         // not undefined
expect(null).toBeDefined();      // null still counts as defined
```

### `expect(mockFn).toHaveBeenCalled() / toHaveBeenCalledWith(...args) / toHaveBeenCalledTimes(n)`

Verifies the call history of a mock function created by `fn()`. Internally driven by `mockFn.mock.calls`.

```js
const mockFn = fn();
mockFn(1, 2);
mockFn('hello');

expect(mockFn).toHaveBeenCalled();              // called at least once
expect(mockFn).toHaveBeenCalledTimes(2);        // called exactly twice
expect(mockFn).toHaveBeenCalledWith(1, 2);      // called with (1, 2) at some point
expect(mockFn).toHaveBeenCalledWith('hello');
```

`toHaveBeenCalledWith` uses the same deep equal as `toEqual` to compare arguments, so it is **key-order independent** and **safe against circular references**.

### `.not` chaining

Every matcher can be negated by chaining `.not`.

```js
expect(5).not.toBe(6);
expect([1, 2, 3]).not.toContain(99);
expect(mockFn).not.toHaveBeenCalled();
expect(() => 'ok').not.toThrow();
```

---

## Mock Functions

A function returned by `fn()` is a mock function whose return value and implementation can be controlled at runtime — analogous to Jest's `jest.fn()`.

### `fn(implementation?)`

Creates a mockable function. Optionally takes an initial implementation.

```js
import { fn } from '@dannysir/js-te';

test('mock function basics', () => {
  const mockFn = fn();

  mockFn('test');
  mockFn(1, 2, 3);

  // returns undefined by default
  expect(mockFn()).toBe(undefined);
});

test('with initial implementation', () => {
  const mockFn = fn((x, y) => x + y);

  expect(mockFn(1, 2)).toBe(3);
});
```

### `mockImplementation(fn)`

Replaces the mock function's implementation.

```js
test('change implementation', () => {
  const mockFn = fn();

  mockFn.mockImplementation((x) => x * 2);

  expect(mockFn(5)).toBe(10);
});
```

### `mockReturnValue(value)`

Makes the mock always return the given value.

```js
test('fixed return value', () => {
  const mockFn = fn();

  mockFn.mockReturnValue(42);

  expect(mockFn()).toBe(42);
  expect(mockFn()).toBe(42);
});
```

### `mockReturnValueOnce(...values)`

Queues up one-shot return values. After the queue is drained, the mock falls back to the previously-set value (or the default).

```js
test('one-shot return values', () => {
  const mockFn = fn();

  mockFn.mockReturnValueOnce(1, 2, 3);

  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(3);
  expect(mockFn()).toBe(undefined); // queue empty → default
});

test('mockReturnValueOnce + mockReturnValue', () => {
  const mockFn = fn();

  mockFn
    .mockReturnValueOnce(1, 2)
    .mockReturnValue(99);

  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(99); // 99 from now on
  expect(mockFn()).toBe(99);
});
```

### `mockClear()`

Resets the mock's internal state (`returnQueue`, `implementation`, `mock.calls`, …).

```js
test('reset mock state', () => {
  const mockFn = fn();

  mockFn.mockReturnValue(42);
  expect(mockFn()).toBe(42);

  mockFn.mockClear();
  expect(mockFn()).toBe(undefined); // back to default
});
```

### `mock.calls`

Every call to a mock function appends its argument array to `mockFn.mock.calls`. The `toHaveBeenCalledWith` / `toHaveBeenCalledTimes` matchers use it under the hood, but you can also inspect it directly.

```js
const mockFn = fn();
mockFn(1, 2);
mockFn('a', 'b', 'c');

mockFn.mock.calls;        // [[1, 2], ['a', 'b', 'c']]
mockFn.mock.calls.length; // 2
mockFn.mock.calls[0];     // [1, 2]
```

`mockClear()` also empties `mock.calls`.

---

## Module Mocking

### `mock(path, mockObj)`

Mocks a module. **Both relative and absolute paths are supported**, regardless of the order in which `mock()` and `import` are called.

- `mock()` automatically converts every function in the module to a mock function.
- `mock()` returns the converted mock object — that returned object is the only way to call `mockReturnValue` and friends.

```js
// math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

// math.test.js
import { add, multiply } from './math.js';

test('using the returned mock object', () => {
  const mockedMath = mock('./math.js', {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b,
  });

  // ✅ call mock function methods through the returned object
  mockedMath.add.mockReturnValue(100);
  mockedMath.multiply.mockReturnValueOnce(50, 75);

  expect(add(1, 2)).toBe(100);
  expect(multiply(2, 3)).toBe(50);
  expect(multiply(2, 3)).toBe(75);
});
```

### Partial mocking

You can mock just some functions and let the rest fall through to the original implementation.

```js
// calculator.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// calculator.test.js
import { add, subtract, multiply } from './calculator.js';

test('mock only multiply', () => {
  const mocked = mock('./calculator.js', {
    multiply: (a, b) => 999,
  });

  expect(add(2, 3)).toBe(5);         // original
  expect(subtract(5, 2)).toBe(3);    // original
  expect(multiply(2, 3)).toBe(999);  // mocked

  // dynamic control via mock function methods
  mocked.multiply.mockReturnValue(100);
  expect(multiply(2, 3)).toBe(100);

  mocked.multiply.mockReturnValueOnce(50, 75);
  expect(multiply(2, 3)).toBe(50);
  expect(multiply(2, 3)).toBe(75);
  expect(multiply(2, 3)).toBe(100); // back to the previous value
});
```

### Why must I use the returned object?

**Short answer:** the function you `import` is a **wrapper** function — it does not carry mock function methods.

`mock()` converts the module's exports into mock functions and stores them in `mockStore`, then returns that converted object. The function bound to your `import` is rewritten into a wrapper that consults `mockStore` on every call. The wrapper returns the right value, but it does not expose `mockReturnValue` and friends.

```js
const mockedMath = mock('./math.js', {
  add: (a, b) => a + b,
});

// ✅ mockedMath.add is the real mock function (has the methods)
mockedMath.add.mockReturnValue(100);

// ❌ the imported `add` is a wrapper (no methods)
import { add } from './math.js';
// add.mockReturnValue(100); // TypeError: add.mockReturnValue is not a function
```

For the full design of the wrapper pattern see [로더훅기반인메모리변환.md § 4](../internal/로더훅기반인메모리변환.md#4-babel-변환-상세-wrapper-패턴) (Korean).

### ESM / CommonJS support

Both module systems are mocked the same way.

```js
// random.js
export const random = () => Math.random();

// game.js (ESM)
import { random } from './random.js';
export const play = () => random() * 10;

// or game.js (CommonJS)
const { random } = require('./random.js');
module.exports.play = () => random() * 10;

// game.test.js
import { play } from './game.js';

test('mocking', () => {
  const mocked = mock('./random.js', {
    random: () => 0.5,
  });

  expect(play()).toBe(5);

  mocked.random.mockReturnValue(0.3);
  expect(play()).toBe(3);

  mocked.random.mockReturnValueOnce(0.1);
  expect(play()).toBe(1);
  expect(play()).toBe(3); // back to the previous value
});
```

### `clearAllMocks()`

Removes every registered mock from `mockStore`.

> Note: `clearAllMocks()` only removes entries from `mockStore`. It does **not** reset each mock function's internal state (`returnQueue`, `implementation`, `mock.calls`, …). To reset that state, call `mockClear()` on the individual mock function.

### `unmock(path)`

Removes a single mock by path.

### `isMocked(path)`

Returns whether a path currently has a registered mock.

---

## How execution works

Since 0.5.0 js-te runs through a **`load` hook** registered with Node's `module.registerHooks()` API.

1. On startup the CLI parses each test file's AST and pre-collects only the paths passed to `mock()`.
2. `registerHooks({ load })` is installed.
3. Every subsequent `import` / `require` flows through the hook. Only files matching a pre-collected mock path get Babel-transformed, **in memory only**, before being handed back to Node.
4. The transformed code uses the wrapper pattern: each call consults `mockStore` at call time, so the result is correct regardless of the order between `mock()` and `import`.

The user's source files are **never modified on disk**. See [로더훅기반인메모리변환.md](../internal/로더훅기반인메모리변환.md) (Korean) for the full design.
