// Minimal react-native stub for Node unit tests: the modules under test
// only read Platform.OS (storage.ts / locale.ts take the Web branch,
// which is localStorage-backed and fully guarded).
export const Platform = { OS: 'web' as const };
