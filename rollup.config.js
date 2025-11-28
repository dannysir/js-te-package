import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'index.js',
    output: {
      file: 'dist/index.esm.js',
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
      file: 'dist/index.cjs.js',
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
    input: 'src/mock/store.js',
    output: {
      file: 'dist/mock/store.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'src/mock/store.js',
    output: {
      file: 'dist/mock/store.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }
];