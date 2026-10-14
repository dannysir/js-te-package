import {TestManager} from '../src/testManager.js';

const makeReporter = () => {
  const passes = [];
  const fails = [];
  const skipped = [];
  const todos = [];
  return {
    onTestPass: (t) => passes.push(t),
    onTestFail: (t) => fails.push(t),
    onTestSkip: (t) => skipped.push(t),
    onTestTodo: (t) => todos.push(t),
    onSuiteDone: () => {},
    passes,
    fails,
    skipped,
    todos,
  };
};

describe('[TestManager modes] test.only / test.skip / test.todo', () => {
  test('test.only 가 있는 파일은 normal 테스트가 skip 으로 강등된다', async () => {
    const tm = new TestManager();
    tm.test('normal a', () => {});
    tm.testOnly('focused', () => {});
    tm.test('normal b', () => {});

    const reporter = makeReporter();
    const result = await tm.run(reporter);

    expect(result).toEqual({passed: 1, failed: 0, skipped: 2, todo: 0});
    expect(reporter.passes[0].description).toBe('focused');
    expect(reporter.skipped.length).toBe(2);
  });

  test('test.skip 은 함수가 실행되지 않고 skipped 로 보고된다', async () => {
    const tm = new TestManager();
    let executed = false;
    tm.testSkip('not run', () => { executed = true; });

    const reporter = makeReporter();
    const result = await tm.run(reporter);

    expect(executed).toBe(false);
    expect(result.skipped).toBe(1);
    expect(reporter.skipped[0].description).toBe('not run');
  });

  test('test.todo 는 함수 없이 등록되고 todo 로 보고된다', async () => {
    const tm = new TestManager();
    tm.testTodo('write reset password test');

    const reporter = makeReporter();
    const result = await tm.run(reporter);

    expect(result).toEqual({passed: 0, failed: 0, skipped: 0, todo: 1});
    expect(reporter.todos[0].description).toBe('write reset password test');
  });

  test('test.todo 에 함수 인자가 들어오면 에러를 던진다', () => {
    const tm = new TestManager();
    expect(() => tm.testTodo('bad', () => {})).toThrow('test.todo()');
  });
});

describe('[TestManager modes] describe.only / describe.skip', () => {
  test('describe.only 안의 모든 테스트는 only 로 인식되고 외부 normal 은 skip 으로 강등된다', async () => {
    const tm = new TestManager();
    tm.test('outside normal', () => {});
    tm.describeOnly('focused suite', () => {
      tm.test('a', () => {});
      tm.test('b', () => {});
    });

    const result = await tm.run(makeReporter());

    expect(result.passed).toBe(2);
    expect(result.skipped).toBe(1);
  });

  test('describe.skip 안의 모든 테스트는 skip 으로 보고된다', async () => {
    const tm = new TestManager();
    tm.describeSkip('disabled suite', () => {
      tm.test('a', () => {});
      tm.test('b', () => {});
    });

    const result = await tm.run(makeReporter());

    expect(result.skipped).toBe(2);
    expect(result.passed).toBe(0);
  });

  test('describe.only 안의 test.skip 은 skip 이 우선한다', async () => {
    const tm = new TestManager();
    tm.describeOnly('focused suite', () => {
      tm.test('runs', () => {});
      tm.testSkip('explicitly skipped', () => {});
    });

    const result = await tm.run(makeReporter());

    expect(result.passed).toBe(1);
    expect(result.skipped).toBe(1);
  });

  test('describe.skip 안의 test.only 는 only 가 우선하고 외부 normal 도 skip 으로 강등된다', async () => {
    const tm = new TestManager();
    tm.test('outside normal', () => {});
    tm.describeSkip('disabled suite', () => {
      tm.testOnly('forced run', () => {});
      tm.test('still skipped', () => {});
    });

    const result = await tm.run(makeReporter());

    expect(result.passed).toBe(1);
    expect(result.skipped).toBe(2);
  });

  test('중첩 describe 에서 가장 가까운 명시적 modifier 가 우선한다', async () => {
    const tm = new TestManager();
    tm.describeSkip('outer skip', () => {
      tm.describeOnly('inner only', () => {
        tm.test('runs', () => {});
      });
      tm.test('outer skipped', () => {});
    });

    const result = await tm.run(makeReporter());

    expect(result.passed).toBe(1);
    expect(result.skipped).toBe(1);
  });
});

describe('[TestManager modes] testEach + modifier', () => {
  test('testEach(cases, "only") 는 케이스 전체를 only 로 등록하고 같은 파일 normal 은 skip 강등된다', async () => {
    const tm = new TestManager();
    tm.test('normal outside', () => {});
    tm.testEach([[1, 1], [2, 2]], 'only')('case %s == %s', (a, b) => {
      expect(a).toBe(b);
    });

    const result = await tm.run(makeReporter());

    expect(result.passed).toBe(2);
    expect(result.skipped).toBe(1);
  });

  test('testEach(cases, "skip") 는 케이스 함수를 실행하지 않고 skip 으로 보고한다', async () => {
    const tm = new TestManager();
    let runs = 0;
    tm.testEach([[1], [2], [3]], 'skip')('case %s', () => { runs++; });

    const reporter = makeReporter();
    const result = await tm.run(reporter);

    expect(runs).toBe(0);
    expect(result.skipped).toBe(3);
    expect(reporter.skipped.length).toBe(3);
  });

  test('testEach(cases) 는 mode 없이 normal 로 등록된다 (회귀 방지)', async () => {
    const tm = new TestManager();
    tm.testEach([[1, 1], [2, 2]])('case %s == %s', (a, b) => {
      expect(a).toBe(b);
    });

    const result = await tm.run(makeReporter());

    expect(result).toEqual({passed: 2, failed: 0, skipped: 0, todo: 0});
  });
});

describe('[TestManager modes] describeEach + modifier', () => {
  test('describeEach(cases) 는 케이스마다 포맷된 이름의 그룹을 만들고 인자를 전달한다', async () => {
    const tm = new TestManager();
    tm.describeEach([[1, 2, 3], [2, 3, 5]])('add(%s, %s)', (a, b, expected) => {
      tm.test(`returns ${expected}`, () => {
        expect(a + b).toBe(expected);
      });
    });

    const tests = tm.getTests();
    expect(tests.map(t => t.path)).toEqual(['add(1, 2)', 'add(2, 3)']);
    expect(tests.map(t => t.description)).toEqual(['returns 3', 'returns 5']);

    const result = await tm.run(makeReporter());
    expect(result).toEqual({passed: 2, failed: 0, skipped: 0, todo: 0});
  });

  test('describeEach 는 배열이 아닌 케이스를 단일 인자로 전달하고 바깥 describe 경로를 유지한다', () => {
    const tm = new TestManager();
    tm.describe('outer', () => {
      tm.describeEach([{name: 'kim'}])('user %o', (user) => {
        tm.test(user.name, () => {});
      });
    });

    const [only] = tm.getTests();
    expect(only.path).toBe('outer > user {"name":"kim"}');
    expect(only.description).toBe('kim');
  });

  test('describeEach(cases, "only") 는 생성된 그룹 전체를 only 로 등록하고 같은 파일 normal 은 skip 강등된다', async () => {
    const tm = new TestManager();
    tm.test('normal outside', () => {});
    tm.describeEach([[1], [2]], 'only')('group %s', (n) => {
      tm.test('runs', () => {
        expect(typeof n).toBe('number');
      });
    });

    const result = await tm.run(makeReporter());

    expect(result.passed).toBe(2);
    expect(result.skipped).toBe(1);
  });

  test('describeEach(cases, "skip") 는 그룹 안의 테스트를 실행하지 않고 skip 으로 보고한다', async () => {
    const tm = new TestManager();
    let runs = 0;
    tm.describeEach([[1], [2]], 'skip')('group %s', () => {
      tm.test('a', () => { runs++; });
      tm.test('b', () => { runs++; });
    });

    const reporter = makeReporter();
    const result = await tm.run(reporter);

    expect(runs).toBe(0);
    expect(result.skipped).toBe(4);
    expect(reporter.skipped.length).toBe(4);
  });

  test('describeEach(cases, "skip") 안의 test.only 는 only 가 우선한다', async () => {
    const tm = new TestManager();
    tm.describeEach([[1]], 'skip')('group %s', () => {
      tm.testOnly('focused', () => {});
      tm.test('skipped', () => {});
    });

    const result = await tm.run(makeReporter());

    expect(result.passed).toBe(1);
    expect(result.skipped).toBe(1);
  });

  test('describeEach 그룹 안의 beforeEach 는 해당 그룹에만 적용된다', async () => {
    const tm = new TestManager();
    const seen = [];
    tm.describeEach([['a'], ['b']])('group %s', (label) => {
      let current;
      tm.beforeEach(() => { current = label; });
      tm.test('reads hook value', () => { seen.push(current); });
    });
    tm.test('outside', () => { seen.push('outside'); });

    await tm.run(makeReporter());

    expect(seen).toEqual(['a', 'b', 'outside']);
  });
});
