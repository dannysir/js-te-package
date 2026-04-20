import {formatCalledTimesErrorMsg} from "../../view/errorMessages.js";

export const toHaveBeenCalledTimes = (actual, expected) => {
  const callCount = actual?.mock?.calls?.length ?? 0;
  return {
    pass: callCount === expected,
    message: () => formatCalledTimesErrorMsg(expected, callCount),
  };
};
