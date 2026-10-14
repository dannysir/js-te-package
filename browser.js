import {testManager} from "./src/testManager.js";
import {expect} from "./src/expect/index.js";
import {makeMockFnc} from "./src/mock/makeMockFnc.js";

export const test = (description, fn) => testManager.test(description, fn);
test.each = (cases) => testManager.testEach(cases);
test.only = (description, fn) => testManager.testOnly(description, fn);
test.only.each = (cases) => testManager.testEach(cases, 'only');
test.skip = (description, fn) => testManager.testSkip(description, fn);
test.skip.each = (cases) => testManager.testEach(cases, 'skip');
test.todo = (description) => testManager.testTodo(description);

export const describe = (suiteName, fn) => testManager.describe(suiteName, fn);
describe.only = (suiteName, fn) => testManager.describeOnly(suiteName, fn);
describe.skip = (suiteName, fn) => testManager.describeSkip(suiteName, fn);
describe.each = (cases) => testManager.describeEach(cases);
describe.only.each = (cases) => testManager.describeEach(cases, 'only');
describe.skip.each = (cases) => testManager.describeEach(cases, 'skip');

export const beforeEach = (fn) => testManager.beforeEach(fn);

export {expect, testManager};
export const fn = makeMockFnc;
