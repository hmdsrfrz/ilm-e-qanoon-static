// src/store/configStore.ts
export const config = {
  app: {
    name:     import.meta.env.VITE_APP_NAME    ?? 'CONSTITUTION',
    tagline:  import.meta.env.VITE_APP_TAGLINE ?? '// archive terminal',
    version:  import.meta.env.VITE_APP_VERSION ?? '3.0.0',
    userName: import.meta.env.VITE_USER_NAME   ?? 'ARCHIVIST',
  },
  api: {
    url:       import.meta.env.VITE_API_URL         ?? 'http://localhost:8000',
    timeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000,
  },
  features: {
    voiceInput:     import.meta.env.VITE_FEATURE_VOICE_INPUT    === 'true',
    fileUpload:     import.meta.env.VITE_FEATURE_FILE_UPLOAD     === 'true',
    sessionHistory: import.meta.env.VITE_FEATURE_SESSION_HISTORY !== 'false',
    bootSequence:   import.meta.env.VITE_FEATURE_BOOT_SEQUENCE   !== 'false',
    markdownRender: import.meta.env.VITE_FEATURE_MARKDOWN_RENDER !== 'false',
    streaming:      import.meta.env.VITE_FEATURE_STREAMING        === 'true',
  },
  ui: {
    quickActionsEnabled: import.meta.env.VITE_QUICK_ACTIONS_ENABLED !== 'false',
    maxMessageLength:    Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH) || 4000,
    MAX_SESSION_MESSAGES:Number(import.meta.env.VITE_MAX_SESSION_MESSAGES) || 100,
  },
} as const;
