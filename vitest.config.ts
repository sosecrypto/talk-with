import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      include: [
        'src/lib/**/*.ts',
        'src/hooks/**/*.ts',
        'src/app/api/**/*.ts',
      ],
      exclude: [
        'src/lib/prisma.ts',
        'src/lib/auth.ts',
        'src/lib/supabase.ts',
        'src/app/api/auth/**',
        'src/app/api/upload/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    projects: [
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/__tests__/lib/**/*.test.ts', 'src/__tests__/api/**/*.test.ts'],
          setupFiles: ['src/__tests__/setup/server-setup.ts'],
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, './src') },
        },
      },
      {
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['src/__tests__/hooks/**/*.test.ts', 'src/__tests__/components/**/*.test.tsx'],
          setupFiles: ['src/__tests__/setup/client-setup.ts'],
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, './src') },
        },
      },
    ],
  },
})
