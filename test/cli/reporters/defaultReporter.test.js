import {defaultReporter} from '../../../src/cli/reporters/defaultReporter.js';
import {silentReporter} from '../../../src/cli/reporters/silentReporter.js';

const withCapturedLog = (runner) => {
  const spy = fn();
  const original = console.log;
  console.log = spy;
  try {
    runner(spy);
  } finally {
    console.log = original;
  }
};

test('[defaultReporter] onRunStart — 파일 개수 출력', () => {
  withCapturedLog((spy) => {
    defaultReporter.onRunStart(3);
    expect(spy).toHaveBeenCalledTimes(1);
    const [msg] = spy.mock.calls[0];
    expect(msg).toContain('3');
    expect(msg).toContain('test file(s)');
  });
});

test('[defaultReporter] onFileStart — 파일 경로 출력', () => {
  withCapturedLog((spy) => {
    defaultReporter.onFileStart('/tmp/a.test.js');
    expect(spy).toHaveBeenCalledTimes(1);
    const [msg] = spy.mock.calls[0];
    expect(msg).toContain('/tmp/a.test.js');
  });
});

test('[defaultReporter] onTestPass — CHECK + path + description', () => {
  withCapturedLog((spy) => {
    defaultReporter.onTestPass({path: 'group', description: 'ok', fn: () => {}});
    const [msg] = spy.mock.calls[0];
    expect(msg).toContain('✓');
    expect(msg).toContain('group');
    expect(msg).toContain('ok');
  });
});

test('[defaultReporter] onTestFail — CROSS + error message', () => {
  withCapturedLog((spy) => {
    defaultReporter.onTestFail(
      {path: '', description: 'failed test'},
      new Error('bang'),
    );
    const [msg] = spy.mock.calls[0];
    expect(msg).toContain('✗');
    expect(msg).toContain('failed test');
    expect(msg).toContain('bang');
  });
});

test('[defaultReporter] onSuiteDone — Tests: n passed, n failed', () => {
  withCapturedLog((spy) => {
    defaultReporter.onSuiteDone(5, 2);
    const [msg] = spy.mock.calls[0];
    expect(msg).toContain('Tests:');
    expect(msg).toContain('5 passed');
    expect(msg).toContain('2 failed');
  });
});

test('[defaultReporter] onRunDone — Total Result', () => {
  withCapturedLog((spy) => {
    defaultReporter.onRunDone(10, 0);
    const [msg] = spy.mock.calls[0];
    expect(msg).toContain('Total Result:');
    expect(msg).toContain('10 passed');
  });
});

test('[defaultReporter] onRunError — Error 메시지 포함', () => {
  withCapturedLog((spy) => {
    defaultReporter.onRunError(new Error('boom'));
    const [msg] = spy.mock.calls[0];
    expect(msg).toContain('boom');
  });
});

test('[silentReporter] 모든 훅이 아무 것도 출력하지 않음', () => {
  withCapturedLog((spy) => {
    silentReporter.onRunStart(1);
    silentReporter.onFileStart('x');
    silentReporter.onTestPass({path: '', description: 't'});
    silentReporter.onTestFail({path: '', description: 't'}, new Error('e'));
    silentReporter.onSuiteDone(0, 0);
    silentReporter.onRunDone(0, 0);
    silentReporter.onRunError(new Error('e'));
    expect(spy).not.toHaveBeenCalled();
  });
});
