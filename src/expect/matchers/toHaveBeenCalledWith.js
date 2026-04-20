import {formatCalledWithErrorMsg} from "../../view/errorMessages.js";

export const toHaveBeenCalledWith = (actual, ...expectedArgs) => {
  const calls = actual?.mock?.calls ?? [];
  const expectedKey = JSON.stringify(expectedArgs);
  return {
    pass: calls.some(callArgs => JSON.stringify(callArgs) === expectedKey),
    message: () => formatCalledWithErrorMsg(expectedArgs, calls),
  };
};
