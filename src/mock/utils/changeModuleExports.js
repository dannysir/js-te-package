import {mockFunctions} from "./mockFunctions.js";

const makeMockFnc = (implementation) => {
  const state = {
    returnQueue: [],
    curImplement: implementation || (() => null)
  };

  const mockFn = (...args) => {
    if (state.returnQueue.length > 0) {
      return state.returnQueue.shift();
    }
    return state.curImplement(...args);
  };

  const methods = mockFunctions(state);
  Object.assign(mockFn, methods);

  return mockFn;
};

export const changeModuleExports = (moduleExports) => {
  const result = {};

  for (const moduleName in moduleExports) {
    result[moduleName] = makeMockFnc(moduleExports[moduleName]);
  }

  return result;
};