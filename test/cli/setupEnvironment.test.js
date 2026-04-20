import fs from 'fs';
import os from 'os';
import path from 'path';
import {getUserModuleType} from '../../src/cli/setupEnvironment.js';
import {MODULE_TYPE} from '../../src/constants/module.js';

const makeFixture = (pkgContent) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'js-te-env-'));
  if (pkgContent !== null) {
    fs.writeFileSync(path.join(dir, 'package.json'), pkgContent);
  }
  return dir;
};

const cleanup = (dir) => fs.rmSync(dir, {recursive: true, force: true});

test('[getUserModuleType] type: "module" → ESM', () => {
  const dir = makeFixture('{"type": "module"}');
  try {
    expect(getUserModuleType(dir)).toBe(MODULE_TYPE.ESM);
  } finally {
    cleanup(dir);
  }
});

test('[getUserModuleType] type: "commonjs" → CJS', () => {
  const dir = makeFixture('{"type": "commonjs"}');
  try {
    expect(getUserModuleType(dir)).toBe(MODULE_TYPE.CJS);
  } finally {
    cleanup(dir);
  }
});

test('[getUserModuleType] type 필드 없음 → CJS', () => {
  const dir = makeFixture('{}');
  try {
    expect(getUserModuleType(dir)).toBe(MODULE_TYPE.CJS);
  } finally {
    cleanup(dir);
  }
});

test('[getUserModuleType] package.json 없음 → CJS (fallback)', () => {
  const dir = makeFixture(null);
  try {
    expect(getUserModuleType(dir)).toBe(MODULE_TYPE.CJS);
  } finally {
    cleanup(dir);
  }
});

test('[getUserModuleType] 존재하지 않는 디렉터리 → CJS (fallback)', () => {
  expect(getUserModuleType('/tmp/__js-te-nonexistent-dir__')).toBe(MODULE_TYPE.CJS);
});
