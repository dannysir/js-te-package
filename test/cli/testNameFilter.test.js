import {silentReporter} from '../../src/cli/reporters/silentReporter.js';

// 주: testManager는 싱글톤이고, 외부 러너가 이미 본 파일의 top-level 테스트를
// 스냅샷해 순차 실행 중이다. 각 테스트는 고유 marker prefix로 fixture를 스테이징하고
// 해당 marker를 포함한 패턴으로 run()을 호출해 이름 필터 동작만 검증한다.
// run()은 실행 후 `#tests` 를 clear하므로 테스트 간 상태 격리가 보장된다.
// 단, marker는 외부 러너가 인식하는 본 파일의 top-level 테스트 description
// ("[testNameFilter] ...") 과 부분 문자열로 겹치지 않아야 한다.

test('[testNameFilter] 단순 description 부분 문자열 매칭', async () => {
  test('__TNF_A__ hit alpha', () => {});
  test('__TNF_A__ hit beta', () => {});
  test('__TNF_MISS__ noise', () => {});

  const result = await run(silentReporter, '__TNF_A__');
  expect(result.passed).toBe(2);
  expect(result.failed).toBe(0);
});

test('[testNameFilter] describe 경로에 포함된 패턴 매칭', async () => {
  describe('__TNF_B_auth__', () => {
    test('token', () => {});
    test('session', () => {});
  });
  describe('__TNF_B_user__', () => {
    test('profile', () => {});
  });

  const result = await run(silentReporter, '__TNF_B_auth__');
  expect(result.passed).toBe(2);
  expect(result.failed).toBe(0);
});

test('[testNameFilter] 풀네임 구분자(" > ") 포함 패턴 매칭', async () => {
  describe('__TNF_C_api__', () => {
    describe('user', () => {
      test('create', () => {});
      test('delete', () => {});
    });
  });

  const result = await run(silentReporter, '__TNF_C_api__ > user > create');
  expect(result.passed).toBe(1);
  expect(result.failed).toBe(0);
});

test('[testNameFilter] 0건 매칭 → passed/failed 모두 0', async () => {
  test('__TNF_D__ only this', () => {});

  const result = await run(silentReporter, '__TNF_D_absent__');
  expect(result.passed).toBe(0);
  expect(result.failed).toBe(0);
});

test('[testNameFilter] 대소문자 구분', async () => {
  test('__TNF_E__ login', () => {});

  const result = await run(silentReporter, '__TNF_E__ LOGIN');
  expect(result.passed).toBe(0);
  expect(result.failed).toBe(0);
});

test('[testNameFilter] pattern undefined → 스테이징된 테스트 전부 실행', async () => {
  // 본 테스트는 마지막 순서이며, 직전 테스트의 run()이 #tests를 clear한 상태에서 시작한다.
  // 따라서 pattern undefined로 호출해도 여기서 스테이징한 fixture만 실행된다.
  test('__TNF_F__ a', () => {});
  test('__TNF_F__ b', () => {});

  const result = await run(silentReporter, undefined);
  expect(result.passed).toBe(2);
  expect(result.failed).toBe(0);
});
