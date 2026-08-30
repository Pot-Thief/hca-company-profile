import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    restoreMocks: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // layout.tsx is named explicitly rather than including all of src/app:
      // page.tsx is an async Server Component that Vitest cannot render, so a
      // blanket include would force the threshold to fail on code no unit test
      // can reach. generateMetadata is a plain async function and its one
      // branch is reachable, so there is no reason it sat outside the gate.
      include: ['src/lib/**', 'src/components/**', 'src/app/layout.tsx'],
      reporter: ['text', 'json-summary'],
      // The project has been at 100% since the first task, but until now that
      // was a number someone read off a table rather than a condition anything
      // checked. Printing a figure is not enforcing it: coverage could have
      // fallen at any point and every gate would still have exited 0.
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});
