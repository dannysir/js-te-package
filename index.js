import {testManager} from "./src/testManager.js";
import {clearAllMocks, isMocked, mock, unmock, mockStore} from './src/mock/store.js';
import {expect} from "./src/expect.js";

export const test = (description, fn) => testManager.test(description, fn);
test.each = (cases) => testManager.testEach(cases);

export const describe = (suiteName, fn) => testManager.describe(suiteName, fn);

export const beforeEach = (fn) => testManager.beforeEach(fn);

export const run = () => testManager.run();

export {expect};

export {mock, clearAllMocks, unmock, isMocked, mockStore};
