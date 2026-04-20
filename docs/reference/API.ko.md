# API 레퍼런스

`@dannysir/js-te` 의 모든 공개 API 를 정리한 문서입니다.

- [테스트 작성](#테스트-작성)
  - [`test(desc, fn)`](#testdesc-fn)
  - [`describe(name, fn)`](#describename-fn)
  - [`beforeEach(fn)`](#beforeeachfn)
  - [`test.each(cases)(template, fn)`](#testeachcasestemplate-fn)
- [Matcher](#matcher)
  - [`expect(value).toBe(expected)`](#expectvaluetobeexpected)
  - [`expect(value).toEqual(expected)`](#expectvaluetoequalexpected)
  - [`expect(fn).toThrow(matcher?)`](#expectfntothrowmatcher)
  - [`expect(value).toBeTruthy() / toBeFalsy()`](#expectvaluetobetruthy--tobefalsy)
  - [`expect(value).toContain(item)`](#expectvaluetocontainitem)
  - [`expect(value).toBeInstanceOf(Class)`](#expectvaluetobeinstanceofclass)
  - [`expect(value).toBeNull() / toBeUndefined() / toBeDefined()`](#expectvaluetobenull--tobeundefined--tobedefined)
  - [`expect(mockFn).toHaveBeenCalled() / toHaveBeenCalledWith(...args) / toHaveBeenCalledTimes(n)`](#expectmockfntohavebeencalled--tohavebeencalledwithargs--tohavebeencalledtimesn)
  - [`.not` 체이닝](#not-체이닝)
- [Mock Function](#mock-function)
  - [`fn(implementation?)`](#fnimplementation)
  - [`mockImplementation(fn)`](#mockimplementationfn)
  - [`mockReturnValue(value)`](#mockreturnvaluevalue)
  - [`mockReturnValueOnce(...values)`](#mockreturnvalueoncevalues)
  - [`mockClear()`](#mockclear)
  - [`mock.calls`](#mockcalls)
- [Module Mocking](#module-mocking)
  - [`mock(path, mockObj)`](#mockpath-mockobj)
  - [부분 모킹 (Partial Mocking)](#부분-모킹-partial-mocking)
  - [왜 반환 객체를 사용해야 하나요?](#왜-반환-객체를-사용해야-하나요)
  - [ESM / CommonJS 지원](#esm--commonjs-지원)
  - [`clearAllMocks()`](#clearallmocks)
  - [`unmock(path)`](#unmockpath)
  - [`isMocked(path)`](#ismockedpath)
- [실행 원리 요약](#실행-원리-요약)

---

## 테스트 작성

### `test(desc, fn)`

테스트 하나를 정의합니다.

```js
test('배열 길이 확인', () => {
  expect([1, 2, 3].length).toBe(3);
});
```

### `describe(name, fn)`

테스트를 그룹으로 묶습니다. 중첩할 수 있습니다.

```js
describe('계산기', () => {
  describe('더하기', () => {
    test('양수 더하기', () => {
      expect(2 + 3).toBe(5);
    });
  });

  describe('빼기', () => {
    test('양수 빼기', () => {
      expect(5 - 3).toBe(2);
    });
  });
});
```

### `beforeEach(fn)`

각 테스트 실행 전에 호출할 함수를 등록합니다. 중첩된 `describe` 블록에서는 **상위 `beforeEach` → 하위 `beforeEach`** 순서로 실행됩니다.

```js
describe('카운터 테스트', () => {
  let counter;

  beforeEach(() => {
    counter = 0;
  });

  test('카운터 증가', () => {
    counter++;
    expect(counter).toBe(1);
  });

  test('카운터는 0부터 시작', () => {
    expect(counter).toBe(0);
  });

  describe('중첩된 describe', () => {
    beforeEach(() => {
      counter = 10;
    });

    test('카운터는 10', () => {
      // 상위 beforeEach(0) → 하위 beforeEach(10) 순서로 실행
      expect(counter).toBe(10);
    });
  });
});
```

### `test.each(cases)(template, fn)`

`cases` 배열의 각 원소를 인자로 동일한 테스트를 반복 실행합니다. `cases` 는 반드시 **배열 타입**이어야 합니다.

#### 플레이스홀더

- `%s` — 문자열/숫자
- `%o` — 객체 (내부적으로 `JSON.stringify`)

```js
test.each([
  [1, 2, 3, 6],
  [3, 4, 5, 12],
  [10, 20, 13, 43],
  [10, 12, 13, 35],
])('[each test] - input : %s, %s, %s, %s', (a, b, c, result) => {
  expect(a + b + c).toBe(result);
});

/* 출력
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

/* 출력
✓ [each placeholder] - input : {"name":"dannysir","age":null}
*/
```

---

## Matcher

### `expect(value).toBe(expected)`

`===` 로 비교합니다. 숫자·문자열 같은 원시값 비교에 사용합니다.

```js
expect(5).toBe(5);
expect('안녕').toBe('안녕');
```

### `expect(value).toEqual(expected)`

객체·배열의 내용을 재귀적으로 비교합니다. **키 순서에 무관**하며, **순환 참조 객체**도 안전하게 비교합니다.

```js
expect({ name: '철수' }).toEqual({ name: '철수' });
expect([1, 2, 3]).toEqual([1, 2, 3]);

// 키 순서가 달라도 동등
expect({ a: 1, b: 2 }).toEqual({ b: 2, a: 1 });

// 순환 참조도 크래시 없이 비교
const a = { name: 'x' }; a.self = a;
const b = { name: 'x' }; b.self = b;
expect(a).toEqual(b);
```

### `expect(fn).toThrow(matcher?)`

함수가 에러를 던지는지 확인합니다. 인자 형태에 따라 검사 방식이 달라집니다.

| 인자 | 의미 |
| --- | --- |
| 없음 | throw 발생 여부만 확인 |
| `string` | 에러 메시지에 해당 문자열이 **포함**되는지 |
| `RegExp` | 에러 메시지가 정규식과 매칭되는지 |
| `Error` 서브클래스 | `instanceof` 검사 |
| `(err) => boolean` | predicate 함수가 `true` 를 반환하는지 |

```js
// throw 여부만
expect(() => { throw new Error('boom'); }).toThrow();

// 문자열 포함
expect(() => { throw new Error('에러 발생'); }).toThrow('에러');

// 정규식
expect(() => { throw new Error('code: 42'); }).toThrow(/code: \d+/);

// Error 서브클래스
class CustomError extends Error {}
expect(() => { throw new CustomError(); }).toThrow(CustomError);

// predicate
expect(() => { throw new Error('boom'); }).toThrow((err) => err.message.length > 3);
```

### `expect(value).toBeTruthy() / toBeFalsy()`

참/거짓 여부를 확인합니다.

```js
expect(true).toBeTruthy();
expect(0).toBeFalsy();
```

### `expect(value).toContain(item)`

배열에 특정 원소가 포함되어 있는지, 또는 문자열에 부분 문자열이 포함되어 있는지 검사합니다.

```js
expect([1, 2, 3]).toContain(2);
expect('hello world').toContain('world');
```

### `expect(value).toBeInstanceOf(Class)`

값이 주어진 클래스의 인스턴스인지 `instanceof` 로 검사합니다.

```js
class Animal {}
class Dog extends Animal {}

expect(new Dog()).toBeInstanceOf(Dog);
expect(new Dog()).toBeInstanceOf(Animal);
expect([]).toBeInstanceOf(Array);
```

### `expect(value).toBeNull() / toBeUndefined() / toBeDefined()`

`null` · `undefined` 여부를 정확히 검사합니다.

```js
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect(0).toBeDefined();         // undefined 가 아님
expect(null).toBeDefined();      // null 도 정의된 값으로 간주
```

### `expect(mockFn).toHaveBeenCalled() / toHaveBeenCalledWith(...args) / toHaveBeenCalledTimes(n)`

`fn()` 으로 만든 mock 함수의 호출 이력을 검증합니다. 내부적으로 `mockFn.mock.calls` 배열을 사용합니다.

```js
const mockFn = fn();
mockFn(1, 2);
mockFn('hello');

expect(mockFn).toHaveBeenCalled();              // 1회 이상 호출되었는지
expect(mockFn).toHaveBeenCalledTimes(2);        // 정확히 2회 호출되었는지
expect(mockFn).toHaveBeenCalledWith(1, 2);      // (1, 2) 인자로 호출된 적이 있는지
expect(mockFn).toHaveBeenCalledWith('hello');
```

`toHaveBeenCalledWith` 의 인자 비교는 `toEqual` 과 동일한 deep equal 을 사용하여 **키 순서 무관**·**순환 참조 안전** 입니다.

### `.not` 체이닝

모든 매처는 `.not` 으로 결과를 반전할 수 있습니다.

```js
expect(5).not.toBe(6);
expect([1, 2, 3]).not.toContain(99);
expect(mockFn).not.toHaveBeenCalled();
expect(() => 'ok').not.toThrow();
```

---

## Mock Function

`fn()` 으로 생성한 함수는 반환값·구현을 동적으로 제어할 수 있는 mock function 입니다. Jest 의 `jest.fn()` 과 유사한 역할을 합니다.

### `fn(implementation?)`

모킹 가능한 함수를 생성합니다. 인자로 초기 구현을 넘길 수 있습니다.

```js
import { fn } from '@dannysir/js-te';

test('mock function 기본 사용', () => {
  const mockFn = fn();

  mockFn('test');
  mockFn(1, 2, 3);

  // 기본적으로 undefined 반환
  expect(mockFn()).toBe(undefined);
});

test('초기 구현과 함께 생성', () => {
  const mockFn = fn((x, y) => x + y);

  expect(mockFn(1, 2)).toBe(3);
});
```

### `mockImplementation(fn)`

Mock 함수의 구현을 변경합니다.

```js
test('구현 변경하기', () => {
  const mockFn = fn();

  mockFn.mockImplementation((x) => x * 2);

  expect(mockFn(5)).toBe(10);
});
```

### `mockReturnValue(value)`

Mock 함수가 항상 특정 값을 반환하도록 설정합니다.

```js
test('고정 반환값 설정', () => {
  const mockFn = fn();

  mockFn.mockReturnValue(42);

  expect(mockFn()).toBe(42);
  expect(mockFn()).toBe(42);
});
```

### `mockReturnValueOnce(...values)`

Mock 함수가 지정된 값들을 순서대로 한 번씩 반환하도록 설정합니다. 큐가 비면 이전 설정값(또는 기본값)으로 돌아갑니다.

```js
test('일회성 반환값 설정', () => {
  const mockFn = fn();

  mockFn.mockReturnValueOnce(1, 2, 3);

  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(3);
  expect(mockFn()).toBe(undefined); // 큐가 비면 기본값
});

test('mockReturnValueOnce + mockReturnValue 조합', () => {
  const mockFn = fn();

  mockFn
    .mockReturnValueOnce(1, 2)
    .mockReturnValue(99);

  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(99); // 이후 계속 99
  expect(mockFn()).toBe(99);
});
```

### `mockClear()`

Mock 함수의 내부 상태(`returnQueue`, `implementation` 등)를 초기화합니다.

```js
test('mock 상태 초기화', () => {
  const mockFn = fn();

  mockFn.mockReturnValue(42);
  expect(mockFn()).toBe(42);

  mockFn.mockClear();
  expect(mockFn()).toBe(undefined); // 기본값으로 복귀
});
```

### `mock.calls`

mock 함수가 호출될 때마다 인자 배열이 누적됩니다. `toHaveBeenCalledWith` · `toHaveBeenCalledTimes` 매처가 내부적으로 사용하지만, 직접 접근하여 임의 검증도 가능합니다.

```js
const mockFn = fn();
mockFn(1, 2);
mockFn('a', 'b', 'c');

mockFn.mock.calls;        // [[1, 2], ['a', 'b', 'c']]
mockFn.mock.calls.length; // 2
mockFn.mock.calls[0];     // [1, 2]
```

`mockClear()` 호출 시 `mock.calls` 도 초기화됩니다.

---

## Module Mocking

### `mock(path, mockObj)`

모듈을 모킹합니다. **상대 경로·절대 경로 모두 지원**하며, 호출 순서와 `import` 순서에 관계없이 올바르게 동작합니다.

- `mock()` 은 모듈의 모든 함수를 자동으로 mock function 으로 변환합니다.
- `mock()` 은 변환된 모킹 객체를 반환합니다. 이 객체로만 `mockReturnValue` 등의 메서드에 접근할 수 있습니다.

```js
// math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

// math.test.js
import { add, multiply } from './math.js';

test('mock 객체 반환값 활용', () => {
  const mockedMath = mock('./math.js', {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b,
  });

  // ✅ 반환된 객체로 mock function 메서드 호출
  mockedMath.add.mockReturnValue(100);
  mockedMath.multiply.mockReturnValueOnce(50, 75);

  expect(add(1, 2)).toBe(100);
  expect(multiply(2, 3)).toBe(50);
  expect(multiply(2, 3)).toBe(75);
});
```

### 부분 모킹 (Partial Mocking)

모듈의 일부 함수만 모킹하고 나머지는 원본을 사용할 수 있습니다.

```js
// calculator.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// calculator.test.js
import { add, subtract, multiply } from './calculator.js';

test('multiply 만 모킹', () => {
  const mocked = mock('./calculator.js', {
    multiply: (a, b) => 999,
  });

  expect(add(2, 3)).toBe(5);         // 원본
  expect(subtract(5, 2)).toBe(3);    // 원본
  expect(multiply(2, 3)).toBe(999);  // 모킹

  // mock function 메서드로 동적 제어
  mocked.multiply.mockReturnValue(100);
  expect(multiply(2, 3)).toBe(100);

  mocked.multiply.mockReturnValueOnce(50, 75);
  expect(multiply(2, 3)).toBe(50);
  expect(multiply(2, 3)).toBe(75);
  expect(multiply(2, 3)).toBe(100); // 이전 설정값으로 복귀
});
```

### 왜 반환 객체를 사용해야 하나요?

**핵심 이유**: `import` 로 가져온 함수는 **wrapper 함수**이기 때문에 mock function 메서드를 직접 가지고 있지 않습니다.

`mock()` 은 모듈의 함수들을 mock function 으로 변환하여 `mockStore` 에 저장하고, 그 **변환된 객체**를 반환합니다. 한편 `import` 로 가져온 함수는 내부적으로 매 호출마다 `mockStore` 를 조회하는 wrapper 함수로 바뀌어 있어, 값은 올바르게 반환하지만 `mockReturnValue` 같은 메서드는 없습니다.

```js
const mockedMath = mock('./math.js', {
  add: (a, b) => a + b,
});

// ✅ mockedMath.add 는 실제 mock function (메서드 있음)
mockedMath.add.mockReturnValue(100);

// ❌ import 한 add 는 wrapper 함수 (메서드 없음)
import { add } from './math.js';
// add.mockReturnValue(100); // TypeError: add.mockReturnValue is not a function
```

wrapper 패턴에 대한 자세한 설명은 [가상메모리기반테스트실행.md § 4](../internal/가상메모리기반테스트실행.md#4-babel-변환-상세-wrapper-패턴) 를 참고하세요.

### ESM / CommonJS 지원

두 방식 모두 동일하게 모킹할 수 있습니다.

```js
// random.js
export const random = () => Math.random();

// game.js (ESM)
import { random } from './random.js';
export const play = () => random() * 10;

// 또는 game.js (CommonJS)
const { random } = require('./random.js');
module.exports.play = () => random() * 10;

// game.test.js
import { play } from './game.js';

test('모킹 동작', () => {
  const mocked = mock('./random.js', {
    random: () => 0.5,
  });

  expect(play()).toBe(5);

  mocked.random.mockReturnValue(0.3);
  expect(play()).toBe(3);

  mocked.random.mockReturnValueOnce(0.1);
  expect(play()).toBe(1);
  expect(play()).toBe(3); // 이전 설정값으로 복귀
});
```

### `clearAllMocks()`

등록된 모든 mock 을 `mockStore` 에서 제거합니다.

> 참고: `clearAllMocks()` 는 `mockStore` 에서 mock 을 제거할 뿐, 각 mock function 내부 상태(`returnQueue`, `implementation` 등)는 초기화하지 않습니다. 내부 상태도 초기화하려면 각 mock function 의 `mockClear()` 를 사용하세요.

### `unmock(path)`

특정 경로의 mock 만 제거합니다.

### `isMocked(path)`

특정 경로에 mock 이 등록되어 있는지 확인합니다.

---

## 실행 원리 요약

0.5.0 부터 js-te 는 Node.js 의 `module.registerHooks()` API 를 이용한 **`load` 훅** 으로 동작합니다.

1. CLI 시작 시 테스트 파일을 AST 파싱해 `mock()` 경로만 사전 수집
2. `registerHooks({ load })` 를 설치
3. 이후 모든 `import` / `require` 가 훅을 거치며, 사전 수집된 경로에 해당하는 파일만 Babel 로 변환하여 **메모리에서만** Node 에 반환
4. 변환된 코드는 `mock()` 호출 시점의 `mockStore` 를 런타임마다 조회하는 wrapper 패턴으로 만들어져, `mock()` 호출 순서·`import` 순서와 무관하게 올바른 값을 반환

사용자의 원본 파일은 **한 바이트도 수정되지 않습니다.** 자세한 설계 내용은 [가상메모리기반테스트실행.md](../internal/가상메모리기반테스트실행.md) 참고.
