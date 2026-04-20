import {formatErrorMsg} from "../../view/errorMessages.js";
import {runArgFnc} from "./utils/runArgFnc.js";

export const toBeFalsy = (actual) => {
  const value = runArgFnc(actual);
  return {
    pass: !value,
    message: () => formatErrorMsg(false, value),
  };
};
