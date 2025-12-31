import {play} from "../test-helper/game.js";
import {random} from "../test-helper/random.js";

describe('[describe depth test] - 1단계', () => {
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

describe('[function return test] - expect arg', () => {
  test('[ERROR] - expect throw Error', () => {
    expect(() => {
      throw new Error('ERROR');
    }).toThrow('ERROR');
  });
});

describe('[mocking] - mocking test', () => {
  test('[mock module] - mocking random function', async () => {
    mock('/Users/san/js-te-package/test-helper/random.js', {
      random: () => 3,
    });

    expect(play()).toBe(30);
  });

  test('[mock module mockReturnValueOnce] - mocking function test', async () => {
    const mocked = mock('/Users/san/js-te-package/test-helper/random.js', {
      random: () => 1,
    });
    const result = 3;

    mocked.random.mockReturnValueOnce(result);

    expect(random()).toBe(result);
  });

  test('[mock function] - mockReturnValueOnce, mockReturnValue', () => {
    const mocked = mock('/Users/san/js-te-package/test-helper/random.js', {
      random
    });
    const input = [2, 4, 6, 8, 10];
    const defaultValue = -1;

    mocked.random.mockReturnValueOnce(...input);
    mocked.random.mockReturnValue(defaultValue);

    input.forEach(value => {
      expect(random()).toBe(value);
    });
    expect(random()).toBe(defaultValue);
  });

  test('[mock function] - fn, mockImplementation', () => {
    const mockFunc = fn();
    const add = (a, b) => a + b;

    mockFunc.mockImplementation(add);

    expect(mockFunc(1, 2)).toBe(3);
  });
});

test.each([
  [1, 2, 3, 6],
  [3, 4, 5, 12],
  [10, 20, 13, 43],
  [10, 12, 13, 35],
])('[each test] - input : %s, %s, %s, %s', (a, b, c, result) => {
  expect(a + b + c).toBe(result);
});

test.each([
  [{ name : 'dannysir', age : null}],
])('[each test placeholder] - input : %o', (arg) => {
  expect(arg.name).toBe('dannysir');
});

describe('[beforeEach test]', () => {
  let counter;
  beforeEach(() => {
    counter = 0;
  });

  test('counter init', () => {
    expect(counter + 10).toBe(10);
  });

  describe('add beforeEach', () => {
    beforeEach(() => {
      counter = 10;
    });

    test('counter is 10', () => {
      expect(counter).toBe(10);
    });
  });

  test('outer test counter is 0', () => {
    expect(counter).toBe(0);
  });
});