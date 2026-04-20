import {random, add} from '../../test-helper/random.js';

const RANDOM_ABS_PATH = '/Users/san/js-te-package/test-helper/random.js';

test('[edge-mock] 같은 경로 mock() 재호출 → 두 번째 팩토리가 우선', () => {
  mock(RANDOM_ABS_PATH, {
    random: () => 1,
  });
  mock(RANDOM_ABS_PATH, {
    random: () => 999,
  });
  expect(random()).toBe(999);
});

test('[edge-mock] mockReturnValueOnce 큐 소진 → 기본 팩토리 복귀', () => {
  const mocked = mock(RANDOM_ABS_PATH, {
    random: () => 42,
  });
  mocked.random.mockReturnValueOnce(1, 2);
  expect(random()).toBe(1);
  expect(random()).toBe(2);
  expect(random()).toBe(42);
  expect(random()).toBe(42);
});

test('[edge-mock] partial mocking — 모킹되지 않은 export는 원본 유지', () => {
  mock(RANDOM_ABS_PATH, {
    add: (a, b) => a * b,
  });
  expect(add(2, 3)).toBe(6);

  const r = random();
  expect(typeof r).toBe('number');
  expect(r >= 0 && r < 1).toBe(true);
});

test('[edge-mock] mockImplementation 교체 후 호출', () => {
  const mocked = mock(RANDOM_ABS_PATH, {
    random: () => 1,
  });
  mocked.random.mockImplementation(() => 500);
  expect(random()).toBe(500);
});
