import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.mjs', format: 'es' },
      { file: 'dist/index.cjs', format: 'cjs' },
      { file: 'dist/backpass.umd.js', format: 'umd', name: 'Backpass' },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.json' })],
  },
];
