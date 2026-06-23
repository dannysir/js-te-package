import {testManager} from "./src/testManager.js";
import {clearAllMocks, isMocked, mock, unmock, mockStore} from './src/mock/store.js';
import {expect} from "./src/expect/index.js";
import {makeMockFnc} from "./src/mock/makeMockFnc.js";

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
 * 같은 파일 안의 일반 테스트를 모두 skip 처리하고, only 표시된 테스트만 실행합니다.
 *
 * @example
 * test.only('focused', () => { expect(1).toBe(1); });
 * test('skipped while only exists', () => { ... });
 */
test.only = (description, fn) => testManager.testOnly(description, fn);

/**
 * 데이터 기반 테스트 묶음 전체를 only 로 등록합니다. 같은 파일의 일반 테스트는 skip 으로 강등됩니다.
 *
 * @example
 * test.only.each([
 *   [1, 2, 3],
 *   [2, 3, 5],
 * ])('add(%s, %s) = %s', (a, b, expected) => {
 *   expect(a + b).toBe(expected);
 * });
 */
test.only.each = (cases) => testManager.testEach(cases, 'only');

/**
 * 테스트를 실행하지 않고 skipped 로 보고합니다.
 *
 * @example
 * test.skip('temporarily disabled', () => { ... });
 */
test.skip = (description, fn) => testManager.testSkip(description, fn);

/**
 * 데이터 기반 테스트 묶음 전체를 skip 으로 등록합니다. 함수는 실행되지 않습니다.
 *
 * @example
 * test.skip.each([
 *   [1, 2, 3],
 *   [2, 3, 5],
 * ])('add(%s, %s) = %s', (a, b, expected) => {
 *   expect(a + b).toBe(expected);
 * });
 */
test.skip.each = (cases) => testManager.testEach(cases, 'skip');

/**
 * 아직 구현되지 않은 테스트를 todo 로 보고합니다. 함수 인자를 받지 않습니다.
 *
 * @example
 * test.todo('write reset password test');
 */
test.todo = (description) => testManager.testTodo(description);

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
 * 그룹 안의 모든 테스트를 only 로 표시합니다. 같은 파일의 일반 테스트는 skip 으로 강등됩니다.
 *
 * @example
 * describe.only('focused suite', () => {
 *   test('runs', () => { ... });
 * });
 */
describe.only = (suiteName, fn) => testManager.describeOnly(suiteName, fn);

/**
 * 그룹 안의 모든 테스트를 skip 으로 표시합니다.
 *
 * @example
 * describe.skip('temporarily disabled suite', () => {
 *   test('skipped', () => { ... });
 * });
 */
describe.skip = (suiteName, fn) => testManager.describeSkip(suiteName, fn);

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
 * @internal
 * CLI 러너 전용. 사용자에게 글로벌로 노출되지 않으며 직접 호출은 권장하지 않습니다.
 * 사용자가 test fn 안에서 호출하면 외부 러너의 run 과 재귀 충돌해 결과가 오염됩니다.
 */
export const run = (reporter, testNamePattern, file, testLocation) => testManager.run(reporter, testNamePattern, file, testLocation);

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

export const fn = makeMockFnc;
