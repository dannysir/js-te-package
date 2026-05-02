import {mockStore} from '@dannysir/js-te/src/mock/store.js';
import {greet, farewell} from '../../test-helper/mockstore-collision/target.js';
import {remember, recall, forget} from '../../test-helper/mockstore-collision/userspace.js';

const TARGET_PATH = '/Users/san/js-te-package/test-helper/mockstore-collision/target.js';
const USERSPACE_PATH = '/Users/san/js-te-package/test-helper/mockstore-collision/userspace.js';

test('[regression-mockstore] 서브패스 mockStore import + mock() 동시 사용 — 동일 globalThis 싱글톤 공유', () => {
  expect(mockStore instanceof Map).toBe(true);
  expect(mockStore.has(TARGET_PATH)).toBe(false);

  mock('../../test-helper/mockstore-collision/target.js', {
    greet: () => 'mocked-hi',
  });

  expect(mockStore.has(TARGET_PATH)).toBe(true);
  expect(greet()).toBe('mocked-hi');
  expect(farewell()).toBe('bye');

  unmock(TARGET_PATH);
  expect(mockStore.has(TARGET_PATH)).toBe(false);
});

test('[regression-mockstore] 사용자 모듈 내부 지역 mockStore 식별자가 wrapper 와 분리되어 동작', () => {
  remember('foo', 'bar');
  expect(recall('foo')).toBe('bar');

  mock('../../test-helper/mockstore-collision/userspace.js', {
    recall: (key) => `mocked:${key}`,
  });
  expect(recall('foo')).toBe('mocked:foo');

  unmock(USERSPACE_PATH);

  expect(recall('foo')).toBe('bar');
  forget('foo');
  expect(recall('foo')).toBe(undefined);
});
