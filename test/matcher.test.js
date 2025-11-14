import {expect, test} from "../index.js";

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