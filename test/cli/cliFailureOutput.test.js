import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawnSync} from 'child_process';

const CLI_PATH = path.resolve(import.meta.dirname, '../../bin/cli.js');
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

const FAILING_TESTS = `
test('[ERROR - toBe] - string', () => {
  expect('hello').toBe('helle');
});

test('[ERROR - throw Error] - in test logic', () => {
  const tmp = () => {
    throw new Error('INNER ERROR');
  };
  tmp();
  expect(1).toBe('ERROR');
});
`;

const PASSING_TESTS = `
test('passes', () => {
  expect(1 + 1).toBe(2);
});
`;

const createFixtureProject = (testSource) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'js-te-cli-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({type: 'module'}));
  fs.writeFileSync(path.join(root, 'sample.test.js'), testSource);
  return root;
};

const cleanup = (dir) => fs.rmSync(dir, {recursive: true, force: true});

const runCli = (cwd) => {
  const result = spawnSync(process.execPath, [CLI_PATH], {cwd, encoding: 'utf-8'});
  return {status: result.status, stdout: result.stdout.replace(ANSI_PATTERN, '')};
};

test('[cli] 실패한 테스트는 ✗ + 에러 메시지로 출력되고 exit code 1 로 종료된다', () => {
  const root = createFixtureProject(FAILING_TESTS);
  try {
    const {status, stdout} = runCli(root);

    expect(status).toBe(1);
    expect(stdout).toContain('✗ [ERROR - toBe] - string');
    expect(stdout).toContain('Expected "helle" but got "hello"');
    expect(stdout).toContain('✗ [ERROR - throw Error] - in test logic');
    expect(stdout).toContain('INNER ERROR');
    expect(stdout).toContain('2 failed');
  } finally {
    cleanup(root);
  }
});

test('[cli] 모든 테스트가 통과하면 exit code 0 으로 종료된다', () => {
  const root = createFixtureProject(PASSING_TESTS);
  try {
    const {status, stdout} = runCli(root);

    expect(status).toBe(0);
    expect(stdout).toContain('✓ passes');
  } finally {
    cleanup(root);
  }
});
