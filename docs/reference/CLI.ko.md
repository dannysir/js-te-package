# CLI 레퍼런스

> English: [CLI.md](./CLI.md)

`js-te` 커맨드라인 인터페이스의 옵션·positional 인자·매칭 규칙·종료 코드·예제를 정리한 문서입니다.

- [개요](#개요)
- [사용법](#사용법)
- [옵션](#옵션)
- [Positional 인자](#positional-인자)
- [매칭 규칙](#매칭-규칙)
  - [파일 패턴](#파일-패턴)
  - [이름 패턴](#이름-패턴)
  - [필터 조합](#필터-조합)
- [리포터](#리포터)
- [종료 코드](#종료-코드)
- [예제](#예제)
- [0건 매칭 동작](#0건-매칭-동작)
- [함께 보기](#함께-보기)

---

## 개요

인자 없이 `js-te` 를 실행하면 프로젝트 안의 모든 테스트 파일을 자동으로 찾아 실행합니다 (자세한 규칙은 [README의 테스트 파일 찾기](../../README.ko.md#테스트-파일-찾기-규칙) 참고). 로컬 개발 중 빠른 피드백이나 에디터/IDE 통합을 위해, 실행 범위를 좁히는 필터 두 종류를 제공합니다.

필터는 세 종류입니다.

- **파일 필터** — positional 인자로 지정 (파일 경로에 대한 부분 문자열 매칭)
- **이름 필터** — `-t / --testNamePattern` 으로 지정 (풀네임에 대한 부분 문자열 매칭)
- **위치 필터** — `--testLocation` 으로 지정 (단일 테스트의 `<경로>:<라인>` 정확 매칭). 에디터의 "이 테스트 실행" 거터 동작용

모든 필터는 선택 사항이며, 여러 개를 동시에 지정하면 AND 로 결합됩니다.

## 사용법

```
js-te [options] [file patterns...]
```

## 옵션

| 옵션                            | Alias | 타입   | 설명                                                                        |
| ------------------------------- | ----- | ------ | --------------------------------------------------------------------------- |
| `--testNamePattern <pattern>`   | `-t`  | string | 풀네임에 `<pattern>` 이 포함된 테스트만 실행합니다.                         |
| `--testLocation <path:line>`    |       | string | `<path>` 의 `<line>` 줄에 있는 `test(...)` 테스트 하나만 실행합니다.        |
| `--reporter <name>`             |       | string | 출력 형식. `default` (사람이 읽는 형식, 기본값) 또는 `json`.                |
| `--help`                        | `-h`  | flag   | 사용법·옵션·예제·종료 코드를 출력하고 0으로 종료합니다.                     |

알 수 없는 옵션이 주어지면 `js-te` 는 `Invalid CLI arguments: ...` 메시지와 함께 exit 1 로 종료합니다.

## Positional 인자

옵션이 아닌 모든 인자는 **파일 패턴** 으로 해석됩니다. 여러 개 전달할 수 있습니다.

```bash
js-te user                 # 패턴 1개
js-te user payment         # 패턴 2개 (OR)
js-te src/auth.test.js     # 전체 경로도 가능 (그 자체가 부분 문자열이므로 동작)
```

## 매칭 규칙

### 파일 패턴

- 절대 경로 전체에 대한 **대소문자 구분 부분 문자열 매칭**
- 여러 패턴은 **OR 결합** — 하나라도 경로에 포함되면 매칭
- "정확한 경로 매칭" 전용 모드는 없습니다. 전체 경로도 결국 부분 문자열이므로 동일 규칙으로 처리됩니다.
- positional 인자가 하나도 없으면 발견된 모든 테스트 파일을 대상에 포함합니다.

### 이름 패턴

- 테스트의 **풀네임** 에 대한 **대소문자 구분 부분 문자열 매칭**
- 풀네임은 `"<describe 경로> > <테스트 설명>"` 형태로, 중첩된 `describe` 블록을 `" > "` 로 이어 붙여 구성합니다. 감싸는 `describe` 가 없으면 테스트 설명만 풀네임이 됩니다.
- 이번 릴리즈에서는 정규식 매칭을 지원하지 않습니다.

풀네임 예시:

```
계산기 > 더하기 > 양수 더하기
로그인 플로우 > 성공 시 토큰 반환
describe 없이 작성한 단독 테스트
```

`-t "토큰"` 을 지정하면 위 세 개 중 두 번째 테스트만 실행됩니다.

### 위치

- `--testLocation <경로>:<라인>` 은 `<경로>` 의 `<라인>` 줄에 있는 `test(...)` 호출 하나만 실행합니다.
- `<경로>` 는 상대 경로(현재 작업 디렉터리 기준으로 절대화) 또는 절대 경로 모두 가능하며, `<라인>` 은 양의 정수여야 합니다. 형식이 잘못되면 `Invalid CLI arguments: ...` 와 함께 exit 1 로 종료합니다.
- 라인은 `test(...)` 가 **호출된** 줄과 정확히 일치해야 합니다. 테스트 본문 안의 다른 줄을 가리키면 0건이 매칭됩니다.
- `<경로>` 파일만 import·실행하며, 나머지 발견된 파일은 건너뜁니다.
- `test.each(...)` 케이스들은 모두 `test.each` 호출 줄을 공유하므로, 위치 필터로 생성된 개별 케이스 하나만 골라낼 수는 없습니다.

이 필터는 이름 패턴으로 구분할 수 없는 **동명 테스트**가 여러 개일 때도 그중 **하나**만 확실히 실행하는 방법입니다.

### 필터 조합

파일 필터와 이름 필터는 독립적으로 동작합니다. 두 필터가 모두 지정된 경우, 테스트는 **파일** 이 파일 필터를 통과하고 **풀네임** 이 이름 필터도 통과할 때만 실행됩니다.

```bash
js-te auth -t "토큰"
# → 파일 경로에 "auth" 가 포함되고
#   풀네임에 "토큰" 이 포함된 테스트만 실행
```

## 리포터

`--reporter <name>` 으로 결과 출력 방식을 고릅니다. 기본 제공되는 리포터는 두 가지입니다.

- `default` — 색상이 적용된, 사람이 읽기 좋은 stdout 출력. 미지정 시 기본값이며 기존 CLI 동작과 동일합니다.
- `json` — 실행이 끝난 뒤 stdout 으로 JSON 객체 하나를 출력합니다. IDE 확장이나 CI 스크립트가 결과를 프로그램적으로 파싱해 활용할 때 사용합니다. 알 수 없는 리포터 이름을 주면 `Invalid CLI arguments: ...` 와 함께 exit 1 로 종료합니다.

### JSON 스키마

`json` 리포터는 실행이 끝난 직후 stdout 으로 JSON 객체를 **딱 한 줄, 한 번** 출력합니다.

```json
{
  "totals": {"passed": 10, "failed": 1, "skipped": 2, "todo": 1},
  "files": [
    {
      "path": "/abs/path/foo.test.js",
      "passed": 3,
      "failed": 1,
      "skipped": 1,
      "todo": 1,
      "tests": [
        {
          "path": "group > sub",
          "description": "ok case",
          "status": "passed",
          "location": {"file": "/abs/path/foo.test.js", "line": 42}
        },
        {
          "path": "",
          "description": "bad case",
          "status": "failed",
          "location": {"file": "/abs/path/foo.test.js", "line": 50},
          "error": {"message": "expected 1 to equal 2"}
        },
        {
          "path": "",
          "description": "explicit skip",
          "status": "skipped",
          "location": {"file": "/abs/path/foo.test.js", "line": 58}
        },
        {
          "path": "",
          "description": "write later",
          "status": "todo",
          "location": {"file": "/abs/path/foo.test.js", "line": 64}
        }
      ]
    }
  ]
}
```

필드 메모:

- `files[].path` 는 테스트 파일의 절대 경로입니다.
- `tests[].path` 는 감싸는 `describe` 체인을 `" > "` 로 이어 붙인 문자열이며, 최상위 테스트면 `""` 입니다. `tests[].description` 은 `test(...)` 에 직접 넘긴 설명입니다. 두 필드를 합치면 풀네임이 됩니다.
- `tests[].status` 는 `"passed"`, `"failed"`, `"skipped"`, `"todo"` 중 하나입니다. `"skipped"` 는 `test.skip` / `describe.skip` 뿐 아니라 같은 파일의 `.only` 때문에 강등된 테스트도 포함합니다. `"todo"` 는 `test.todo(desc)` 로 등록한 항목입니다.
- `tests[].location` 은 `test(...)` 가 호출된 파일과 라인입니다. 스택 파싱이 실패해 호출 위치를 잡지 못한 경우엔 필드 자체가 생략됩니다.
- `tests[].error` 는 실패한 테스트에만 포함되며, 현재 `message` 만 노출합니다. 스택 트레이스는 의도적으로 포함하지 않습니다.

특수 케이스:

- 필터에 매칭된 테스트가 없으면 payload 는 `{"totals": {"passed": 0, "failed": 0, "skipped": 0, "todo": 0}, "files": [], "noTestsFound": true}` 이며 exit 1 로 종료합니다.
- 테스트 실행 자체가 실패하면 (예: 셋업 단계 에러) payload 는 `{"totals": {"passed": 0, "failed": 0, "skipped": 0, "todo": 0}, "files": [], "error": {"message": "..."}}` 이며 exit 1 로 종료합니다.

## 종료 코드

| 코드 | 의미                                                             |
| ---- | ---------------------------------------------------------------- |
| `0`  | 실행된 모든 테스트 통과                                          |
| `1`  | 하나 이상의 테스트 실패, **또는** 필터 매칭 결과가 0건인 경우    |

0건 매칭 시 `exit 1` 로 처리하는 것은 Vitest 기본 동작과 동일하며 의도된 설계입니다. CI 에서 필터 오타로 "조용한 성공" 이 발생해 리그레션을 놓치는 상황을 막기 위함입니다.

## 예제

```bash
# 전체 실행 (0.6.x 와 동일 동작)
js-te

# 파일 필터 — 경로 부분 문자열 매칭
js-te user                  # 경로에 "user" 포함
js-te user payment          # 경로에 "user" 또는 "payment" 포함
js-te src/auth.test.js      # 특정 파일

# 이름 필터
js-te -t "로그인"           # 풀네임에 "로그인" 포함
js-te --testNamePattern "로그인 플로우 > 성공"

# 조합
js-te auth -t "토큰"        # 파일 경로에 "auth" 포함 AND 풀네임에 "토큰" 포함

# 위치 필터 — 파일과 라인으로 단일 테스트 지정
js-te --testLocation test/user.test.js:42

# JSON 리포터 — stdout 으로 머신 파싱 가능한 결과 출력
js-te --reporter json

# 도움말
js-te --help
```

## 0건 매칭 동작

필터 조합 결과 실행 대상이 0건이면 `js-te` 는 경고를 출력하고 exit 1 로 종료합니다.

```
⚠ No tests found matching file pattern(s) [nonexistent] and name pattern "토큰"
```

활성화된 필터에 따라 뒤쪽 문구가 달라집니다.

- 파일 필터만  → `...matching file pattern(s) [<패턴들>]`
- 이름 필터만  → `...matching name pattern "<패턴>"`
- 둘 다       → `...matching file pattern(s) [<패턴들>] and name pattern "<패턴>"`

0건을 성공으로 간주하려면 필터를 제거하거나 완화해야 합니다. `--passWithNoTests` 플래그는 이번 릴리즈에 포함되지 않았습니다.

## 함께 보기

- [API 레퍼런스](./API.ko.md) — `test`, `expect`, `mock` 등 공개 API 전체
- [CHANGELOG](../../CHANGELOG.ko.md) — 버전별 변경 내역
