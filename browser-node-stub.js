const MESSAGE = '@dannysir/js-te/browser cannot be used in a Node.js runtime. '
  + 'It is designed for browsers and Web Workers only. '
  + 'Use the main `@dannysir/js-te` entry (or the `js-te` CLI) in Node.';

const guard = () => {
  throw new Error(MESSAGE);
};

const testGuard = Object.assign(guard, {
  each: () => guard,
  only: guard,
  skip: guard,
  todo: guard,
});
const describeGuard = Object.assign(guard, {only: guard, skip: guard});

export const describe = describeGuard;
export const test = testGuard;
export const beforeEach = guard;
export const expect = guard;
export const fn = guard;
export const testManager = {
  getTests: guard,
  clearTests: guard,
  run: guard,
};
