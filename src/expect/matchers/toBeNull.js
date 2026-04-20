import {formatErrorMsg} from "../../view/errorMessages.js";

export const toBeNull = (actual) => ({
  pass: actual === null,
  message: () => formatErrorMsg(null, actual),
});
