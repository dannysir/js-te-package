import {describe, expect, test} from "../index.js";


describe('Math operations', () => {
  test('addition works', () => {
    expect(1 + 1).toBe(2);
  });

  test('subtraction works', () => {
    expect(5 - 3).toBe(2);
  });
});

test('strings are equal', () => {
  expect('hello').toBe('hello');
});

describe('1단계', () => {
  describe('2단계', () => {
    test('테스트', () => {
      expect([1, 2, 3]).toEqual([1, 2, 3]);
    });
  });
});

describe('1단계', () => {
  describe('2단계', () => {
    describe('3단계', () => {
      describe('4단계', () => {
        test('테스트', () => {
          expect([1, 2, 3]).toEqual([1, 2, 3]);
        });
      });
    });
  });
});