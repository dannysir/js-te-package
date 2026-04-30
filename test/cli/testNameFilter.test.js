import {filterTestsByName} from '../../src/testManager.js';

test('[filterTestsByName] 단순 description 부분 문자열 매칭', () => {
  const tests = [
    {description: 'hit alpha', path: ''},
    {description: 'hit beta', path: ''},
    {description: 'miss noise', path: ''},
  ];

  const result = filterTestsByName(tests, 'hit');
  expect(result.length).toBe(2);
});

test('[filterTestsByName] describe 경로에 포함된 패턴 매칭', () => {
  const tests = [
    {description: 'token', path: 'auth'},
    {description: 'session', path: 'auth'},
    {description: 'profile', path: 'user'},
  ];

  const result = filterTestsByName(tests, 'auth');
  expect(result.length).toBe(2);
});

test('[filterTestsByName] 풀네임 구분자(" > ") 포함 패턴 매칭', () => {
  const tests = [
    {description: 'create', path: 'api > user'},
    {description: 'delete', path: 'api > user'},
  ];

  const result = filterTestsByName(tests, 'api > user > create');
  expect(result.length).toBe(1);
});

test('[filterTestsByName] 0건 매칭 → 빈 배열', () => {
  const tests = [{description: 'only this', path: ''}];

  const result = filterTestsByName(tests, 'absent');
  expect(result.length).toBe(0);
});

test('[filterTestsByName] 대소문자 구분', () => {
  const tests = [{description: 'login', path: ''}];

  const result = filterTestsByName(tests, 'LOGIN');
  expect(result.length).toBe(0);
});

test('[filterTestsByName] pattern undefined → 입력 그대로 반환', () => {
  const tests = [
    {description: 'a', path: ''},
    {description: 'b', path: ''},
  ];

  const result = filterTestsByName(tests, undefined);
  expect(result.length).toBe(2);
});
