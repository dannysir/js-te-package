# NPM 패키지 생성 & 배포 방법

## 1. 패키지 초기화

### package.json 생성
```bash
npm init
```

### 주요 설정

```json
{
  "name": "js-te",
  "version": "0.0.1",
  "type": "module",
  "description": "JavaScript test library",
  "main": "index.js",
  "bin": {
    "js-te": "./bin/cli.js"
  },
  "scripts": {
    "test": "node bin/cli.js"
  },
  "keywords": ["JavaScript", "test"],
  "author": "dannysir",
  "license": "ISC"
}
```

#### 필드 설명
- **name**: 패키지 이름 (npm에서 고유해야 함)
- **version**: 시맨틱 버저닝 ( ex: `1.1.1` => `(major).(minor).(patch)` )
- **type**: "module"로 설정 시 ESM 사용
- **main**: 패키지의 진입점 파일
- **bin**: CLI 명령어 정의 (실행 가능한 스크립트)
- **keywords**: npm 검색 최적화용

## 2. 모듈 시스템 선택

### ESM (ES6 Modules)
```json
{
  "type": "module"
}
```
- `import/export` 구문 사용
- 최신 JavaScript 표준
- 비동기 로딩 지원
- `require/module.exports` 구문 사용
- Node.js 전통적인 방식
- 동기 로딩

## 3. CLI 도구 만들기

### bin 필드 설정
```json
{
  "bin": {
    "js-te": "./bin/cli.js"
  }
}
```

### 실행 파일 생성 (bin/cli.js)
```javascript
#!/usr/bin/env node

// CLI 로직
console.log('Hello from CLI!');
```

**중요**: Shebang(`#!/usr/bin/env node`)이 첫 줄에 있어야 함

## 4. 로컬 테스트

### 4 - 1 로컬 테스트 (npm link)

1. 개발한 npm 패키지에서 `npm link`.
2. 로컬에 테스트 할 프로젝트에서 `npm link 패키지명`.
3. npm 패키지에서 bin에 설정한 명령어 입력.

```
"bin": {
    "js-te": "./bin/cli.js" // 이럴 경우 'js-te'가 명령어.
},
```

### 4 - 2 로컬 테스트 완료 (npm unlink)

1. 테스트한 레포에서 `npm unlink 패키지명`
2. npm 패키지 레포에서 `npm unlink -g`

## 5. NPM 배포 준비

### .npmignore 파일 생성
배포에서 제외할 파일 지정:
```
node_modules/
.git/
.gitignore
test/
*.test.js
.env
```

### README.md 작성
사용자를 위한 문서:
- 설치 방법
- 사용 예제
- API 문서
- 기여 가이드

## 6. NPM 계정 및 로그인

### 계정 생성
https://www.npmjs.com/signup

### 로그인
```bash
npm login
```

이메일 인증 완료 필요

## 7. 배포

배포는 크게 2가지 방법의 경로를 사용할 수 있음

#### 1. 일반 Package
- 설치: `npm install js-te`
- 전 세계에서 유일해야 함
- 누가 먼저 선점하면 못 씀

```
// package.json
{
  "name": "js-te"
}
```

#### 2. Scoped Package

- 설치: `npm install @dannysir/js-te `
- 계정 아래에서만 유일하면 됨 
- 다른 사람도 `@dannysir/js-te` 사용 가능

```
//package.json
{
  "name": "@dannysir/js-te"
}
```

### 첫 배포
```bash
npm publish
```

### 범위 패키지 (Scoped Package)
```bash
npm publish --access public
```

패키지 이름: `@username/package-name`

## 8. 버전 업데이트 및 재배포

### 버전 업데이트
```bash
# 패치 버전 (0.0.1 -> 0.0.2)
npm version patch

# 마이너 버전 (0.0.1 -> 0.1.0)
npm version minor

# 메이저 버전 (0.0.1 -> 1.0.0)
npm version major
```

### 재배포
```bash
npm publish
```

## 9. Dual Package 지원 (CommonJS + ESM)

많은 사용자들이 여전히 CommonJS를 사용하므로, 양쪽을 모두 지원하는 것이 좋습니다.

### 방법 1: exports 필드 사용
```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./index.cjs"
    }
  }
}
```

### 방법 2: 빌드 도구 사용
- Rollup, Webpack, esbuild 등을 사용해 여러 버전 생성
- 하나의 소스에서 CommonJS와 ESM 버전 모두 빌드

## 10. 자주 사용하는 명령어

```bash
# 패키지 정보 확인
npm view js-te

# 특정 버전 배포 취소 (24시간 이내)
npm unpublish js-te@0.0.1

# 전체 패키지 삭제 (72시간 이내)
npm unpublish js-te --force

# 패키지 사용 중단 표시
npm deprecate js-te@0.0.1 "Use version 0.0.2 instead"
```

## 11. GitHub Actions Trusted Publishing (현재 배포 방식)

0.9.4부터 배포는 로컬 `npm publish` 대신 GitHub Actions 에서 수행한다 (`.github/workflows/publish.yml`). 토큰 없이 OIDC 로 인증하며, provenance 증명이 자동 생성되어 npm 패키지 페이지에 인증 배지가 표시된다.

### 사전 조건 (1회 설정)

- npmjs.com → 패키지 → Settings → **Trusted Publisher** 등록
  - Publisher: GitHub Actions
  - Organization or user: `dannysir` / Repository: `js-te-package`
  - Workflow filename: `publish.yml`
  - Environment: 비워둠 (지정하면 워크플로우 job 에도 `environment:` 필요)
  - Allowed actions: **`npm publish` 체크** (`npm stage publish` 는 항상 허용됨)
    - npm 은 "체크 해제(stage-only)" 를 권장한다는 경고를 띄움. stage-only 로 바꾸려면 워크플로우의 `npm publish` 를 `npm stage publish` 로 바꾸고, 배포마다 npmjs.com 또는 CLI 에서 **2FA 로 승인**해야 공개됨.
    - 유지보수 모드라 배포가 드물어 현재는 직접 배포(`npm publish`) 유지. 대신 아래 "워크플로우 구조" 로 위험을 줄임.
- **새로 만든 Trusted Publisher 는 2일 안에 첫 배포가 성공해야 유효해진다.** 그 안에 배포하지 않으면 `Expired` 상태가 되어 수정도 불가 → **삭제 후 새로 생성**하고 바로 배포할 것. (1.0.0 배포 때 이 만료로 `E404` 가 났음)
- 권장: Settings → **Publishing access** 를 "Require two-factor authentication and disallow tokens" 로 설정. 유출된 토큰으로는 배포할 수 없고, Trusted Publishing 은 영향 없음.

### 워크플로우 구조

배포 토큰(`id-token: write`)을 받는 job 에서는 외부 코드(의존성)를 실행하지 않는다.

| job | 권한 | 하는 일 |
|---|---|---|
| `build` | `contents: read` | `npm ci --ignore-scripts` → `npm run build` → `npm test` → `npm pack` → tarball 을 artifact 로 업로드 |
| `publish` | `id-token: write` | npm 설치 → artifact 다운로드 → `npm publish <tarball>` (의존성 설치·빌드 없음) |

- `--ignore-scripts`: 의존성의 install 스크립트 실행 차단. install 스크립트가 있는 의존성은 macOS 전용 `fsevents` 뿐이라 Ubuntu 빌드 결과에 영향 없음 (1.0.0 배포본과 shasum 동일 확인).
- npm 버전은 `publish` job 에서 **고정** (`npm@12.2.0`). 올릴 때는 아래 dry-run 으로 먼저 확인하고 바꿀 것. Trusted Publishing 은 npm 11.5.1+ 필요.
- 릴리스 빌드에서는 setup-node 캐시를 끔 (`package-manager-cache: false`, 캐시 오염 방지).

### 배포 절차

```bash
npm version patch   # 또는 minor/major — bump + vX.Y.Z 태그 생성
git push && git push --tags
```

이후 GitHub 에서 해당 태그로 **Release 발행** → 워크플로우가 build → publish 실행.

PR 로 버전을 올린 경우(1.0.0 방식): PR 안에서 `npm version <type> --no-git-tag-version` 으로 bump 커밋 → 머지 → Release 화면에서 태그 `vX.Y.Z` 를 **새로 입력하고 target 을 `main`** 으로 발행. 태그가 머지된 main 커밋을 가리키게 됨.

### dry-run (배포 없이 흐름 검증)

Actions → **Publish to npm** → *Run workflow* (`workflow_dispatch`).

- build → artifact → `npm publish --dry-run` 까지 실행하고 업로드는 하지 않음.
- npm 은 dry-run 에서도 이미 배포된 버전이면 실패하므로, 수동 실행 때는 임시 버전 `0.0.0-dryrun.<run_id>` 로 패키징하고 `--tag dry-run` 을 붙임.
- OIDC 인증·provenance 는 실제 업로드 때만 일어나므로 dry-run 으로는 검증되지 않음.

### 주의사항

- 트리거는 `release: published` — **태그 push 만으로는 배포되지 않음.** Release 를 발행해야 함.
- 실패한 배포를 *Re-run* 하면 **태그 시점의 워크플로우 파일**로 다시 실행됨. 워크플로우를 고친 내용은 재실행에 반영되지 않음 (새 태그/릴리스 필요). 재실행은 실행 후 30일 안에만 가능.
- `prepublishOnly` 스크립트는 제거됨 (CI 와 빌드 중복 방지). 로컬에서 수동 `npm publish` 가 필요하면 `npm run build` 를 먼저 실행할 것.
- 배포 후 Actions 로그와 npm 패키지 페이지의 provenance 배지로 성공 확인.

### 트러블슈팅

- `npm publish` 단계에서 **`E404 Not Found - PUT .../@dannysir%2fjs-te`** → 패키지가 없는 게 아니라 **OIDC 인증 실패**. npm 은 권한 없는 요청에 404 를 돌려줌.
  1. npmjs.com 의 Trusted Publisher 상태 확인 (`Expired` 면 삭제 후 재생성, 값이 위 사전 조건과 같은지 확인)
  2. Allowed actions 에 `npm publish` 가 체크돼 있는지 확인
  3. 고친 뒤 실패한 실행에서 *Re-run failed jobs*
