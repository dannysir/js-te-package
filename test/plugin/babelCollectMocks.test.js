import {transformSync} from '@babel/core';
import {createMockCollectorPlugin} from '../../src/babelPlugins/babelCollectMocks.js';

const collect = (code, filename) => {
  const mockedPaths = new Set();
  transformSync(code, {
    filename,
    plugins: [createMockCollectorPlugin(mockedPaths)],
    parserOpts: {
      sourceType: 'module',
      plugins: ['dynamicImport'],
    },
  });
  return mockedPaths;
};

test('[babelCollectMocks] 상대 경로 mock() → 절대 경로로 수집', () => {
  const out = collect(`mock('./a.js', {});`, '/tmp/foo/caller.js');
  expect(out.has('/tmp/foo/a.js')).toBe(true);
});

test('[babelCollectMocks] 상위 디렉터리 상대 경로', () => {
  const out = collect(`mock('../up/c.js', {});`, '/tmp/foo/bar/caller.js');
  expect(out.has('/tmp/foo/up/c.js')).toBe(true);
});

test('[babelCollectMocks] 절대 경로는 그대로 수집', () => {
  const out = collect(`mock('/abs/b.js', {});`, '/tmp/foo/caller.js');
  expect(out.has('/abs/b.js')).toBe(true);
});

test('[babelCollectMocks] non-string-literal 인자는 무시', () => {
  const out = collect(`const p = './x.js'; mock(p, {});`, '/tmp/caller.js');
  expect(out.size).toBe(0);
});

test('[babelCollectMocks] 인자 없는 mock() 호출 무시', () => {
  const out = collect(`mock();`, '/tmp/caller.js');
  expect(out.size).toBe(0);
});

test('[babelCollectMocks] mock 외 함수 호출 무시', () => {
  const out = collect(`spy('./x.js', {});`, '/tmp/caller.js');
  expect(out.size).toBe(0);
});

test('[babelCollectMocks] 여러 mock() 호출 모두 수집', () => {
  const out = collect(
    `mock('./a.js', {}); mock('./b.js', {}); mock('/abs/c.js', {});`,
    '/tmp/caller.js',
  );
  expect(out.size).toBe(3);
  expect(out.has('/tmp/a.js')).toBe(true);
  expect(out.has('/tmp/b.js')).toBe(true);
  expect(out.has('/abs/c.js')).toBe(true);
});
