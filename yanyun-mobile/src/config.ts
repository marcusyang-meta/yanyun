import Constants from 'expo-constants';

// Backend URL: production by default; override with EXPO_PUBLIC_API_URL for local dev (e.g. http://127.0.0.1:8787).
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'https://yanyun.app';

// Mobile OAuth handoff callback (the backend allowlist matches this value exactly before deep-linking the JWT back to the app)
export const APP_AUTH_REDIRECT = 'yanyun://auth-callback';

// Locale is not hardcoded here: relay.ts takes locale.ts
// effectiveLocaleTag() per request (account-preference mirror ?? device
// language, same rule as Web).

// Block vocabulary version: the Block/Action object versions this app
// knows (the server uses it for FallbackBlock substitution; see backend
// BLOCK_TYPE_SINCE). Bump when a new vocabulary ships.
// v3: EditAction (edit grouping; only in the leader's detail tree).
// v4: CompleteAction / UncompleteAction (complete/restore grouping; leader's detail tree only).
export const BLOCKS_VERSION = 4;

