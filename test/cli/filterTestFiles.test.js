import {filterTestFiles} from '../../src/cli/utils/filterTestFiles.js';

test('[filterTestFiles] filePatterns 비어 있음 → 원본 그대로', () => {
  const files = ['/a/user.test.js', '/a/payment.test.js'];
  const result = filterTestFiles(files, []);
  expect(result).toEqual(files);
});

test('[filterTestFiles] 단일 패턴 부분 문자열 매칭', () => {
  const files = ['/a/user.test.js', '/a/payment.test.js', '/a/auth.test.js'];
  const result = filterTestFiles(files, ['user']);
  expect(result).toEqual(['/a/user.test.js']);
});

test('[filterTestFiles] 여러 패턴 OR 합집합', () => {
  const files = ['/a/user.test.js', '/a/payment.test.js', '/a/auth.test.js'];
  const result = filterTestFiles(files, ['user', 'auth']);
  expect(result).toEqual(['/a/user.test.js', '/a/auth.test.js']);
});

test('[filterTestFiles] 0건 매칭 → 빈 배열', () => {
  const files = ['/a/user.test.js', '/a/payment.test.js'];
  const result = filterTestFiles(files, ['nonexistent']);
  expect(result).toEqual([]);
});

test('[filterTestFiles] 대소문자 구분', () => {
  const files = ['/a/user.test.js'];
  const result = filterTestFiles(files, ['User']);
  expect(result).toEqual([]);
});

test('[filterTestFiles] Windows 역슬래시 경로 정규화 → 슬래시 패턴과 매칭', () => {
  const files = ['C:\\proj\\src\\b\\c.test.js'];
  const result = filterTestFiles(files, ['b/c']);
  expect(result).toEqual(['C:\\proj\\src\\b\\c.test.js']);
});

test('[filterTestFiles] 슬래시 경로에 역슬래시 패턴도 정규화되어 매칭', () => {
  const files = ['/proj/src/b/c.test.js'];
  const result = filterTestFiles(files, ['b\\c']);
  expect(result).toEqual(['/proj/src/b/c.test.js']);
});
