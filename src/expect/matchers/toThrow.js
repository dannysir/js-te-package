import {formatThrowErrorMsg} from "../../view/errorMessages.js";

const isErrorClass = (value) => (
  typeof value === 'function' && (value === Error || value.prototype instanceof Error)
);

const matchesExpected = (thrown, expected) => {
  if (expected === undefined) return true;
  if (typeof expected === 'string') {
    return String(thrown?.message ?? thrown).includes(expected);
  }
  if (expected instanceof RegExp) {
    return expected.test(String(thrown?.message ?? thrown));
  }
  if (isErrorClass(expected)) {
    return thrown instanceof expected;
  }
  if (typeof expected === 'function') {
    return expected(thrown) === true;
  }
  return false;
};

export const toThrow = (actual, expected) => {
  let thrown;
  let didThrow = false;
  try {
    if (typeof actual === 'function') {
      actual();
    }
  } catch (e) {
    thrown = e;
    didThrow = true;
  }

  if (!didThrow) {
    return {
      pass: false,
      message: () => formatThrowErrorMsg(expected, undefined),
    };
  }

  return {
    pass: matchesExpected(thrown, expected),
    message: () => formatThrowErrorMsg(expected, thrown),
  };
};
