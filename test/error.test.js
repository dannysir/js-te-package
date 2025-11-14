import {expect, test} from "../index.js";

test('[ERROR - toBe] - string', () => {
  expect('hello').toBe('helle');
});

test('[ERROR - throw Error in test logic]', () => {
  const tmp = () => {
    throw new Error('INNER ERROR');
  };
  tmp();
  expect(1).toBe('ERROR');
});