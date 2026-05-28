import path from 'node:path';
import {parseCliArgs, parseTestLocation, printHelp} from '../../src/cli/parseCliArgs.js';

test('[parseCliArgs] 인자 없음 → 기본값', () => {
  const result = parseCliArgs([]);
  expect(result).toEqual({filePatterns: [], testNamePattern: undefined, testLocation: undefined, reporter: 'default', help: false});
});

test('[parseCliArgs] positional 1개 → filePatterns 배열', () => {
  const result = parseCliArgs(['user']);
  expect(result.filePatterns).toEqual(['user']);
  expect(result.testNamePattern).toBe(undefined);
  expect(result.help).toBe(false);
});

test('[parseCliArgs] positional 여러 개 → 순서 보존', () => {
  const result = parseCliArgs(['user', 'payment']);
  expect(result.filePatterns).toEqual(['user', 'payment']);
});

test('[parseCliArgs] --testNamePattern 옵션', () => {
  const result = parseCliArgs(['--testNamePattern', 'login']);
  expect(result.testNamePattern).toBe('login');
  expect(result.filePatterns).toEqual([]);
});

test('[parseCliArgs] -t short alias', () => {
  const result = parseCliArgs(['-t', 'login']);
  expect(result.testNamePattern).toBe('login');
});

test('[parseCliArgs] --help 플래그', () => {
  const result = parseCliArgs(['--help']);
  expect(result.help).toBe(true);
});

test('[parseCliArgs] -h short alias', () => {
  const result = parseCliArgs(['-h']);
  expect(result.help).toBe(true);
});

test('[parseCliArgs] positional + 옵션 조합', () => {
  const result = parseCliArgs(['auth', '-t', 'token']);
  expect(result.filePatterns).toEqual(['auth']);
  expect(result.testNamePattern).toBe('token');
});

test('[parseCliArgs] 옵션 먼저 + positional 뒤 조합', () => {
  const result = parseCliArgs(['-t', 'token', 'auth']);
  expect(result.filePatterns).toEqual(['auth']);
  expect(result.testNamePattern).toBe('token');
});

test('[parseCliArgs] 알 수 없는 옵션 → throw', () => {
  expect(() => parseCliArgs(['--bogus'])).toThrow('Invalid CLI arguments');
});

test('[parseCliArgs] --testLocation → 절대경로 + 라인으로 파싱', () => {
  const result = parseCliArgs(['--testLocation', 'test/user.test.js:42']);
  expect(result.testLocation).toEqual({file: path.resolve(process.cwd(), 'test/user.test.js'), line: 42});
});

test('[parseTestLocation] 정상 분리', () => {
  const result = parseTestLocation('test/user.test.js:42');
  expect(result).toEqual({file: path.resolve(process.cwd(), 'test/user.test.js'), line: 42});
});

test('[parseTestLocation] 상대경로를 cwd 기준 절대경로로 변환', () => {
  const result = parseTestLocation('./a/b.test.js:7');
  expect(result.file).toBe(path.resolve(process.cwd(), './a/b.test.js'));
});

test('[parseTestLocation] 콜론 없음 → throw', () => {
  expect(() => parseTestLocation('test/user.test.js')).toThrow('testLocation must be');
});

test('[parseTestLocation] 라인이 숫자가 아님 → throw', () => {
  expect(() => parseTestLocation('test/user.test.js:abc')).toThrow('testLocation must be');
});

test('[parseTestLocation] 라인이 0 이하 → throw', () => {
  expect(() => parseTestLocation('test/user.test.js:0')).toThrow('testLocation must be');
});

test('[parseCliArgs] --reporter 미지정 → "default"', () => {
  const result = parseCliArgs([]);
  expect(result.reporter).toBe('default');
});

test('[parseCliArgs] --reporter json', () => {
  const result = parseCliArgs(['--reporter', 'json']);
  expect(result.reporter).toBe('json');
});

test('[parseCliArgs] --reporter default 명시', () => {
  const result = parseCliArgs(['--reporter', 'default']);
  expect(result.reporter).toBe('default');
});

test('[parseCliArgs] --reporter 알 수 없는 값 → throw', () => {
  expect(() => parseCliArgs(['--reporter', 'bogus'])).toThrow('Invalid CLI arguments');
  expect(() => parseCliArgs(['--reporter', 'bogus'])).toThrow('unknown reporter');
});

test('[printHelp] Usage 포함 텍스트를 stdout으로 방출', () => {
  const spy = fn();
  const original = process.stdout.write;
  process.stdout.write = spy;
  try {
    printHelp();
    expect(spy).toHaveBeenCalledTimes(1);
    const [text] = spy.mock.calls[0];
    expect(text).toContain('Usage:');
    expect(text).toContain('js-te');
    expect(text).toContain('--testNamePattern');
    expect(text).toContain('--testLocation');
    expect(text).toContain('--reporter');
    expect(text).toContain('--help');
  } finally {
    process.stdout.write = original;
  }
});
