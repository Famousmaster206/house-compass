import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";

export const NOT_CONFIGURED_MESSAGE =
  "Sign in is not available yet; authentication hasn't been configured for this deployment.";

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!isFirebaseConfigured() || !auth) {
    return { user: null, error: NOT_CONFIGURED_MESSAGE };
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { user: cred.user, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : "Sign up failed." };
  }
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  if (!isFirebaseConfigured() || !auth) {
    return { user: null, error: NOT_CONFIGURED_MESSAGE };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : "Log in failed." };
  }
}

export async function logOut(): Promise<{ error: string | null }> {
  if (!isFirebaseConfigured() || !auth) {
    return { error: NOT_CONFIGURED_MESSAGE };
  }
  try {
    await signOut(auth);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Log out failed." };
  }
}

/**
 * Subscribes to auth state changes. Returns an unsubscribe function.
 * If Firebase isn't configured, immediately calls back with `null` user.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured() || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
