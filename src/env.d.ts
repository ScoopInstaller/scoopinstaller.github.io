/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_AZURESEARCH_URL: string;
  readonly VITE_APP_AZURESEARCH_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
