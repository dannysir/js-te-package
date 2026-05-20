// Type definitions for @dannysir/js-te

export type TestFn = () => void | Promise<void>;

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
}

/** 테스트 케이스를 정의합니다. */
export const test: Test;

/** 테스트 그룹을 정의합니다. 중첩 가능합니다. */
export const describe: (suiteName: string, fn: () => void) => void;

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

export interface TestCase {
  description: string;
  fn: () => Promise<void>;
  path: string;
}

export interface Reporter {
  onTestPass(test: TestCase): void;
  onTestFail(test: TestCase, error: unknown): void;
  onSuiteDone(passed: number, failed: number): void;
  onFileStart?(file: string): void;
}

export interface RunResult {
  passed: number;
  failed: number;
}

export interface TestManager {
  test(description: string, fn: TestFn): void;
  testEach: Test['each'];
  describe(suiteName: string, fn: () => void): void;
  beforeEach(fn: TestFn): void;
  getTests(): TestCase[];
  clearTests(): void;
  getMatchingTests(testNamePattern?: string): TestCase[];
  run(reporter?: Reporter, testNamePattern?: string, file?: string): Promise<RunResult>;
}

/**
 * @internal
 * CLI 러너 전용. 사용자에게 글로벌로 노출되지 않으며 직접 호출은 권장하지 않습니다.
 */
export const run: (
  reporter?: Reporter,
  testNamePattern?: string,
  file?: string
) => Promise<RunResult>;
