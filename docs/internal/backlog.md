# Backlog

다음 작업 단위로 진행할 항목을 정리합니다.

## CLI 부분 실행 기능 (`feature-partial-run`)

### 핵심 기능
- [ ] CLI 인자 파서 도입 (현재 `bin/cli.js`는 `process.argv`를 전혀 안 읽음)
- [ ] 파일 경로 인자 처리 — `js-te path/to/foo.test.js` 형태
- [ ] 파일명 패턴 인자 처리 — `js-te user` → `*user*.test.js` 매칭
- [ ] `--testNamePattern` / `-t` 옵션 — 테스트 이름 정규식/부분 매칭
- [ ] `testManager` 측 필터 적용 로직 추가
- [ ] describe 중첩 시 풀네임 결합 규칙 결정 (예: `"결제 > 로그인"`)

### 부가
- [ ] `--help` 출력
- [ ] 잘못된 인자 / 매칭 결과 0건일 때 에러·경고 메시지
- [ ] 종료 코드 정책 (매칭 0건은 실패? 성공?)

### 검증·문서
- [ ] CLI 인자 파서 단위 테스트
- [ ] 필터 적용 통합 테스트
- [ ] `docs/reference/API.ko.md` / `API.md` CLI 섹션 추가
- [ ] `README` 사용법 보강
- [ ] `CHANGELOG.ko.md` 항목 추가

## 다음 브랜치 후보 (이번 범위에서 제외)

- [ ] 코드 레벨 `.only` / `.skip` / `.todo`
- [ ] JSON reporter
- [ ] VSCode 확장 (`vscode.tests` API 기반, 별도 저장소)
