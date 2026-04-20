import {shouldTransform} from '../../src/cli/loaderHook.js';

test('[shouldTransform] mockedPaths가 비어있으면 false', () => {
  expect(shouldTransform('file:///tmp/foo.js', new Set())).toBe(false);
});

test('[shouldTransform] file:// 스킴이 아니면 false', () => {
  const paths = new Set(['/tmp/y.js']);
  expect(shouldTransform('https://example.com/y.js', paths)).toBe(false);
  expect(shouldTransform('node:fs', paths)).toBe(false);
  expect(shouldTransform('data:text/javascript,', paths)).toBe(false);
});

test('[shouldTransform] file:// + .js → true', () => {
  expect(shouldTransform('file:///tmp/a.js', new Set(['x']))).toBe(true);
});

test('[shouldTransform] file:// + .mjs → true', () => {
  expect(shouldTransform('file:///tmp/a.mjs', new Set(['x']))).toBe(true);
});

test('[shouldTransform] .json / .cjs / .ts → false', () => {
  const paths = new Set(['x']);
  expect(shouldTransform('file:///tmp/a.json', paths)).toBe(false);
  expect(shouldTransform('file:///tmp/a.cjs', paths)).toBe(false);
  expect(shouldTransform('file:///tmp/a.ts', paths)).toBe(false);
});

test('[shouldTransform] 경로에 /node_modules/ 포함 → false', () => {
  const paths = new Set(['x']);
  expect(shouldTransform('file:///proj/node_modules/lib/a.js', paths)).toBe(false);
  expect(shouldTransform('file:///node_modules/a.js', paths)).toBe(false);
});
