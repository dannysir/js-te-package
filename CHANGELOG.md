# CHANGE LOG

## [0.3.2] 2025-12-10

### 리펙토링
- cli.js
  - `main()`에서 관리하던 전체 흐름을 `setupEnvironment.js`, `setupFiles.js`, `runTests.js`로 분리
  - `main()`에서는 흐름만 관리하도록 수정
- babel 플러그인
  - 플러그인 내부에 중복된 Wrapper 패턴 생성 로직 분리
  - 플러그인 내부에서는 AST를 이용한 로직 생성만 집중하도록 만듬
- JSDoc 추가
  - babel과 관련된 로직 및 사용자가 사용하는 로직에 JSDoc 추가
  - JSDoc을 통해 매개변수와 리턴 타입에 대해 명시하고 함수의 역할 및 사용 예시를 추가
- 그 외 리펙토링 사항
  - 코드 스타일 통일
    - 일부 function 코드를 arrow function 코드로 수정
  - 미흡한 상수화 보완

### 문서 오류 수정

- README.md 내 오타 수정
  - 부분 모킹 import문 오타 수정
  - 상단 최근 업데이트 내역 갱신

## [0.3.1] 2025-12-08

### 오류 수정 

- `package.json` 내에 파일 누락된 파일 목록 추가
  - `babelCollectMocks.js` 플러그인 누락으로 인한 오류 수정

## [0.3.0] 2025-12-08

### 추가

- `mock` 이후 import를 해야하는 문제 해결
  - 문제 : 기존의 경우 모킹 기능 이용시 반드시 동적 import문을 mock 다음에 작성해야 했음
  - 해결
    - 기존 `mockStore`를 직접 비교하여 import하는 방식에서 wrapper 패턴을 이용하도록 적용
    - 모듈을 새로운 함수로 만들어 함수를 실행할 때마다 `mockStore`와 비교하여 값을 리턴하도록 수정
- 모듈 변환 최적화
  - 문제 : 앞선 변경으로 인해 모든 파일의 모듈들이 사용될 때마다 `mockStore`와 비교하는 로직이 실행됨
  - 해결 
    - `cli`로직에 mock을 미리 검사하여 mock 경로를 미리 저장하는 로직을 추가
    - 미리 확인한 mock 경로를 이용해 import문이 만약 저장된 경로일 때만 babel 변환

## [0.2.3] 2025-12-04

### 문서 수정
- README.md 내에 type 설정 관련 설명 수정
    - 0.2.1 버전부터 ESM 방식과 Common JS 방식 모두 허용
    - 개발 블로그 링크 추가

### 설정 수정
- package.json
    - 레포지토리 및 이슈 링크 추가

### `rollup.config.js` output 파일명 수정
- 기존 `.cjs.js`와 같은 이름에서 `.cjs`로 수정
- `esm.js`에서 `.mjs`로 수정

## [0.2.2] 2025-12-04

### 문서 수정
- README 오타 수정
    - 부분 모킹 적용 버전을 0.1.3(오타) -> 0.2.1

## [0.2.1] 2025-12-02

### 오류 수정
- cli 에러
    - 문제1 : index.js는 export하지 않고 빌드를하여 제공하기 때문에 index 파일을 찾지 못하는 오류 수정
    - 문제2 : rollup에서 빌드를 하는 과정에 testManager가 각각 2개가 생기기 때문에 사용자 시스템에 따라 내부적으로 ejs 방식으로 동작하기 때문에 cjs 메서드가 정상 동작하지 않음
    - 해결 방법 : cli 파일에 사용자 시스템에 맞는 index를 호출하는 기능 추가

## [0.2.0] 2025-12-02

### 추가

- CommonJS 지원
    - require() 구문을 사용하는 프로젝트에서도 사용 가능
    - ESM(import)과 CommonJS(require) 모두 지원
    - Rollup을 통한 dual package 배포 (ESM + CJS)
- 부분 모킹(Partial Mocking) 지원
    - 모듈의 일부 함수만 모킹하고 나머지는 원본 유지 가능
    - 스프레드 연산자를 활용한 모킹 방식 개선
    - ESM과 CommonJS 모두에서 부분 모킹 동작

## [0.1.2] 2025-11-27

### 추가
- 레포지토리 변경으로 인해 깃허브 경로 수정
- cli.js
    - transformFiles : babel을 통한 코드 변경 로직 분리
    - findFiles : 사용자의 테스트 파일과 파일을 찾는 로직 분리
- index.js
    - run 함수의 경우 사용자가 사용할 필요가 없기 때문에 index.js에서 분리
    - expect로직과 matcher 로직을 분리
- tests.js 파일명 수정
    - 클래스를 직접 export하는 방식에서 선언된 변수를 export하는 방식으로 변경

## [0.1.1] 2025-11-24

### 추가
- 문법 오류 발생시 babel로 변환한 파일이 다시 restore 되지않는 문제 해결
    - `babel 변환 -> 원상 복구` 로직이 문법 오류 발생시 진행되지 않는 오류 해결

## [0.1.0]  2025-11-20

### 추가
- test.each() 기능 추가
    - 배열 형태의 테스트 케이스를 반복 실행
    - 플레이스홀더 지원 (%s, %o)
    - 동일한 테스트 로직을 여러 데이터셋으로 검증 가능


- beforeEach()
    - 각 테스트 실행 전 초기화 코드 실행
    - 중첩된 describe 블록에서 상위 beforeEach 자동 실행
    - 테스트 간 독립성 보장


- Babel 절대 경로 변환
    - 사용자 입력 경로(상대/절대)를 절대 경로로 통일
    - 일관된 모킹 동작 보장

### 변경사항
- 내부 테스트 관리 구조 개선

## [0.0.2] 2025-11-17

### 추가
- scoped 패키지로 변경하여 발생한 버그 수정
    - babelTransformImport 파일 내에 `js-te` 경로를 `@dannysir/js-te` 경로로 변경

## [0.0.1] 2025-11-17

### 추가
- 최초 배포
- 테스트 작성 기능 (`test`, `describe`, `expect`)
- Matcher 함수들
    - `toBe()` - 값 비교
    - `toEqual()` - 객체/배열 비교
    - `toThrow()` - 에러 검증
    - `toBeTruthy()` / `toBeFalsy()` - 참/거짓 확인
- 모킹 시스템
    - `mock()` - 모듈 모킹
    - `clearAllMocks()` - 전체 mock 제거
    - `unmock()` - 특정 mock 제거
    - `isMocked()` - mock 상태 확인
- Babel 플러그인 dynamic import를 이용한 import 변환으로 모킹 구현
- 자동 테스트 파일 찾기 (`.test.js` 파일, `test/` 폴더)
- CLI 도구 (`js-te` 명령어)
- 중첩 describe 블록 지원
- 컬러 콘솔 출력

---

## 앞으로 추가할 기능

- mocking 기능 개선
    - 문제점 : mocking한 모듈을 반드시 `mock` 함수 이후에 import 해야함
    - 원인 : import를 상단에서 진행할 경우 mocking전 원본 모듈을 가져오게 됨
- ESM / Common JS
    - 문제점 : 현재 라이브러리가 ESM 방식이기 때문에 사용자도 ESM 방식으로 사용해야함
    - 개선 방법 : rollup과 같은 번들러를 사용해 ESM 방식의 파일과 Common JS 방식의 파일 2 종류를 생성하여 배포
