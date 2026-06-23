// Type definitions for @dannysir/js-te

export type TestFn = () => void | Promise<void>;

export type TestMode = 'normal' | 'only' | 'skip' | 'todo';

export interface Test {
  /** 테스트 케이스를 정의합니다. */
  (description: string, fn: TestFn): void;
  /** 배열 형태의 테스트 케이스를 반복 실행합니다. */
  each: {
    <T extends readonly unknown[]>(
      cases: readonly T[]
    ): (description: string, fn: (...args: T) => void | Promise<void>) => void;
    (
      cases: readonly unknown[]
    ): (description: string, fn: (...args: unknown[]) => void | Promise<void>) => void;
  };
  /** 같은 파일의 일반 테스트를 모두 skip 처리하고 이 테스트만 실행합니다. */
  only: {
    (description: string, fn: TestFn): void;
    /** 데이터 기반 테스트 묶음 전체를 only 로 등록합니다. */
    each: Test['each'];
  };
  /** 테스트를 실행하지 않고 skipped 로 보고합니다. */
  skip: {
    (description: string, fn: TestFn): void;
    /** 데이터 기반 테스트 묶음 전체를 skip 으로 등록합니다. */
    each: Test['each'];
  };
  /** 아직 구현되지 않은 테스트를 todo 로 보고합니다. 함수 인자를 받지 않습니다. */
  todo: (description: string) => void;
}

/** 테스트 케이스를 정의합니다. */
export const test: Test;

export interface Describe {
  /** 테스트 그룹을 정의합니다. 중첩 가능합니다. */
  (suiteName: string, fn: () => void): void;
  /** 그룹 안의 모든 테스트를 only 로 표시합니다. */
  only: (suiteName: string, fn: () => void) => void;
  /** 그룹 안의 모든 테스트를 skip 으로 표시합니다. */
  skip: (suiteName: string, fn: () => void) => void;
}

/** 테스트 그룹을 정의합니다. 중첩 가능합니다. */
export const describe: Describe;

/** 각 테스트 실행 전에 실행될 함수를 등록합니다. */
export const beforeEach: (fn: TestFn) => void;

export interface Matchers {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toThrow(
    expected?: string | RegExp | ErrorConstructor | ((thrown: unknown) => boolean)
  ): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toContain(expected: unknown): void;
  toBeInstanceOf(Ctor: Function): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toHaveBeenCalled(): void;
  toHaveBeenCalledWith(...args: unknown[]): void;
  toHaveBeenCalledTimes(times: number): void;
}

export interface Expectation extends Matchers {
  not: Matchers;
}

/** 값을 검증하는 matcher 함수들을 반환합니다. */
export const expect: (actual: unknown) => Expectation;

export interface MockState<A extends unknown[]> {
  calls: A[];
}

export interface MockFn<A extends unknown[] = unknown[], R = unknown> {
  (...args: A): R;
  /** 목업 구현을 설정합니다. */
  mockImplementation(impl: (...args: A) => R): this;
  /** 일회성 반환값을 큐에 추가합니다. */
  mockReturnValueOnce(...values: R[]): this;
  /** 고정 반환값을 설정합니다. */
  mockReturnValue(value: R): this;
  /** 목업 상태(반환값·calls)를 초기화합니다. */
  mockClear(): this;
  /** 호출 추적 정보 */
  mock: MockState<A>;
}

/** 목업 함수를 생성합니다. */
export const fn: <A extends unknown[] = unknown[], R = unknown>(
  implementation?: (...args: A) => R
) => MockFn<A, R>;

/** 모듈 export들을 목업으로 교체합니다. */
export const mock: (
  modulePath: string,
  mockExports: Record<string, (...args: any[]) => any>
) => Record<string, MockFn>;

/** 모듈 목업을 해제합니다. */
export const unmock: (modulePath: string) => void;

/** 해당 모듈이 목업되어 있는지 확인합니다. */
export const isMocked: (modulePath: string) => boolean;

/** 등록된 모든 모듈 목업을 제거합니다. */
export const clearAllMocks: () => void;

/** 모듈 목업 저장소 */
export const mockStore: Map<string, Record<string, MockFn>>;

export interface TestLocation {
  file: string;
  line: number;
}

export interface TestCase {
  description: string;
  fn: () => Promise<void>;
  path: string;
  location?: TestLocation;
  mode: TestMode;
}

export interface Reporter {
  onRunStart?(totalCount: number, matchedCount: number, testNamePattern?: string): void;
  onFileStart?(file: string): void;
  onTestPass(test: TestCase): void;
  onTestFail(test: TestCase, error: unknown): void;
  onTestSkip?(test: TestCase): void;
  onTestTodo?(test: TestCase): void;
  onSuiteDone(passed: number, failed: number, skipped: number, todo: number): void;
  onNoTestsFound?(filePatterns: string[], testNamePattern?: string): void;
  onRunDone?(totalPassed: number, totalFailed: number, totalSkipped: number, totalTodo: number): void;
  onRunError?(error: unknown): void;
}

export interface RunResult {
  passed: number;
  failed: number;
  skipped: number;
  todo: number;
}

export interface TestManager {
  test(description: string, fn: TestFn): void;
  testEach: Test['each'];
  testOnly(description: string, fn: TestFn): void;
  testSkip(description: string, fn: TestFn): void;
  testTodo(description: string): void;
  describe(suiteName: string, fn: () => void): void;
  describeOnly(suiteName: string, fn: () => void): void;
  describeSkip(suiteName: string, fn: () => void): void;
  beforeEach(fn: TestFn): void;
  getTests(): TestCase[];
  clearTests(): void;
  getMatchingTests(testNamePattern?: string, testLocation?: TestLocation): TestCase[];
  run(reporter?: Reporter, testNamePattern?: string, file?: string, testLocation?: TestLocation): Promise<RunResult>;
}

/**
 * @internal
 * CLI 러너 전용. 사용자에게 글로벌로 노출되지 않으며 직접 호출은 권장하지 않습니다.
 */
export const run: (
  reporter?: Reporter,
  testNamePattern?: string,
  file?: string,
  testLocation?: TestLocation
) => Promise<RunResult>;
