import {TestManager} from '../../src/testManager.js';
import {mock, isMocked} from '../../src/mock/store.js';

const VIRTUAL_PATH = '/virtual/mock-cleanup/dep.js';

test('[regression-mock-cleanup] 실패한 테스트에서 등록한 mock 도 다음 테스트 전에 정리된다', async () => {
  const tm = new TestManager();
  let mockedInNextTest;

  tm.test('mock 등록 후 실패', () => {
    mock(VIRTUAL_PATH, {value: () => 'mocked'});
    throw new Error('boom');
  });
  tm.test('다음 테스트', () => {
    mockedInNextTest = isMocked(VIRTUAL_PATH);
  });

  const result = await tm.run();

  expect(result.failed).toBe(1);
  expect(result.passed).toBe(1);
  expect(mockedInNextTest).toBe(false);
});

test('[regression-mock-cleanup] 마지막 테스트가 실패해도 run 종료 후 mock 이 남지 않는다', async () => {
  const tm = new TestManager();

  tm.test('mock 등록 후 실패', () => {
    mock(VIRTUAL_PATH, {value: () => 'mocked'});
    throw new Error('boom');
  });

  await tm.run();

  expect(isMocked(VIRTUAL_PATH)).toBe(false);
});
