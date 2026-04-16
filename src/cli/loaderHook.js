import {registerHooks} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {transformSource} from './utils/transformSource.js';
import {PATH} from '../constants/index.js';

const NODE_MODULES_SEGMENT = `${path.sep}${PATH.NODE_MODULES}${path.sep}`;
const FILE_PROTOCOL = 'file://';

const shouldTransform = (url, mockedPaths) => {
  if (mockedPaths.size === 0) return false;
  if (!url.startsWith(FILE_PROTOCOL)) return false;

  const filename = fileURLToPath(url);
  if (filename.includes(NODE_MODULES_SEGMENT)) return false;

  return filename.endsWith('.js') || filename.endsWith('.mjs');
};

/**
 * mockedPaths를 closure로 캡처해 Node 모듈 로더 훅을 설치합니다.
 * 훅 설치 이후 발생하는 모든 import/require가 메모리에서 babel 변환을 거칩니다.
 * @param {Set<string>} mockedPaths - 변환 대상 판단용 mock 경로 집합
 * @returns {{ deregister: () => void }} 훅 해제 객체
 */
export const installLoaderHook = (mockedPaths) => {
  return registerHooks({
    load(url, context, nextLoad) {
      const result = nextLoad(url, context);

      if (!shouldTransform(url, mockedPaths)) return result;

      const originalSource = typeof result.source === 'string'
        ? result.source
        : Buffer.from(result.source).toString('utf-8');

      const filename = fileURLToPath(url);
      const transformed = transformSource(originalSource, filename, mockedPaths);

      return {
        ...result,
        source: transformed,
        shortCircuit: true,
      };
    },
  });
};
