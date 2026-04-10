import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      'obsidian': path.resolve(__dirname, '__mocks__/obsidian.ts'),
      'main':     path.resolve(__dirname, 'src/main.ts'),
      'metadata': path.resolve(__dirname, 'src/metadata'),
      'task':     path.resolve(__dirname, 'src/task'),
      'ui':       path.resolve(__dirname, 'src/ui'),
      'settings': path.resolve(__dirname, 'src/settings.ts'),
    }
  }
});
