import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
];
