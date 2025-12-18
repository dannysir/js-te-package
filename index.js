import {testManager} from "./src/testManager.js";
import {clearAllMocks, isMocked, mock, unmock, mockStore} from './src/mock/store.js';
import {expect} from "./src/expect.js";

/**
 * 테스트 케이스를 정의합니다.
 * @param {string} description - 테스트 설명
 * @param {Function} fn - 테스트 함수
 *
 * @example
 * test('더하기 테스트', () => {
 *   expect(1 + 2).toBe(3);
 * });
 */
export const test = (description, fn) => testManager.test(description, fn);

/**
 * 배열 형태의 테스트 케이스를 반복 실행합니다.
 * @param {Array<Array>} cases - 테스트 케이스 배열
 * @returns {Function} 테스트 실행 함수
 *
 * @example
 * test.each([
 *   [1, 2, 3],
 *   [2, 3, 5],
 * ])('add(%s, %s) = %s', (a, b, expected) => {
 *   expect(a + b).toBe(expected);
 * });
 */
test.each = (cases) => testManager.testEach(cases);

/**
 * 테스트 그룹을 정의합니다. 중첩 가능합니다.
 * @param {string} suiteName - 그룹 이름
 * @param {Function} fn - 그룹 내부 테스트들을 정의하는 함수
 *
 * @example
 * describe('계산기', () => {
 *   test('더하기', () => {
 *     expect(1 + 1).toBe(2);
 *   });
 * });
 */
export const describe = (suiteName, fn) => testManager.describe(suiteName, fn);

/**
 * 각 테스트 실행 전에 실행될 함수를 등록합니다.
 * @param {Function} fn - 전처리 함수
 *
 * @example
 * describe('카운터 테스트', () => {
 *   let counter;
 *
 *   beforeEach(() => {
 *     counter = 0;
 *   });
 *
 *   test('초기값은 0', () => {
 *     expect(counter).toBe(0);
 *   });
 * });
 */
export const beforeEach = (fn) => testManager.beforeEach(fn);

/**
 * 등록된 모든 테스트를 실행합니다.
 * @returns {Promise<{passed: number, failed: number}>} 테스트 결과
 *
 * @example
 * const { passed, failed } = await run();
 * console.log(`${passed} passed, ${failed} failed`);
 */
export const run = () => testManager.run();

/**
 * 값을 검증하는 matcher 함수들을 반환합니다.
 * @function
 * @param {*} actual - 검증할 값
 * @returns {Object} matcher 함수들
 *
 * @example
 * expect(1 + 1).toBe(2);
 * expect([1, 2, 3]).toEqual([1, 2, 3]);
 * expect(() => { throw new Error('error') }).toThrow('error');
 * expect(true).toBeTruthy();
 * expect(false).toBeFalsy();
 */
export {expect};

export {mock, clearAllMocks, unmock, isMocked, mockStore};
