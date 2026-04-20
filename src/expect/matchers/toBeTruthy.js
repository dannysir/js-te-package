import {formatErrorMsg} from "../../view/errorMessages.js";
import {runArgFnc} from "./utils/runArgFnc.js";

export const toBeTruthy = (actual) => {
  const value = runArgFnc(actual);
  return {
    pass: Boolean(value),
    message: () => formatErrorMsg(true, value),
  };
};
