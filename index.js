import {testManager} from "./src/testManager.js";
import {clearAllMocks, isMocked, mock, unmock, mockStore} from './src/mock/store.js';
import {expect} from "./src/expect.js";
import {run} from "./src/testRunner";

export const test = (description, fn) => testManager.test(description, fn);
test.each = (cases) => testManager.testEach(cases);

export const describe = (suiteName, fn) => testManager.describe(suiteName, fn);

export const beforeEach = (fn) => testManager.beforeEach(fn);

export {expect, run};

export {mock, clearAllMocks, unmock, isMocked, mockStore};
