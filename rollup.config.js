import path from 'node:path';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// 브라우저 빌드 전용: testManager 가 끌어오는 ./fileUrlToPath.js (node:url 재export) 를
// node:url 없는 identity stub 으로 치환해 브라우저 번들에 Node 빌트인이 섞이지 않게 한다.
const aliasBrowserFileUrl = () => ({
  name: 'alias-browser-fileurl',
  resolveId(source, importer) {
    if (importer && source === './fileUrlToPath.js') {
      return path.resolve(path.dirname(importer), 'fileUrlToPath.browser.js');
    }
    return null;
  },
});

export default [
  {
    input: 'index.js',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true
    },
    external: [
      '@babel/core',
      '@babel/generator',
      '@babel/parser',
      '@babel/traverse',
      'fs',
      'path'
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'index.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external: [
      '@babel/core',
      '@babel/generator',
      '@babel/parser',
      '@babel/traverse',
      'fs',
      'path'
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'browser.js',
    output: {
      file: 'dist/browser.mjs',
      format: 'esm',
      sourcemap: true
    },
    external: [],
    plugins: [
      aliasBrowserFileUrl(),
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'browser-node-stub.js',
    output: {
      file: 'dist/browser-node-stub.mjs',
      format: 'esm',
      sourcemap: true
    },
    external: [],
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
];
