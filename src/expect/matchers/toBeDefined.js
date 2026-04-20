import {formatErrorMsg} from "../../view/errorMessages.js";

export const toBeDefined = (actual) => ({
  pass: actual !== undefined,
  message: () => formatErrorMsg('defined value', actual),
});
