import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  revokeAccessToken,
  type User,
} from "@firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "./firebase";
import { requestAppleCredential } from "./appleSignIn";
import { requestGoogleCredential } from "./googleSignIn";
import { deleteAccountData } from "./firestore";

/** Email/password accounts (the App Review demo account) must type their password again to delete. */
export function needsPasswordToDelete(user: User): boolean {
  return user.providerData.some((p) => p.providerId === "password");
}

/**
 * Permanently deletes the account and everything stored about it. Firebase only lets a recent
 * sign-in delete a user, so this re-authenticates first (before touching any data, so a cancel or a
 * wrong password leaves everything intact), then revokes the Apple grant, deletes the data and
 * finally the auth user. Returns false if the user cancelled the Apple/Google sheet.
 */
export async function deleteAccount(user: User, password?: string): Promise<boolean> {
  const providerId = user.providerData[0]?.providerId;
  let appleAuthorizationCode: string | null = null;

  if (providerId === "apple.com") {
    const result = await requestAppleCredential();
    if (!result) return false;
    await reauthenticateWithCredential(user, result.credential);
    appleAuthorizationCode = result.authorizationCode;
  } else if (providerId === "google.com") {
    const credential = await requestGoogleCredential();
    if (!credential) return false;
    await reauthenticateWithCredential(user, credential);
  } else if (providerId === "password") {
    if (!user.email || !password) throw new Error("Enter your password to delete your account.");
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } else {
    throw new Error(`Deleting accounts signed in with "${providerId}" isn't supported.`);
  }

  if (appleAuthorizationCode) await revokeAccessToken(auth, appleAuthorizationCode);
  await deleteAccountData(user.uid);
  await deleteUser(user);
  await GoogleSignin.signOut().catch((err) => console.warn("Google sign-out after account deletion failed", err));
  return true;
}
