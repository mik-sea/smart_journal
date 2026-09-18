import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured() {
	return Boolean(
		env.PUBLIC_FIREBASE_API_KEY &&
			env.PUBLIC_FIREBASE_AUTH_DOMAIN &&
			env.PUBLIC_FIREBASE_PROJECT_ID &&
			env.PUBLIC_FIREBASE_APP_ID,
	);
}

export function getFirebaseApp() {
	if (!browser) {
		throw new Error("Firebase hanya tersedia di browser.");
	}

	if (!isFirebaseConfigured()) {
		throw new Error("Konfigurasi Firebase belum lengkap.");
	}

	if (!app) {
		app =
			getApps()[0] ??
			initializeApp({
				apiKey: env.PUBLIC_FIREBASE_API_KEY,
				authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
				projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
				appId: env.PUBLIC_FIREBASE_APP_ID,
				messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
				storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
			});
	}

	return app;
}

export function getFirebaseAuth() {
	if (!auth) {
		auth = getAuth(getFirebaseApp());
	}

	return auth;
}
