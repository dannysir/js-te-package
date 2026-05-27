import {filterTestsByLocation} from '../../src/testManager.js';

test('[filterTestsByLocation] 파일+라인 정확 일치', () => {
  const tests = [
    {description: 'a', location: {file: '/abs/user.test.js', line: 10}},
    {description: 'b', location: {file: '/abs/user.test.js', line: 20}},
  ];

  const result = filterTestsByLocation(tests, {file: '/abs/user.test.js', line: 20});
  expect(result.length).toBe(1);
  expect(result[0].description).toBe('b');
});

test('[filterTestsByLocation] 파일 다름 → 0건', () => {
  const tests = [{description: 'a', location: {file: '/abs/user.test.js', line: 10}}];

  const result = filterTestsByLocation(tests, {file: '/abs/other.test.js', line: 10});
  expect(result.length).toBe(0);
});

test('[filterTestsByLocation] 라인 다름 → 0건', () => {
  const tests = [{description: 'a', location: {file: '/abs/user.test.js', line: 10}}];

  const result = filterTestsByLocation(tests, {file: '/abs/user.test.js', line: 11});
  expect(result.length).toBe(0);
});

test('[filterTestsByLocation] location 없는 테스트는 제외', () => {
  const tests = [
    {description: 'a'},
    {description: 'b', location: {file: '/abs/user.test.js', line: 10}},
  ];

  const result = filterTestsByLocation(tests, {file: '/abs/user.test.js', line: 10});
  expect(result.length).toBe(1);
  expect(result[0].description).toBe('b');
});

test('[filterTestsByLocation] location undefined → 입력 그대로 반환', () => {
  const tests = [
    {description: 'a', location: {file: '/abs/user.test.js', line: 10}},
    {description: 'b', location: {file: '/abs/user.test.js', line: 20}},
  ];

  const result = filterTestsByLocation(tests, undefined);
  expect(result.length).toBe(2);
});
