import { browser } from "$app/environment";
import {
	createUserWithEmailAndPassword,
	inMemoryPersistence,
	setPersistence,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
} from "firebase/auth";
import { writable } from "svelte/store";

import { ApiError, createSession, destroySession, getSession, type SessionUser } from "$lib/api/smart-journal";
import { getFirebaseAuth, isFirebaseConfigured } from "$lib/firebase/client";

type AuthSession = {
	user: SessionUser | null;
	loading: boolean;
	configured: boolean;
	error: string;
};

export const authSession = writable<AuthSession>({
	user: null,
	loading: browser,
	configured: isFirebaseConfigured(),
	error: "",
});

function toAuthMessage(error: unknown) {
	const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

	if (code.includes("auth/invalid-credential")) return "Email atau password salah.";
	if (code.includes("auth/email-already-in-use")) return "Email sudah terdaftar.";
	if (code.includes("auth/weak-password")) return "Password minimal 6 karakter.";
	if (code.includes("auth/too-many-requests")) return "Terlalu banyak percobaan. Coba lagi nanti.";

	return error instanceof Error ? error.message : "Terjadi kesalahan autentikasi.";
}

function setUser(user: SessionUser | null) {
	authSession.set({
		user,
		loading: false,
		configured: isFirebaseConfigured(),
		error: "",
	});
}

async function signOutFirebaseClient() {
	try {
		await signOut(getFirebaseAuth());
	} catch {
		// The client Firebase session is best-effort cleanup after the cookie exchange.
	}
}

export async function refreshSession() {
	try {
		const session = await getSession();
		setUser(session.user);
		return session.user;
	} catch (error) {
		const isUnauthorized = error instanceof ApiError && error.status === 401;
		authSession.set({
			user: null,
			loading: false,
			configured: isFirebaseConfigured(),
			error: isUnauthorized ? "" : error instanceof Error ? error.message : "Gagal mengambil session.",
		});
		return null;
	}
}

export function startAuthListener() {
	if (!browser) return;
	refreshSession();
}

export async function loginWithEmail(email: string, password: string) {
	try {
		const auth = getFirebaseAuth();
		await setPersistence(auth, inMemoryPersistence);
		const credential = await signInWithEmailAndPassword(auth, email, password);
		const idToken = await credential.user.getIdToken(true);
		const session = await createSession(idToken);

		await signOutFirebaseClient();
		setUser(session.user);
		return session.user;
	} catch (error) {
		await signOutFirebaseClient();
		throw new Error(toAuthMessage(error));
	}
}

export async function registerWithEmail({
	name,
	email,
	password,
}: {
	name: string;
	email: string;
	password: string;
}) {
	try {
		const auth = getFirebaseAuth();
		await setPersistence(auth, inMemoryPersistence);
		const credential = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(credential.user, { displayName: name });

		const idToken = await credential.user.getIdToken(true);
		const session = await createSession(idToken);

		await signOutFirebaseClient();
		setUser(session.user);
		return session.user;
	} catch (error) {
		await signOutFirebaseClient();
		throw new Error(toAuthMessage(error));
	}
}

export async function reloadCurrentUser() {
	return refreshSession();
}

export async function logout() {
	await destroySession().catch(() => null);
	await signOutFirebaseClient();
	setUser(null);
}
