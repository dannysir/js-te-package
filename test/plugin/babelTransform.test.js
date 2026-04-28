import {transformSync} from '@babel/core';
import {babelTransform} from '../../src/babelPlugins/babelTransform.js';

const CALLER = '/Users/san/js-te-package/test/plugin/__caller__.js';

const transform = (code, mockedPaths = null, filename = CALLER) => transformSync(code, {
  filename,
  plugins: [babelTransform(mockedPaths)],
  parserOpts: {
    sourceType: 'unambiguous',
    plugins: ['dynamicImport'],
  },
}).code;

test('[babelTransform] ESM default import → wrapper 생성 + _original await import', () => {
  const out = transform(`import foo from './random.js';`);
  expect(out).toContain('await import("./random.js")');
  expect(out).toContain('const foo = (...args) =>');
  expect(out).toContain('globalThis.__jsTeMockStore__.has');
  expect(out).toContain('globalThis.__jsTeMockStore__.get');
});

test('[babelTransform] ESM named import → wrapper 생성', () => {
  const out = transform(`import {random} from './random.js';`);
  expect(out).toContain('const random = (...args) =>');
  expect(out).toContain('module.random(...args)');
});

test('[babelTransform] ESM namespace import → 객체 전개 wrapper', () => {
  const out = transform(`import * as utils from './random.js';`);
  expect(out).toContain('const utils = globalThis.__jsTeMockStore__.has');
});

test('[babelTransform] CJS require Identifier 패턴', () => {
  const out = transform(`const foo = require('./random.js');`);
  expect(out).toContain(`require("./random.js")`);
  expect(out).toContain('foo = (...args) =>');
  expect(out).toContain('module.default(...args)');
});

test('[babelTransform] CJS require ObjectPattern 패턴', () => {
  const out = transform(`const {random, add} = require('./random.js');`);
  expect(out).toContain('random = (...args) =>');
  expect(out).toContain('add = (...args) =>');
  expect(out).toContain('module.random(...args)');
  expect(out).toContain('module.add(...args)');
});

test('[babelTransform] mock() 호출 인자가 절대 경로로 치환됨', () => {
  const out = transform(`mock('./random.js', {});`, null, '/tmp/foo/caller.js');
  expect(out).toContain('mock("/tmp/foo/random.js"');
});

test('[babelTransform] mockedPaths Set — 포함 경로만 변환하고 나머지는 원본 유지', () => {
  const filename = '/tmp/foo/caller.js';
  const mockedPaths = new Set(['/tmp/foo/a.js']);
  const src = `import a from './a.js';\nimport b from './b.js';`;
  const out = transform(src, mockedPaths, filename);

  expect(out).toContain('const a = (...args) =>');
  expect(out).toContain(`import b from './b.js'`);
  expect(out).not.toContain('const b = (...args) =>');
});

test('[babelTransform] mockedPaths 빈 Set — 어떤 import도 변환하지 않음', () => {
  const src = `import foo from './random.js';`;
  const out = transform(src, new Set());
  expect(out).toContain(`import foo from './random.js'`);
  expect(out).not.toContain('const foo = (...args) =>');
});

test('[babelTransform] MOCK.STORE_PATH 임포트는 변환 대상에서 제외', () => {
  const src = `import {mockStore} from '@dannysir/js-te/src/mock/store.js';`;
  const out = transform(src);
  expect(out).toContain(`from '@dannysir/js-te/src/mock/store.js'`);
  expect(out).not.toContain('globalThis.__jsTeMockStore__.has("@dannysir');
});
