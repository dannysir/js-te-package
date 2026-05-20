// Type definitions for @dannysir/js-te/browser
//
// 브라우저/Web Worker 전용 entry. Node 런타임에서 import하면 런타임 에러를 던지지만,
// 타입 표면은 실제 구현(browser.js)과 동일하다.

export { test, describe, beforeEach, expect, fn } from './index';
export type {
  Test,
  TestFn,
  Matchers,
  Expectation,
  MockFn,
  MockState,
  TestManager,
  TestCase,
  Reporter,
  RunResult,
} from './index';

import type { TestManager } from './index';

export const testManager: TestManager;
