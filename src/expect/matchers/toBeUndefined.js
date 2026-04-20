import {formatErrorMsg} from "../../view/errorMessages.js";

export const toBeUndefined = (actual) => ({
  pass: actual === undefined,
  message: () => formatErrorMsg(undefined, actual),
});
