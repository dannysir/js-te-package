test('[matcher : toBe] - number', () => {
  expect(1 + 1).toBe(2);
});

test('[matcher : toBe] - string', () => {
  expect('hello').toBe('hello');
});

test('[matcher : toEqual] - Object', () => {
  const obj = {
    name: 'dannysir',
    email: 'dannysir@naver.com',
    age: null,
  };

  const testFnc = () => {
    const newObj = {};

    Object.keys(obj).forEach(key => {
      newObj[key] = obj[key];
    });

    return newObj;
  };

  expect(testFnc).toEqual(obj);
});

test('[matcher : toEqual] - Object', () => {
  const obj = [1, 2, 3, 4, 5];

  expect(obj).toEqual([...obj]);
});

test('[matcher : toThrow] - with Error message', () => {
  const errorThrow = () => {
    throw new Error('[ERROR] - 에러 발생 테스트 에러');
  };

  expect(() => errorThrow()).toThrow('[ERROR]');
});

test('[matcher : toBeTruthy] - return true', () => {
  expect(true).toBeTruthy();
});

test('[matcher : toBeFalsy] - return false', () => {
  expect(false).toBeFalsy();
});

test('[matcher : .not] - toBe', () => {
  expect(2).not.toBe(1);
});

test('[matcher : .not] - toEqual', () => {
  expect([1, 2]).not.toEqual([1, 2, 3]);
});

test('[matcher : .not] - toBeTruthy', () => {
  expect(0).not.toBeTruthy();
});

test('[matcher : .not] - toBeFalsy', () => {
  expect('non-empty').not.toBeFalsy();
});

test('[matcher : toThrow] - no expected (any error)', () => {
  expect(() => { throw new Error('whatever'); }).toThrow();
});

test('[matcher : toThrow] - RegExp', () => {
  expect(() => { throw new Error('failed: code 42'); }).toThrow(/code \d+/);
});

test('[matcher : toThrow] - Error subclass', () => {
  class MyError extends Error {}
  expect(() => { throw new MyError('boom'); }).toThrow(MyError);
});

test('[matcher : toThrow] - predicate', () => {
  expect(() => { throw new Error('predicate target'); })
    .toThrow((err) => err.message.startsWith('predicate'));
});

test('[matcher : toThrow .not] - does not throw', () => {
  expect(() => 1 + 1).not.toThrow();
});

test('[matcher : toContain] - array', () => {
  expect([1, 2, 3]).toContain(2);
});

test('[matcher : toContain] - string', () => {
  expect('hello world').toContain('world');
});

test('[matcher : toContain .not]', () => {
  expect([1, 2, 3]).not.toContain(99);
});

test('[matcher : toBeInstanceOf]', () => {
  class Animal {}
  const a = new Animal();
  expect(a).toBeInstanceOf(Animal);
});

test('[matcher : toBeInstanceOf .not]', () => {
  expect({}).not.toBeInstanceOf(Array);
});

test('[matcher : toBeNull]', () => {
  expect(null).toBeNull();
});

test('[matcher : toBeNull .not]', () => {
  expect(0).not.toBeNull();
});

test('[matcher : toBeUndefined]', () => {
  let x;
  expect(x).toBeUndefined();
});

test('[matcher : toBeDefined]', () => {
  expect(0).toBeDefined();
});

test('[matcher : toBeDefined .not]', () => {
  let x;
  expect(x).not.toBeDefined();
});

test('[matcher : toHaveBeenCalled]', () => {
  const mockFn = fn();
  mockFn('a');
  expect(mockFn).toHaveBeenCalled();
});

test('[matcher : toHaveBeenCalled .not]', () => {
  const mockFn = fn();
  expect(mockFn).not.toHaveBeenCalled();
});

test('[matcher : toHaveBeenCalledWith]', () => {
  const mockFn = fn();
  mockFn(1, 2);
  mockFn('x');
  expect(mockFn).toHaveBeenCalledWith(1, 2);
});

test('[matcher : toHaveBeenCalledTimes]', () => {
  const mockFn = fn();
  mockFn();
  mockFn();
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(3);
});

test('[matcher : mockClear clears calls]', () => {
  const mockFn = fn();
  mockFn();
  mockFn();
  mockFn.mockClear();
  expect(mockFn).toHaveBeenCalledTimes(0);
});

test('[matcher : toEqual] - 키 순서 무관하게 동등', () => {
  expect({a: 1, b: 2}).toEqual({b: 2, a: 1});
});

test('[matcher : toEqual] - 순환 참조도 크래시 없이 처리', () => {
  const a = {name: 'x'};
  a.self = a;
  const b = {name: 'x'};
  b.self = b;
  expect(a).toEqual(b);
});

test('[matcher : toHaveBeenCalledWith] - 키 순서 무관', () => {
  const mockFn = fn();
  mockFn({a: 1, b: 2});
  expect(mockFn).toHaveBeenCalledWith({b: 2, a: 1});
});

test('[matcher : toHaveBeenCalledWith] - 순환 참조 인자 안전', () => {
  const mockFn = fn();
  const cyclic = {tag: 'c'};
  cyclic.self = cyclic;
  mockFn(cyclic);

  const expected = {tag: 'c'};
  expected.self = expected;
  expect(mockFn).toHaveBeenCalledWith(expected);
});