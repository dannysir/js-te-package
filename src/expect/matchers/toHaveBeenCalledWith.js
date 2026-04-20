import {formatCalledWithErrorMsg} from "../../view/errorMessages.js";
import {deepEqual} from "./utils/deepEqual.js";

export const toHaveBeenCalledWith = (actual, ...expectedArgs) => {
  const calls = actual?.mock?.calls ?? [];
  return {
    pass: calls.some((callArgs) => deepEqual(callArgs, expectedArgs)),
    message: () => formatCalledWithErrorMsg(expectedArgs, calls),
  };
};
