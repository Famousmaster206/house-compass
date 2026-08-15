import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const PLACEHOLDER_MARKERS = ["your-", "placeholder", "changeme", ""];

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => marker !== "" && lower.includes(marker)) || lower === "";
}

const configured =
  !looksLikePlaceholder(firebaseConfig.apiKey) &&
  !looksLikePlaceholder(firebaseConfig.authDomain) &&
  !looksLikePlaceholder(firebaseConfig.projectId) &&
  !looksLikePlaceholder(firebaseConfig.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let warned = false;

function warnOnce() {
  if (!warned) {
    warned = true;
    console.warn(
      "[AZ Living] Firebase is not configured (missing or placeholder NEXT_PUBLIC_FIREBASE_* env vars). " +
        "Auth and Firestore features will be disabled until real credentials are provided in .env.local."
    );
  }
}

if (configured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("[AZ Living] Firebase failed to initialize:", err);
    app = null;
    auth = null;
    db = null;
  }
} else {
  warnOnce();
}

export function isFirebaseConfigured(): boolean {
  return configured && app !== null;
}

export { app, auth, db };
