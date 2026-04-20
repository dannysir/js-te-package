import {deepEqual} from '../src/expect/matchers/utils/deepEqual.js';

describe('[deepEqual] 원시값', () => {
  test('같은 숫자', () => {
    expect(deepEqual(1, 1)).toBe(true);
  });

  test('NaN 자기 자신', () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  test('+0 vs -0 구분 (Object.is 기반)', () => {
    expect(deepEqual(+0, -0)).toBe(false);
  });

  test('다른 원시값', () => {
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });
});

describe('[deepEqual] 배열', () => {
  test('같은 내용', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  test('다른 길이', () => {
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  test('중첩 배열', () => {
    expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
  });
});

describe('[deepEqual] 객체', () => {
  test('같은 키·값', () => {
    expect(deepEqual({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
  });

  test('키 순서가 달라도 동등', () => {
    expect(deepEqual({a: 1, b: 2}, {b: 2, a: 1})).toBe(true);
  });

  test('다른 키 개수', () => {
    expect(deepEqual({a: 1}, {a: 1, b: 2})).toBe(false);
  });

  test('중첩 객체', () => {
    expect(deepEqual({a: {b: {c: 1}}}, {a: {b: {c: 1}}})).toBe(true);
  });

  test('다른 prototype 거부 ({} vs Date)', () => {
    expect(deepEqual({}, new Date())).toBe(false);
  });
});

describe('[deepEqual] 순환 참조', () => {
  test('자기 참조 객체 — 크래시 없이 true', () => {
    const a = {};
    a.self = a;
    const b = {};
    b.self = b;
    expect(deepEqual(a, b)).toBe(true);
  });

  test('상호 참조 객체', () => {
    const a = {name: 'a'};
    const b = {name: 'a'};
    a.peer = a;
    b.peer = b;
    expect(deepEqual(a, b)).toBe(true);
  });

  test('순환 구조이지만 다른 값', () => {
    const a = {name: 'a'};
    const b = {name: 'b'};
    a.self = a;
    b.self = b;
    expect(deepEqual(a, b)).toBe(false);
  });
});
