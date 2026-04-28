import {transformSource} from '../../src/cli/utils/transformSource.js';

test('[transformSource] mockedPaths 비어있으면 입력 그대로 반환 (바이패스)', () => {
  const code = `import foo from './random.js';`;
  const out = transformSource(code, '/tmp/bypass.js', new Set());
  expect(out).toBe(code);
});

test('[transformSource] 같은 (code, filename)로 두 번째 호출 시 동일 결과 반환', () => {
  const code = `const x = 1;`;
  const filename = '/tmp/cache-hit.js';
  const paths = new Set(['/tmp/dummy.js']);
  const out1 = transformSource(code, filename, paths);
  const out2 = transformSource(code, filename, paths);
  expect(out1).toBe(out2);
});

test('[transformSource] 같은 filename이라도 code가 다르면 결과 달라짐 (캐시 무효화, C6)', () => {
  const filename = '/tmp/cache-miss.js';
  const paths = new Set(['/tmp/dummy.js']);
  const out1 = transformSource(`const x = 1;`, filename, paths);
  const out2 = transformSource(`const y = 2;`, filename, paths);
  expect(out1).not.toBe(out2);
});
