import {makeMockFnc} from "./makeMockFnc.js";

export const changeModuleExports = (moduleExports) => {
  const result = {};

  for (const moduleName in moduleExports) {
    result[moduleName] = makeMockFnc(moduleExports[moduleName]);
  }

  return result;
};
