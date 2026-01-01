/**
 * 목업 함수의 메서드 타입 정의
 * @typedef {Object} MockMethods
 * @property {function(function): MockMethods} mockImplementation - 구현 설정
 * @property {function(...*): MockMethods} mockReturnValueOnce - 일회성 반환값 설정
 * @property {function(*): MockMethods} mockReturnValue - 반환값 설정
 * @property {function(): void} mockClear - 목업 상태 초기화
 */

/**
 * @param {function} mockFn
 * @param {Object} state
 * @returns {{mockImplementation(*): this, mockReturnValueOnce(...[*]): this, mockReturnValue(*): this, mockClear(): this}|*}
 */
export const mockFunctions = (mockFn, state) => {
  return {
    mockImplementation(newImpl) {
      state.curImplement = newImpl;
      return mockFn;
    },

    mockReturnValueOnce(...value) {
      state.returnQueue.push(...value);
      return mockFn;
    },

    mockReturnValue(value) {
      state.curImplement = () => value;
      return mockFn;
    },

    mockClear() {
      state.returnQueue = [];
      state.curImplement = () => null;
      return mockFn;
    },
  }
};
