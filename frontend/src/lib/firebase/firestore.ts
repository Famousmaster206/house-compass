import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/config";
import type { CalculationResult } from "@/lib/services/calculator";

// Firestore structure:
//   users/{userId}/calculations/{id}
//   users/{userId}/favorites/{cityId}
//
// Security rule (see firestore.rules at project root):
//   Only the authenticated user matching {userId} may read/write documents
//   under users/{userId}/**. Every function below MUST be called with the
//   uid from the authenticated user's own auth context (AuthContext) —
//   never trust a client-passed arbitrary userId for someone else's data.

export interface SavedCalculation extends CalculationResult {
  id: string;
  savedAt?: unknown;
}

const NOT_CONFIGURED_ERROR = "Firestore isn't configured — sign in isn't available yet.";

export async function saveCalculation(
  userId: string,
  calculation: CalculationResult
): Promise<{ error: string | null }> {
  if (!isFirebaseConfigured() || !db) return { error: NOT_CONFIGURED_ERROR };
  try {
    const id = `${calculation.citySlug}-${Date.now()}`;
    const ref = doc(db, "users", userId, "calculations", id);
    await setDoc(ref, { ...calculation, id, savedAt: serverTimestamp() });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save calculation." };
  }
}

export async function getUserCalculations(
  userId: string
): Promise<{ calculations: SavedCalculation[]; error: string | null }> {
  if (!isFirebaseConfigured() || !db) return { calculations: [], error: NOT_CONFIGURED_ERROR };
  try {
    const ref = collection(db, "users", userId, "calculations");
    const q = query(ref, orderBy("savedAt", "desc"));
    const snapshot = await getDocs(q);
    const calculations = snapshot.docs.map((d) => d.data() as SavedCalculation);
    return { calculations, error: null };
  } catch (err) {
    return { calculations: [], error: err instanceof Error ? err.message : "Failed to load calculations." };
  }
}

export async function deleteCalculation(
  userId: string,
  calcId: string
): Promise<{ error: string | null }> {
  if (!isFirebaseConfigured() || !db) return { error: NOT_CONFIGURED_ERROR };
  try {
    await deleteDoc(doc(db, "users", userId, "calculations", calcId));
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete calculation." };
  }
}

export async function saveFavoriteCity(
  userId: string,
  citySlug: string
): Promise<{ error: string | null }> {
  if (!isFirebaseConfigured() || !db) return { error: NOT_CONFIGURED_ERROR };
  try {
    const ref = doc(db, "users", userId, "favorites", citySlug);
    const data: DocumentData = { citySlug, savedAt: serverTimestamp() };
    await setDoc(ref, data);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save favorite." };
  }
}

export async function getUserFavorites(
  userId: string
): Promise<{ favorites: string[]; error: string | null }> {
  if (!isFirebaseConfigured() || !db) return { favorites: [], error: NOT_CONFIGURED_ERROR };
  try {
    const ref = collection(db, "users", userId, "favorites");
    const snapshot = await getDocs(ref);
    const favorites = snapshot.docs.map((d) => d.id);
    return { favorites, error: null };
  } catch (err) {
    return { favorites: [], error: err instanceof Error ? err.message : "Failed to load favorites." };
  }
}
