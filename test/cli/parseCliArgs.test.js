import {parseCliArgs, printHelp} from '../../src/cli/parseCliArgs.js';

test('[parseCliArgs] 인자 없음 → 기본값', () => {
  const result = parseCliArgs([]);
  expect(result).toEqual({filePatterns: [], testNamePattern: undefined, help: false});
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
    expect(text).toContain('--help');
  } finally {
    process.stdout.write = original;
  }
});
