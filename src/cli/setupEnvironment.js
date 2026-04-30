import path from 'path';
import fs from 'fs';
import {MODULE_TYPE} from "../constants/module.js";
import {PATH} from "../constants/paths.js";

const GLOBAL_EXPORTS = [
  'test',
  'describe',
  'beforeEach',
  'expect',
  'mock',
  'unmock',
  'isMocked',
  'clearAllMocks',
  'mockStore',
  'fn',
];

export const getUserModuleType = (cwd = process.cwd()) => {
  try {
    const pkgPath = path.join(cwd, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.type === MODULE_TYPE.MODULE ? MODULE_TYPE.ESM : MODULE_TYPE.CJS;
  } catch {
    return MODULE_TYPE.CJS;
  }
};

export const setupEnvironment = async () => {
  const moduleType = getUserModuleType();

  let jsTe;
  if (moduleType === MODULE_TYPE.ESM) {
    jsTe = await import(PATH.DANNYSIR_JS_TE);
  } else {
    const {createRequire} = await import(MODULE_TYPE.MODULE);
    const require = createRequire(import.meta.url);
    jsTe = require(PATH.DANNYSIR_JS_TE);
  }

  GLOBAL_EXPORTS.forEach(key => {
    if (jsTe[key] !== undefined) global[key] = jsTe[key];
  });

  return jsTe
};
