import fs from 'fs';
import os from 'os';
import path from 'path';
import {findTestFiles} from '../../src/cli/utils/findFiles.js';

const createFixtureTree = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'js-te-findfiles-'));

  fs.writeFileSync(path.join(root, 'a.test.js'), '');
  fs.writeFileSync(path.join(root, 'regular.js'), '');

  fs.mkdirSync(path.join(root, 'nested'));
  fs.writeFileSync(path.join(root, 'nested/b.test.js'), '');
  fs.writeFileSync(path.join(root, 'nested/other.js'), '');

  fs.mkdirSync(path.join(root, 'test'));
  fs.writeFileSync(path.join(root, 'test/c.js'), '');

  fs.mkdirSync(path.join(root, 'test/fixtures'));
  fs.writeFileSync(path.join(root, 'test/fixtures/d.js'), '');

  fs.mkdirSync(path.join(root, 'node_modules'));
  fs.writeFileSync(path.join(root, 'node_modules/e.test.js'), '');

  return root;
};

const cleanup = (dir) => fs.rmSync(dir, {recursive: true, force: true});

test('[findTestFiles] .test.js 접미사 / test 디렉터리 내부 .js 수집', () => {
  const root = createFixtureTree();
  try {
    const result = new Set(findTestFiles(root));
    expect(result.has(path.join(root, 'a.test.js'))).toBe(true);
    expect(result.has(path.join(root, 'nested/b.test.js'))).toBe(true);
    expect(result.has(path.join(root, 'test/c.js'))).toBe(true);
  } finally {
    cleanup(root);
  }
});

test('[findTestFiles] node_modules 전체 제외', () => {
  const root = createFixtureTree();
  try {
    const result = new Set(findTestFiles(root));
    expect(result.has(path.join(root, 'node_modules/e.test.js'))).toBe(false);
  } finally {
    cleanup(root);
  }
});

test('[findTestFiles] .test.js 아닌 파일과 test 하위 비-test 폴더 제외', () => {
  const root = createFixtureTree();
  try {
    const result = new Set(findTestFiles(root));
    expect(result.has(path.join(root, 'regular.js'))).toBe(false);
    expect(result.has(path.join(root, 'nested/other.js'))).toBe(false);
    expect(result.has(path.join(root, 'test/fixtures/d.js'))).toBe(false);
  } finally {
    cleanup(root);
  }
});

test('[findTestFiles] 빈 디렉터리 → 빈 배열', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'js-te-findfiles-empty-'));
  try {
    expect(findTestFiles(root).length).toBe(0);
  } finally {
    cleanup(root);
  }
});
