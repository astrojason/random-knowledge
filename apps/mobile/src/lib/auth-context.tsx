import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "@firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthClaims } from "@random-knowledge/shared/auth-guard";
import { auth } from "./firebase";
import { signInWithApple } from "./appleSignIn";
import { signInWithEmail } from "./emailSignIn";
import { signInWithGoogle } from "./googleSignIn";

interface AuthContextValue {
  user: User | null;
  claims: AuthClaims | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInApple: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<AuthClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (u) => {
        setUser(u);
        try {
          setClaims(u ? ((await u.getIdTokenResult()).claims as AuthClaims) : null);
        } catch (err) {
          console.error("Failed to read ID token claims", err);
          setClaims(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const runSignIn = async (flow: () => Promise<unknown>) => {
    setError(null);
    try {
      await flow();
    } catch (err) {
      console.error("Sign-in failed", err);
      setError(err instanceof Error ? err.message : "Sign-in failed");
    }
  };

  const signIn = () => runSignIn(signInWithGoogle);
  const signInApple = () => runSignIn(signInWithApple);
  const signInEmail = (email: string, password: string) => runSignIn(() => signInWithEmail(email, password));

  const signOut = async () => {
    setError(null);
    try {
      await GoogleSignin.signOut().catch(() => undefined);
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, claims, loading, error, signIn, signInApple, signInEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
