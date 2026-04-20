import {transformSync} from '@babel/core';
import {createHash} from 'node:crypto';
import {babelTransform} from '../../babelPlugins/babelTransform.js';

const cache = new Map();

const getSourceHash = (code) => createHash('sha1').update(code).digest('hex');

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

  const sourceHash = getSourceHash(code);
  const cached = cache.get(filename);
  if (cached && cached.sourceHash === sourceHash) return cached.transformed;

  const {code: transformed} = transformSync(code, {
    filename,
    plugins: [babelTransform(mockedPaths)],
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: ['dynamicImport'],
    },
  });

  cache.set(filename, {sourceHash, transformed});
  return transformed;
};
