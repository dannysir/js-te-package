import {mockFunctions} from "./mockFunctions.js";

/**
 * 목업 함수로 변환하는 로직
 * @param {function} [implementation] - 목업 함수 로직 (선택, 기본값: () => null)
 * @returns {(function(...*): *) & MockMethods} 호출 가능하면서 목업 메서드를 가진 함수
 */
export const makeMockFnc = (implementation = (() => null)) => {
  const state = {
    returnQueue: [],
    curImplement: implementation,
  };

  const mockFn = (...args) => {
    if (state.returnQueue.length > 0) {
      return state.returnQueue.shift();
    }
    return state.curImplement(...args);
  };

  const methods = mockFunctions(mockFn, state);
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
