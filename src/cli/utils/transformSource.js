import {transformSync} from '@babel/core';
import {babelTransform} from '../../babelPlugins/babelTransform.js';

const cache = new Map();

const hashCode = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
};

/**
 * 주어진 소스 코드에 babel 변환을 적용해 변환된 코드를 반환합니다.
 * 디스크 I/O 없이 메모리에서만 동작합니다.
 * @param {string} code - 원본 소스 코드
 * @param {string} filename - babel plugin에 전달할 파일 경로
 * @param {Set<string>} mockedPaths - 변환 대상 판단용 mock 경로 집합
 * @returns {string} 변환된 코드 (mockedPaths가 비어 있으면 원본 그대로)
 */
export const transformSource = (code, filename, mockedPaths) => {
  if (mockedPaths.size === 0) return code;

  const cacheKey = `${filename}:${code.length}:${hashCode(code)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const {code: transformed} = transformSync(code, {
    filename,
    plugins: [babelTransform(mockedPaths)],
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: ['dynamicImport'],
    },
  });

  cache.set(cacheKey, transformed);
  return transformed;
};
