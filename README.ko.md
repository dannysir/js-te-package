# js-te

[English](./README.md)

Jest에서 영감을 받아 만든 가벼운 JavaScript 테스트 프레임워크입니다.

## [📎 최근 업데이트 — 0.7.4](./CHANGELOG.ko.md)

### 프로젝트 홈페이지 (0.7.4)

- `package.json` 에 `homepage` 필드 추가 — npm 패키지 페이지에서 [프로젝트 사이트](https://dannysir-labs.vercel.app/en/libraries/js-te)로 연결. 메타데이터 변경만 있고 API·런타임 동작 변화 없음.

### 브라우저 entry & TypeScript 타입 선언 (0.7.3)

- **브라우저 entry** — `@dannysir/js-te/browser` 가 코어 API(`test`, `describe`, `beforeEach`, `expect`, `fn`, `testManager`)를 re-export 하여 Node CLI 러너가 동작하지 않는 브라우저·Web Worker 에서도 사용 가능
- Node 런타임에서 `/browser` 를 import 하면 명확한 에러를 던져 메인 entry 나 `js-te` CLI 로 안내
- **TypeScript** — 메인 entry 와 `/browser` entry 양쪽에 `.d.ts` 타입 선언을 함께 배포하여 별도 설정 없이 타입 지원

자세한 내용은 [브라우저 사용](#브라우저-사용) 을 참고하세요.

---

## 요구 사항

- **Node.js >= 22.15.0** (`module.registerHooks` 도입 버전)

## 설치

```bash
npm install --save-dev @dannysir/js-te
```

## 빠른 시작

### 1. 테스트 파일 만들기

`*.test.js` 파일을 만들면 자동으로 찾아서 실행합니다. 별도의 `import` 없이 `describe`, `test`, `expect` 등을 바로 사용할 수 있습니다.

```js
// math.test.js
describe('[단순 연산 테스트]', () => {
  test('더하기 테스트', () => {
    expect(1 + 2).toBe(3);
  });
});
```

### 2. package.json 에 스크립트 등록

ESM / CommonJS 프로젝트 모두 지원합니다.

```json
{
  "scripts": {
    "test": "js-te"
  }
}
```

### 3. 실행

```bash
npm test
```

### 예시 출력 화면

<p align='center'>
  <img width="585" height="902" alt="js-te 실행 예시" src="https://github.com/user-attachments/assets/3d087a61-cc44-4f5b-8a2f-efd5f15c12b7" />
</p>

### 부분 실행

```bash
js-te                 # 전체 테스트
js-te user            # 경로에 "user" 가 포함된 파일
js-te -t "로그인"     # 풀네임에 "로그인" 이 포함된 테스트
js-te auth -t "토큰"  # 두 필터 조합
js-te --testLocation test/user.test.js:42  # 파일과 라인으로 단일 테스트 실행
js-te --reporter json # IDE/CI 용 JSON 출력
js-te --help          # 도움말
```

옵션·매칭 규칙·종료 코드 상세는 [CLI 레퍼런스](./docs/reference/CLI.ko.md) 를 참고하세요.

### `--help` 출력

<p align='center'>
  <img width="728" height="388" alt="스크린샷 2026-04-24 오후 5 06 47" src="https://github.com/user-attachments/assets/82bb1b83-030b-4f69-91c2-f3a88a81663a" />
</p>

---

## 핵심 기능

- **테스트 작성** — `test()`, `describe()`, `beforeEach()`, `test.each()`, `test.only`, `test.skip`, `test.todo`, `describe.only`, `describe.skip`
- **Matcher** — `toBe`, `toEqual`, `toThrow`, `toBeTruthy`, `toBeFalsy`, `toContain`, `toBeInstanceOf`, `toBeNull`, `toBeUndefined`, `toBeDefined`, `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`, `.not` 체이닝
- **Mock Function** — `fn()`, `mockImplementation`, `mockReturnValue`, `mockReturnValueOnce`, `mockClear`, `mock.calls`
- **Module Mocking** — `mock(path, mockObj)` (상대/절대 경로 모두 지원), `clearAllMocks`, `unmock`, `isMocked`
- **모듈 시스템** — ESM(`import`) · CommonJS(`require`) 동시 지원
- **CLI** — `js-te` 명령 한 줄
- **브라우저 entry** — `@dannysir/js-te/browser` 로 브라우저·Web Worker 에서 코어 API 사용
- **TypeScript** — 메인 entry 와 `/browser` entry 용 `.d.ts` 타입 선언 동봉

## 간단 사용 예

### 테스트 & Matcher

```js
describe('계산기', () => {
  test('더하기', () => {
    expect(2 + 3).toBe(5);
  });

  test('객체 비교', () => {
    expect({ name: '철수' }).toEqual({ name: '철수' });
  });
});
```

### 집중 실행 & 스킵

```js
describe('user', () => {
  test.only('focused — 같은 파일에서 이것만 실행', () => {
    expect(1 + 1).toBe(2);
  });

  test('같은 파일에 .only 가 있으면 스킵됨', () => {
    // 실행되지 않음
  });

  test.skip('명시적으로 스킵', () => {
    // 실행되지 않음
  });

  test.todo('reset-password 테스트 작성 예정');
});

describe.only('그룹 전체 focus 모드로 실행', () => {
  test('a', () => {});
  test('b', () => {});
});

describe.skip('일시적으로 비활성화된 suite', () => {
  test('안의 테스트는 모두 skipped 로 보고', () => {});
});
```

`.only` 는 **파일 단위**입니다. 파일에 `.only` 가 하나라도 있으면 그 파일에서는 focus 된 테스트만 실행하고, 다른 파일은 영향받지 않습니다. 중첩된 경우 **가장 가까운 명시 modifier 가 우선**합니다 — `describe.only` 안의 `test.skip` 은 그대로 skip, `describe.skip` 안의 `test.only` 는 그대로 실행됩니다.

### 모듈 모킹

```js
// game.js
import { random } from './random.js';
export const play = () => random() * 10;

// game.test.js
import { play } from './game.js';

test('랜덤 함수 모킹', () => {
  const mocked = mock('./random.js', {
    random: () => 0.5,
  });

  expect(play()).toBe(5);

  // mock function 메서드로 반환값 동적 변경
  mocked.random.mockReturnValue(0.3);
  expect(play()).toBe(3);
});
```

> ⚠️ `mock()` 이 반환한 객체로만 mock function 메서드(`mockReturnValue` 등)에 접근할 수 있습니다. 자세한 이유는 [API 문서](./docs/reference/API.ko.md#왜-반환-객체를-사용해야-하나요)를 참고하세요.

---

## 브라우저 사용

`@dannysir/js-te/browser` 는 브라우저·Web Worker 에서 안전하게 쓸 수 있는 entry 로, 순수 테스트 코어만 re-export 합니다. 브라우저에서 js-te 테스트 코드를 직접 실행할 때(인터랙티브 시연, 플레이그라운드 등) 사용하세요 — 기본 `@dannysir/js-te` entry 는 Node CLI 러너에 의존하므로 브라우저에서 동작하지 않습니다.

```js
import { describe, test, expect, fn, beforeEach, testManager } from '@dannysir/js-te/browser';

describe('math', () => {
  test('addition', () => {
    expect(1 + 2).toBe(3);
  });
});

await testManager.run();
```

**export 되는 것:** `test`(`test.each` 포함), `describe`, `beforeEach`, `expect`, `fn`, `testManager`.

**export 되지 않는 것:** 모듈 모킹(`mock`, `unmock`, `isMocked`, `clearAllMocks`, `mockStore`) 과 CLI 러너(`run`) — Node 전용이라 의도적으로 제외합니다.

> `testManager` 는 모듈 레벨 싱글톤입니다. 같은 페이지에서 테스트를 여러 번 collect 한다면 실행 사이에 `testManager.clearTests()` 를 호출하세요.

**Node 가드** — 이 entry 를 Node 런타임에서 import 하면 즉시 에러를 던지며, 메인 `@dannysir/js-te` entry(또는 `js-te` CLI) 로 안내합니다:

```
@dannysir/js-te/browser cannot be used in a Node.js runtime.
It is designed for browsers and Web Workers only.
```

**TypeScript** — 타입 선언이 패키지에 동봉되어(`types/browser.d.ts`) 별도 설정 없이 완전한 타입 지원을 받습니다.

---

## 테스트 파일 찾기 규칙

자동으로 다음 파일들을 찾아 실행합니다.

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

---

## 문서

- [상세 API 레퍼런스](./docs/reference/API.ko.md) — `test`, `expect`, `mock`, `fn`, `beforeEach`, `test.each` 전체 사용법
- [CLI 레퍼런스](./docs/reference/CLI.ko.md) — 커맨드라인 옵션·매칭 규칙·종료 코드
- [로더 훅 기반 인메모리 변환](./docs/internal/로더훅기반인메모리변환.md) — 0.5.0 내부 동작 원리
- [CHANGELOG](./CHANGELOG.ko.md) — 버전별 변경 내역

## 링크

- [GitHub](https://github.com/dannysir/js-te-package)
- [블로그 포스트](https://velog.io/@dannysir/series/npm-테스트-라이브러리-만들기)

## 만든 이유

Jest 를 사용하며 JavaScript 테스트 라이브러리의 내부 구조가 궁금하여 직접 구현하게 되었습니다.

## 라이선스

ISC
