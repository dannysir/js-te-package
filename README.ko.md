# js-te

[English](./README.md)

Jest에서 영감을 받아 만든 가벼운 JavaScript 테스트 프레임워크입니다.

## [📎 최근 업데이트 — 0.7.0](./CHANGELOG.ko.md)

### CLI 부분 실행

- Positional 파일 패턴 — `js-te user` 로 경로에 `"user"` 가 포함된 테스트 파일만 실행 (여러 개면 OR)
- `-t, --testNamePattern <pattern>` — 풀네임(`describe > ... > test 설명`) 기준 필터
- `-h, --help` — 사용법·옵션·예제·종료 코드 출력
- 매칭 0건일 때 exit 1 (Vitest 기본 동작과 동일, CI 에서의 조용한 성공 방지)

자세한 내용은 [CLI 레퍼런스](./docs/reference/CLI.ko.md) 를 참고하세요.

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
js-te --help          # 도움말
```

옵션·매칭 규칙·종료 코드 상세는 [CLI 레퍼런스](./docs/reference/CLI.ko.md) 를 참고하세요.

### `--help` 출력

<p align='center'>
  <!-- TODO: 스크린샷 캡처 후 src 에 URL 을 채워 넣기 -->
  <img width="585" alt="js-te --help 출력" src="" />
</p>

---

## 핵심 기능

- **테스트 작성** — `test()`, `describe()`, `beforeEach()`, `test.each()`
- **Matcher** — `toBe`, `toEqual`, `toThrow`, `toBeTruthy`, `toBeFalsy`, `toContain`, `toBeInstanceOf`, `toBeNull`, `toBeUndefined`, `toBeDefined`, `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`, `.not` 체이닝
- **Mock Function** — `fn()`, `mockImplementation`, `mockReturnValue`, `mockReturnValueOnce`, `mockClear`, `mock.calls`
- **Module Mocking** — `mock(path, mockObj)` (상대/절대 경로 모두 지원), `clearAllMocks`, `unmock`, `isMocked`
- **모듈 시스템** — ESM(`import`) · CommonJS(`require`) 동시 지원
- **CLI** — `js-te` 명령 한 줄

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
