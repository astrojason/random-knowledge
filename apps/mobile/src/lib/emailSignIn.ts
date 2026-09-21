import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth } from "./firebase";

/** Email/password sign-in, used only for the App Review demo account. */
export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}
