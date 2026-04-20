import {formatErrorMsg} from "../../view/errorMessages.js";
import {runArgFnc} from "./utils/runArgFnc.js";
import {deepEqual} from "./utils/deepEqual.js";

export const toEqual = (actual, expected) => {
  const value = runArgFnc(actual);
  return {
    pass: deepEqual(value, expected),
    message: () => formatErrorMsg(expected, value),
  };
};
