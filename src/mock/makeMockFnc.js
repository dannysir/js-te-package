/**
 * 목업 함수의 메서드 타입 정의
 * @typedef {Object} MockMethods
 * @property {function(function): MockMethods} mockImplementation - 구현 설정
 * @property {function(...*): MockMethods} mockReturnValueOnce - 일회성 반환값 설정
 * @property {function(*): MockMethods} mockReturnValue - 반환값 설정
 * @property {function(): void} mockClear - 목업 상태 초기화
 */

const createMockMethods = (mockFn, state) => ({
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
});

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

  Object.assign(mockFn, createMockMethods(mockFn, state));

  return mockFn;
};
