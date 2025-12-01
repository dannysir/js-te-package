import {toBe, toBeFalsy, toBeTruthy, toEqual, toThrow} from "./matchers.js";

export const expect = (actual) => {
  return {
    toBe(expected) {
      toBe(actual, expected);
    },
    toEqual(expected) {
      toEqual(actual, expected);
    },
    toThrow(expected) {
      toThrow(actual, expected);
    },
    toBeTruthy() {
      toBeTruthy(actual);
    },
    toBeFalsy() {
      toBeFalsy(actual);
    }
  }
};
