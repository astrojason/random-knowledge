import { OAuthProvider, signInWithCredential } from "@firebase/auth";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { auth } from "./firebase";

/** Returns null if the user cancelled the native Apple sign-in sheet. */
export async function signInWithApple() {
  // Firebase compares SHA-256(rawNonce) against the nonce Apple embedded in the token.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  let identityToken: string | null;
  try {
    ({ identityToken } = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    }));
  } catch (err) {
    if ((err as { code?: string }).code === "ERR_REQUEST_CANCELED") return null;
    throw err;
  }
  if (!identityToken) throw new Error("Apple sign-in did not return an identity token.");
  const credential = new OAuthProvider("apple.com").credential({ idToken: identityToken, rawNonce });
  await signInWithCredential(auth, credential);
  return null;
}
