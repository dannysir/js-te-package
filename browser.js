import {testManager} from "./src/testManager.js";
import {expect} from "./src/expect/index.js";
import {makeMockFnc} from "./src/mock/makeMockFnc.js";

export const test = (description, fn) => testManager.test(description, fn);
test.each = (cases) => testManager.testEach(cases);

export const describe = (suiteName, fn) => testManager.describe(suiteName, fn);
export const beforeEach = (fn) => testManager.beforeEach(fn);

export {expect, testManager};
export const fn = makeMockFnc;
