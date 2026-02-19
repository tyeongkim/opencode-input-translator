import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './src/index.ts',
  platform: 'node',
  outDir: './dist',
  target: 'ESNext',
  dts: true,
  sourcemap: true,
  exports: true,
});
