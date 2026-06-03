import {createJsonReporter} from '../../../src/cli/reporters/jsonReporter.js';

const captureLog = (runner) => {
  const spy = fn();
  const original = console.log;
  console.log = spy;
  try {
    runner(spy);
  } finally {
    console.log = original;
  }
};

const parseOutput = (spy) => {
  expect(spy).toHaveBeenCalledTimes(1);
  const [text] = spy.mock.calls[0];
  return JSON.parse(text);
};

test('[jsonReporter] 정상 흐름 — 두 파일 × 패스/실패 섞임 → 파일 단위 그룹핑된 JSON 1회 출력', () => {
  captureLog((spy) => {
    const reporter = createJsonReporter();
    reporter.onRunStart(2, 2, undefined);

    reporter.onFileStart('/abs/a.test.js');
    reporter.onTestPass({path: 'group', description: 'a1', location: {file: '/abs/a.test.js', line: 10}});
    reporter.onTestFail(
      {path: '', description: 'a2', location: {file: '/abs/a.test.js', line: 20}},
      new Error('boom'),
    );
    reporter.onSuiteDone(1, 1);

    reporter.onFileStart('/abs/b.test.js');
    reporter.onTestPass({path: 'g > sub', description: 'b1', location: {file: '/abs/b.test.js', line: 5}});
    reporter.onSuiteDone(1, 0);

    reporter.onRunDone(2, 1, 0, 0);

    const payload = parseOutput(spy);
    expect(payload.totals).toEqual({passed: 2, failed: 1, skipped: 0, todo: 0});
    expect(payload.files.length).toBe(2);

    expect(payload.files[0].path).toBe('/abs/a.test.js');
    expect(payload.files[0].passed).toBe(1);
    expect(payload.files[0].failed).toBe(1);
    expect(payload.files[0].tests.length).toBe(2);
    expect(payload.files[0].tests[0]).toEqual({
      path: 'group',
      description: 'a1',
      status: 'passed',
      location: {file: '/abs/a.test.js', line: 10},
    });
    expect(payload.files[0].tests[1]).toEqual({
      path: '',
      description: 'a2',
      status: 'failed',
      location: {file: '/abs/a.test.js', line: 20},
      error: {message: 'boom'},
    });

    expect(payload.files[1].path).toBe('/abs/b.test.js');
    expect(payload.files[1].passed).toBe(1);
    expect(payload.files[1].failed).toBe(0);
    expect(payload.files[1].tests[0]).toEqual({
      path: 'g > sub',
      description: 'b1',
      status: 'passed',
      location: {file: '/abs/b.test.js', line: 5},
    });
  });
});

test('[jsonReporter] 실패 entry 는 error.message 만 가지며 stack 키는 없음', () => {
  captureLog((spy) => {
    const reporter = createJsonReporter();
    reporter.onFileStart('/abs/a.test.js');
    const err = new Error('boom');
    err.stack = 'Error: boom\n    at ...';
    reporter.onTestFail({path: '', description: 't', location: {file: '/abs/a.test.js', line: 1}}, err);
    reporter.onSuiteDone(0, 1);
    reporter.onRunDone(0, 1);

    const payload = parseOutput(spy);
    const entry = payload.files[0].tests[0];
    expect(entry.error).toEqual({message: 'boom'});
    expect('stack' in entry.error).toBe(false);
  });
});

test('[jsonReporter] location 이 undefined 인 test 는 location 필드 생략', () => {
  captureLog((spy) => {
    const reporter = createJsonReporter();
    reporter.onFileStart('/abs/a.test.js');
    reporter.onTestPass({path: '', description: 'no-loc', location: undefined});
    reporter.onSuiteDone(1, 0);
    reporter.onRunDone(1, 0);

    const payload = parseOutput(spy);
    const entry = payload.files[0].tests[0];
    expect('location' in entry).toBe(false);
    expect(entry.status).toBe('passed');
  });
});

test('[jsonReporter] onNoTestsFound → payload 에 noTestsFound:true, files 빈 배열', () => {
  captureLog((spy) => {
    const reporter = createJsonReporter();
    reporter.onRunStart(3, 0, 'no-such');
    reporter.onNoTestsFound(['no-such'], 'no-such');
    reporter.onRunDone(0, 0, 0, 0);

    const payload = parseOutput(spy);
    expect(payload.totals).toEqual({passed: 0, failed: 0, skipped: 0, todo: 0});
    expect(payload.files).toEqual([]);
    expect(payload.noTestsFound).toBe(true);
  });
});

test('[jsonReporter] onRunError → payload 에 error.message 포함, 1회 flush', () => {
  captureLog((spy) => {
    const reporter = createJsonReporter();
    reporter.onRunError(new Error('setup blew up'));

    const payload = parseOutput(spy);
    expect(payload.totals).toEqual({passed: 0, failed: 0, skipped: 0, todo: 0});
    expect(payload.files).toEqual([]);
    expect(payload.error).toEqual({message: 'setup blew up'});
  });
});

test('[jsonReporter] onRunDone 호출 전에는 stdout 으로 아무 것도 안 씀', () => {
  captureLog((spy) => {
    const reporter = createJsonReporter();
    reporter.onRunStart(1, 1, undefined);
    reporter.onFileStart('/abs/a.test.js');
    reporter.onTestPass({path: '', description: 't', location: {file: '/abs/a.test.js', line: 1}});
    reporter.onSuiteDone(1, 0);
    expect(spy).not.toHaveBeenCalled();
  });
});

test('[jsonReporter] 두 인스턴스의 상태는 격리됨', () => {
  captureLog((spy) => {
    const r1 = createJsonReporter();
    const r2 = createJsonReporter();

    r1.onFileStart('/abs/a.test.js');
    r1.onTestPass({path: '', description: 'a', location: {file: '/abs/a.test.js', line: 1}});
    r1.onSuiteDone(1, 0);

    r2.onFileStart('/abs/b.test.js');
    r2.onTestPass({path: '', description: 'b', location: {file: '/abs/b.test.js', line: 1}});
    r2.onSuiteDone(1, 0);

    r1.onRunDone(1, 0);
    r2.onRunDone(1, 0);

    expect(spy).toHaveBeenCalledTimes(2);
    const first = JSON.parse(spy.mock.calls[0][0]);
    const second = JSON.parse(spy.mock.calls[1][0]);
    expect(first.files.length).toBe(1);
    expect(first.files[0].path).toBe('/abs/a.test.js');
    expect(second.files.length).toBe(1);
    expect(second.files[0].path).toBe('/abs/b.test.js');
  });
});
