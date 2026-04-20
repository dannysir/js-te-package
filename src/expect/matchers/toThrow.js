import {formatErrorMsg, formatThrowErrorMsg} from "../../view/errorMessages.js";

export const toThrow = (actual, expected) => {
  let thrown = null;
  try {
    if (typeof actual === 'function') {
      actual();
    }
  } catch (e) {
    thrown = e;
  }

  if (!thrown) {
    return {
      pass: false,
      message: () => formatThrowErrorMsg(expected),
    };
  }

  const matches = thrown.message.includes(expected);
  return {
    pass: matches,
    message: () => formatErrorMsg(expected, thrown.message),
  };
};
