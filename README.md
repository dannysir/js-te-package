# js-te

Jest에서 영감을 받아 만든 가벼운 JavaScript 테스트 프레임워크입니다.


## [📎 최근 업데이트 0.4.1v](https://github.com/dannysir/js-te-package/blob/main/CHANGELOG.md)

### `mock(path, mockObj)` 함수 개선
- 기존 `path`를 절대 경로만 등록 가능한 부분에 절대 경로도 가능하게 수정

```js
test('[mock module] - mocking random function (absolute path)', async () => {
  mock('../test-helper/random.js', { // 0.4.1부터 절대 경로도 등록 가능
    random: () => 3,
  });

  expect(play()).toBe(30);
});
```

### Mock Functions 기능 추가
- `fn()` 함수로 모킹 가능한 함수 생성
- Mock function 메서드 지원
    - `mockImplementation()` - 함수 구현 로직 변경
    - `mockReturnValue()` - 고정된 반환값 설정
    - `mockReturnValueOnce()` - 일회성 반환값 설정 (여러 번 호출 가능)
    - `mockClear()` - mock 상태 초기화
### Module Mocking 개선
- `mock()` 함수가 모듈의 모든 함수를 자동으로 mock function으로 변환
- 변환된 함수들도 `mockImplementation()`, `mockReturnValue()` 등 사용 가능

---
## 설치

```bash
npm install --save-dev @dannysir/js-te
```

## 빠른 시작

### 1. 테스트 파일 만들기

`*.test.js` 파일을 만들면 자동으로 찾아서 실행합니다.

별도의 import문 없이 `describe`와 `test`, `expect` 로직이 사용 가능합니다.

```javascript
// math.test.js
describe('[단순 연산 테스트]', () => {
  test('더하기 테스트', () => {
    expect(1 + 2).toBe(3);
  });
});
```

### 2. 테스트 실행

package.json에 추가.

- ~~type을 module로 설정해주세요.~~
> ✅ 0.2.1 버전부터 common js 방식을 지원합니다.

```json
{
  "type": "module", // 0.2.1 버전부터 common js도 사용 가능
  "scripts": {
    "test": "js-te"
  }
}
```

실행:
```bash
npm test
```

### 예시 출력 화면

<p align='center'>
  <img width="585" height="902" alt="스크린샷 2025-11-20 오후 12 22 27" src="https://github.com/user-attachments/assets/3d087a61-cc44-4f5b-8a2f-efd5f15c12b7" />
</p>

# API

## 테스트 작성

### `test(설명, 함수)`

테스트 하나를 정의합니다.

```javascript
test('배열 길이 확인', () => {
  expect([1, 2, 3].length).toBe(3);
});
```

#### `describe(이름, 함수)`

테스트를 그룹으로 묶습니다. 중첩도 됩니다.

```javascript
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

## Matcher

### `expect(값).toBe(기댓값)`

`===`로 비교합니다. 숫자, 문자열 같은 원시값 비교할 때 사용.

```javascript
expect(5).toBe(5);
expect('안녕').toBe('안녕');
```

### `expect(값).toEqual(기댓값)`

객체나 배열의 내용을 비교합니다.

```javascript
expect({ name: '철수' }).toEqual({ name: '철수' });
expect([1, 2, 3]).toEqual([1, 2, 3]);
```

### `expect(함수).toThrow(에러메시지)`

함수가 에러를 던지는지 확인합니다.

```javascript
expect(() => {
  throw new Error('에러 발생');
}).toThrow('에러');
```

### `expect(값).toBeTruthy()` / `expect(값).toBeFalsy()`

참/거짓 여부를 확인합니다.

```javascript
expect(true).toBeTruthy();
expect(0).toBeFalsy();
```

## Mocking

### 동작 원리

Babel을 사용해서 import/require 구문을 변환하여 mock 함수를 가져오도록 했습니다.

1. 테스트 파일 찾기
   1. `mock(path, mockObj)` 선언 확인
   2. `path`를 key로 이용해 Map에 저장
2. Babel로 코드 변환
```jsx
// 0.3.0 버전 이후
const _original = await import('./random.js');
const random = (...args) => {
  const module = mockStore.has('/path/to/random.js')
    ? { ..._original, ...mockStore.get('/path/to/random.js') }
    : _original;
  return module.random(...args);
};

// 0.3.0 버전 이전
const _original = await import('./random.js');
const _module = mockStore.has('/path/to/random.js')
  ? { ..._original, ...mockStore.get('/path/to/random.js') }
  : _original;
const {random1, random2} = _module;
```
3. 테스트 실행
4. 원본 파일 복구

### Mock Functions

**0.4.0 버전부터 Jest와 유사한 Mock Functions 기능을 제공합니다.**

`fn()` 함수로 생성한 mock function은 반환값 제어 등의 기능을 제공합니다.

### `fn(implementation : optional)`

모킹 가능한 함수를 생성합니다.

```javascript
import { fn } from '@dannysir/js-te';

test('mock function 기본 사용', () => {
  const mockFn = fn();
  
  mockFn('test');
  mockFn(1, 2, 3);
  
  // mock 함수는 기본적으로 undefined 반환
  expect(mockFn()).toBe(undefined);
});

test('초기 구현과 함께 생성', () => {
  const mockFn = fn((x, y) => x + y);
  
  expect(mockFn(1, 2)).toBe(3);
});
```

### `mockImplementation(fn)`

Mock 함수의 구현을 변경합니다.

```javascript
test('구현 변경하기', () => {
  const mockFn = fn();
  
  mockFn.mockImplementation((x) => x * 2);
  
  expect(mockFn(5)).toBe(10);
});
```

### `mockReturnValue(value)`

Mock 함수가 항상 특정 값을 반환하도록 설정합니다.

```javascript
test('고정 반환값 설정', () => {
  const mockFn = fn();
  
  mockFn.mockReturnValue(42);
  
  expect(mockFn()).toBe(42);
  expect(mockFn()).toBe(42);
  expect(mockFn()).toBe(42);
});
```

### `mockReturnValueOnce(...values)`

Mock 함수가 지정된 값들을 순서대로 한 번씩 반환하도록 설정합니다.

```javascript
test('일회성 반환값 설정', () => {
  const mockFn = fn();
  
  mockFn.mockReturnValueOnce(1, 2, 3);
  
  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(3);
  expect(mockFn()).toBe(undefined); // 큐가 비면 기본값 반환
});

test('mockReturnValueOnce와 mockReturnValue 조합', () => {
  const mockFn = fn();
  
  mockFn
    .mockReturnValueOnce(1, 2)
    .mockReturnValue(99);
  
  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(99); // 이후 계속 99 반환
  expect(mockFn()).toBe(99);
});
```

### `mockClear()`

Mock 함수의 상태를 초기화합니다.

```javascript
test('mock 상태 초기화', () => {
  const mockFn = fn();
  
  mockFn.mockReturnValue(42);
  expect(mockFn()).toBe(42);
  
  mockFn.mockClear();
  expect(mockFn()).toBe(undefined); // 기본값으로 돌아감
});
```

### Module Mocking

#### `mock(모듈 경로), mock객체)`

모듈을 모킹합니다. ~~import 하기 **전에** 호출해야 합니다.~~

> **0.4.0 버전부터 `mock()` 함수가 모듈의 모든 함수를 자동으로 mock function으로 변환합니다.**
> 
> **0.4.0 버전부터 `mock()` 함수가 모킹 객체를 리턴합니다.**

### **🚨 주의사항 (매우 중요)**

1. ~~**반드시 경로는 절대 경로로 입력해주세요.**~~
    - ~~babel이 import문에서 절대 경로로 변환하여 확인을 하기 때문에 반드시 절대 경로로 등록해주세요.~~
> 0.4.1 버전부터 상대 경로 등록이 가능합니다.
2. ~~import문을 반드시 mocking 이후에 선언해주세요.~~
    - ~~mocking 전에 import를 하게 되면 mocking되기 전의 모듈을 가져오게 됩니다.~~

> **0.3.0 버전부터 import문을 mock선언 이후에 하지 않아도 됩니다.**
3. **모킹한 모듈을 제어하고 싶다면 반드시 리턴 받은 객체를 활용하세요.**

**반환값 사용 예시**
```javascript
// math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

// math.test.js
import { add, multiply} from './math.js';
test('mock 객체 반환값 활용', () => {
  // mock() 함수가 모킹된 객체를 반환
  // example - { add : 모킹함수, multiply : 모킹함수}
  const mockedMath = mock('/absolute/path/to/math.js', {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b
  });
  
  // ⚠️ 중요: mock function 메서드는 반드시 반환받은 객체에 사용하세요
  // 올바른 사용 ✅
  mockedMath.add.mockReturnValue(100);
  mockedMath.multiply.mockReturnValueOnce(50, 75);
  // 잘못된 사용 ❌
  // add.mockReturnValue(100); // 동작하지 않습니다!
  
  expect(add(1, 2)).toBe(100);
  expect(multiply(2, 3)).toBe(50);
  expect(multiply(2, 3)).toBe(75);
  
});
```

### **왜 반환된 객체를 사용해야 하나요?**

**간략 설명**

wrapper 패턴을 통해 모듈을 변경하기 때문에 mock function에 접근이 불가

**상세 설명**

`mock()` 함수는 모듈의 함수들을 mock function으로 변환하여 mockStore에 저장합니다.

하지만 `import`로 가져온 함수는 wrapper 함수이기 때문에 mock function의 메서드(`mockReturnValue`, `mockImplementation` 등)를 직접 가지고 있지 않습니다.

따라서 mock function의 메서드를 사용하려면 **반드시 `mock()` 함수가 반환한 객체**를 통해 접근해야 합니다.
```javascript
// 동작 원리
const mockedMath = mock('/path/to/math.js', {
  add: (a, b) => a + b
});

// mockedMath.add는 실제 mock function (메서드 있음) ✅
mockedMath.add.mockReturnValue(100);

// import로 가져온 add는 wrapper 함수 (메서드 없음) ❌
const { add } = await import('./math.js');
// add.mockReturnValue(100); // TypeError: add.mockReturnValue is not a function
```

**💡 부분 모킹(Partial Mocking)**

0.2.1 버전부터 모듈의 일부 함수만 모킹하고 나머지는 원본을 사용할 수 있습니다.

```javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// math.test.js
const { add, subtract, multiply } = import('./math.js'); // 0.3.0 버전부터는 최상단에 선언 가능

test('부분 모킹 예제', async () => {
  mock('/Users/san/untitled/index.js', {
    multiply: () => 100
  });
  
  expect(add(2, 3)).toBe(5);        // 원본 함수 사용
  expect(subtract(5, 3)).toBe(2);   // 원본 함수 사용
  expect(multiply(2, 3)).toBe(100); // 모킹된 함수 사용
});
```

> 모킹을 한 모듈에 mock function을 쓰고 싶으면 

**📦 모듈 시스템 지원**

ESM(import)과 CommonJS(require) 모두 지원합니다.

```javascript
// ESM 방식
import { random } from './random.js';

// CommonJS 방식
const { random } = require('./random.js');
```

```javascript
// random.js
export const random = () => Math.random();

// game.js
import { random } from './random.js'; // 자유롭게 import하면 babel에서 절대 경로로 변환하여 판단합니다.
// 또는 CommonJS 방식도 지원
// const { random } = require('./random.js');

export const play = () => random() * 10;

// game.test.js
import {play} from './game.js';

test('랜덤 함수 모킹', async () => {
  // 1. 먼저 모킹
  mock('/Users/san/Js-Te/test-helper/random.js', { // 0.4.1 부터 상대 경로도 가능
    random: () => 0.5
  });
  
  // 2. 모킹된 값 사용
  expect(play()).toBe(5);
});

// 0.4.0 버전부터 mock functions 사용 가능
test('mock functions로 동적 제어', async () => {
  const mocked = mock('/Users/san/Js-Te/test-helper/random.js', {
    random: () => 0.5
  });
  
  expect(play()).toBe(5);
  
  // 반환값 동적 변경
  mocked.random.mockReturnValue(0.3);
  expect(play()).toBe(3);
  
  // 일회성 반환값 설정
  mocked.random.mockReturnValueOnce(0.1);
  expect(play()).toBe(1);
  expect(play()).toBe(3); // 이전 설정값으로 복귀
});
```

### `clearAllMocks()`

등록된 모든 mock을 제거합니다.

**참고**: `clearAllMocks()`는 mockStore에서 mock을 제거하지만, 각 mock function의 내부 상태(returnQueue, implementation 등)는 초기화하지 않습니다. Mock function의 상태를 초기화하려면 각 함수의 `mockClear()` 메서드를 사용하세요.

### `unmock(모듈경로)`

특정 mock만 제거합니다.

### `isMocked(모듈경로)`

mock이 등록되어 있는지 확인합니다.

## `each(cases)`

`cases`를 배열로 받아 순차적으로 테스트 진행

#### 🚨 주의 사항

`cases`는 반드시 `Array` 타입으로 받아야 합니다.

### 플레이스 홀더

- %s - 문자열/숫자
- %o - 객체 (JSON.stringify)

```jsx
test.each([
  [1, 2, 3, 6],
  [3, 4, 5, 12],
  [10, 20, 13, 43],
  [10, 12, 13, 35],
])('[each test] - input : %s, %s, %s, %s', (a, b, c, result) => {
  expect(a + b + c).toBe(result);
});

/* 출력 결과
✓ [each test] - input : 1, 2, 3, 6
✓ [each test] - input : 3, 4, 5, 12
✓ [each test] - input : 10, 20, 13, 43
✓ [each test] - input : 10, 12, 13, 35
 */

test.each([
  [{ name : 'dannysir', age : null}],
])('[each test placeholder] - input : %o', (arg) => {
  expect(arg.name).toBe('dannysir');
});

/* 출력 결과
✓ [each test placeholder] - input : {"name":"dannysir","age":null}
 */
```

## `beforeEach(함수)`

각 테스트가 진행되기 전에 실행할 함수를 선언합니다.

중첩된 describe에서의 `beforeEach`는 상위 describe의 `beforeEach`를 모두 실행한 후, 자신의 `beforeEach`를 실행합니다.

```jsx
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
      expect(counter).toBe(10);
    });
  });
});
```

## 테스트 파일 찾기 규칙

자동으로 다음 파일들을 찾아서 실행합니다:

1. `*.test.js` 파일
2. `test/` 폴더 안의 모든 `.js` 파일

```
프로젝트/
├── src/
│   ├── utils.js
│   └── utils.test.js       ✅
├── test/
│   ├── integration.js      ✅
│   └── e2e.js              ✅
└── calculator.test.js      ✅
```

## 예제

### 기본 테스트

```javascript
describe('문자열 테스트', () => {
  test('문자열 합치기', () => {
    const result = 'hello' + ' ' + 'world';
    expect(result).toBe('hello world');
  });
  
  test('대문자 변환', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });
});
```

### Mock Functions 기본 사용
```javascript
import { fn } from '@dannysir/js-te';

test('콜백 함수 모킹', () => {
  const mockCallback = fn((x) => x * 2);
  
  expect(mockCallback(21)).toBe(42);
  
  // 구현 변경
  mockCallback.mockImplementation((x) => x + 10);
  expect(mockCallback(5)).toBe(15);
});
```

### 전체 모킹
#### 모듈 모킹 (전체)
```javascript
// mocking.test.js
import {random} from '../src/test-helper/game.js'; // 0.2.4 버전부터 import문 상단 배치 가능

test('[mocking] - mocking random function', async () => {
  const mocked = mock('/Users/san/Js-Te/test-helper/random.js', {
    random: () => 3,
  });
  // 0.3.0 버전 이전까지는 반드시 mock 이후 동적 import문 작성
  // const {play} = await import('../src/test-helper/game.js');
  expect(play()).toBe(30);
  
  // 0.4.0 버전부터: 동적으로 반환값 변경 가능
  mocked.random.mockReturnValue(5);
  expect(play()).toBe(50);
});

// game.js
import {random} from '/test-helper/random.js'

export const play = () => {
  return random() * 10;
};

// random.js
export const random = () => Math.random();
```

#### 모듈 모킹 (부분)
```javascript
// calculator.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// calculator.test.js
test('[partial mocking] - mock only multiply', async () => {
  // multiply만 모킹, add와 subtract는 원본 사용
  const mocked = mock('/Users/san/Js-Te/calculator.js', {
    multiply: (a, b) => 999
  });
  
  const { add, subtract, multiply } = await import('./calculator.js');
  
  expect(add(2, 3)).toBe(5);        
  expect(subtract(5, 2)).toBe(3);   
  expect(multiply(2, 3)).toBe(999);
  
  // 0.4.0 버전부터: mock function 메서드 사용 가능
  mocked.multiply.mockReturnValue(100);
  expect(multiply(2, 3)).toBe(100);
  
  // 일회성 반환값
  mocked.multiply.mockReturnValueOnce(50, 75);
  expect(multiply(2, 3)).toBe(50);
  expect(multiply(2, 3)).toBe(75);
  expect(multiply(2, 3)).toBe(100); // 이전 설정값으로 복귀
});
```

## 링크

- [GitHub](https://github.com/dannysir/Js-Te)
- [블로그 포스트](https://velog.io/@dannysir/series/npm-테스트-라이브러리-만들기)

## 만든 이유

Jest를 사용하며 JavaScript 테스트 라이브러리의 구조가 궁금하여 만들게 되었습니다.

## 라이선스

ISC
