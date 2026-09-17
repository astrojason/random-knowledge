import { GoogleAuthProvider, signInWithCredential } from "@firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "./firebase";

// CLIENT_ID from GoogleService-Info.plist (apps/mobile's Firebase iOS app
// registration) — the OAuth client Google issues for this bundle ID.
GoogleSignin.configure({
  iosClientId: "900940305507-h1o4f8g3befas29pm68s6ed0eea1erre.apps.googleusercontent.com",
});

/** Returns null if the user cancelled the native Google sign-in sheet. */
export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false }).catch(() => undefined);
  const response = await GoogleSignin.signIn();
  if (response.type !== "success") return null;
  const { idToken } = response.data;
  if (!idToken) throw new Error("Google sign-in did not return an ID token.");
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
  return null;
}
