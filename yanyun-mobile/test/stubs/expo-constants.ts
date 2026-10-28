// expo-constants stub for Node unit tests: no app manifest, so
// config.ts falls back to its default API URL (fetch is stubbed in the
// tests themselves, so the URL is never actually requested).
export default {
  expoConfig: { extra: {} as Record<string, unknown> },
};
