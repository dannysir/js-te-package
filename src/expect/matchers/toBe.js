import {formatErrorMsg} from "../../view/errorMessages.js";
import {runArgFnc} from "./utils/runArgFnc.js";

export const toBe = (actual, expected) => {
  const value = runArgFnc(actual);
  return {
    pass: Object.is(value, expected),
    message: () => formatErrorMsg(expected, value),
  };
};
