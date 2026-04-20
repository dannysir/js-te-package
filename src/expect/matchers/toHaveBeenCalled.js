import {formatCalledErrorMsg} from "../../view/errorMessages.js";

export const toHaveBeenCalled = (actual) => {
  const callCount = actual?.mock?.calls?.length ?? 0;
  return {
    pass: callCount > 0,
    message: () => formatCalledErrorMsg(callCount),
  };
};
