import {formatErrorMsg} from "../../view/errorMessages.js";
import {runArgFnc} from "./utils/runArgFnc.js";

export const toEqual = (actual, expected) => {
  const value = runArgFnc(actual);
  return {
    pass: JSON.stringify(value) === JSON.stringify(expected),
    message: () => formatErrorMsg(expected, value),
  };
};
