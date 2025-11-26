import '@testing-library/jest-dom';
import './polyfills';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { SEARCH_API_URL, server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  vi.stubEnv('VITE_APP_AZURESEARCH_URL', SEARCH_API_URL);
  vi.stubEnv('VITE_APP_AZURESEARCH_KEY', 'test-api-key');
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

