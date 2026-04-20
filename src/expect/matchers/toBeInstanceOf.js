import {formatInstanceOfErrorMsg} from "../../view/errorMessages.js";

export const toBeInstanceOf = (actual, Ctor) => ({
  pass: typeof Ctor === 'function' && actual instanceof Ctor,
  message: () => formatInstanceOfErrorMsg(Ctor, actual),
});
