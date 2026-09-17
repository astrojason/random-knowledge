// @firebase/auth's package.json "exports" map puts an unconditional "types"
// entry (auth-public.d.ts) ahead of its "react-native" condition, so
// TypeScript always resolves types from the generic build and never sees
// the React Native-only APIs — even though Metro's bundler resolution (which
// does honor the "react-native" condition) picks the real implementation at
// runtime. This augmentation just restores the types for what's genuinely
// there. See node_modules/@firebase/auth/dist/rn/src/platform_react_native/persistence/react_native.d.ts.
export {};

declare module "@firebase/auth" {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
