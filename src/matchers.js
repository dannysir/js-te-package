import {formatErrorMsg, formatThrowErrorMsg} from "./utils/formatString.js";

const runArgFnc = (actual) => {
  if (typeof actual === 'function') {
    return actual();
  }
  return actual;
};

export const toBe = (actual, expected) => {
  const value = runArgFnc(actual);
  if (value !== expected) {
    throw new Error(formatErrorMsg(expected, value));
  }
};

export const toEqual = (actual, expected) => {
  const value = runArgFnc(actual);
  if (JSON.stringify(value) !== JSON.stringify(expected)) {
    throw new Error(formatErrorMsg(expected, value));
  }
};

export const toThrow = (actual, expected) => {
  try {
    runArgFnc(actual);
  } catch (e) {
    if (!e.message.includes(expected)) {
      throw new Error(formatErrorMsg(expected, e.message));
    }
    return;
  }
  throw new Error(formatThrowErrorMsg(expected));
};

export const toBeTruthy = (actual) => {
  const value = runArgFnc(actual);
  if (!value) {
    throw new Error(formatErrorMsg(true, value));
  }
};

export const toBeFalsy = (actual) => {
  const value = runArgFnc(actual);
  if (value) {
    throw new Error(formatErrorMsg(false, value));
  }
};
