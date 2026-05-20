const MESSAGE = '@dannysir/js-te/browser cannot be used in a Node.js runtime. '
  + 'It is designed for browsers and Web Workers only. '
  + 'Use the main `@dannysir/js-te` entry (or the `js-te` CLI) in Node.';

const guard = () => {
  throw new Error(MESSAGE);
};

const guardWithEach = Object.assign(guard, {each: () => guard});

export const describe = guard;
export const test = guardWithEach;
export const beforeEach = guard;
export const expect = guard;
export const fn = guard;
export const testManager = {
  getTests: guard,
  clearTests: guard,
  run: guard,
};
