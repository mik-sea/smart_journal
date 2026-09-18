import { env } from "$env/dynamic/public";
import { DEFAULT_TIMEZONE, localDateTimeToRfc3339WithTimeZoneOffset, normalizeTimeZone } from "$lib/timezone";

export type Note = {
	id: string;
	raw_text: string;
	title: string;
	created_at: string;
	updated_at: string;
};

export type FinancialData = {
	amount: number;
	category: string;
};

export type ReminderData = {
	remind_at: string;
	message: string;
};

export type Transaction = {
	id: string;
	note_id?: string;
	type: "income" | "expense";
	amount: number;
	category: string;
	created_at: string;
	updated_at: string;
};

export type Reminder = {
	id: string;
	user_id: string;
	note_id?: string;
	remind_at: string;
	message: string;
	status: "pending" | "sent";
	created_at: string;
	updated_at: string;
};

export type Profile = {
	user_id: string;
	email: string;
	email_verified_at?: string;
	name: string;
	avatar_url: string;
	bio: string;
	timezone: string;
	created_at: string;
	updated_at: string;
};

export type JournalResponse = {
	note: Note;
	ai_result: {
		intents: string[];
		title: string;
		financial_data?: FinancialData;
		reminder_data?: ReminderData;
	};
	transactions: Transaction[];
	reminders: Reminder[];
};

export type SessionUser = {
	uid: string;
	email: string;
	email_verified: boolean;
};

export type AuthSessionResponse = {
	authenticated: boolean;
	csrf_token: string;
	user: SessionUser;
};

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

function apiBaseUrl() {
	return (env.PUBLIC_SMART_JOURNAL_API_URL || env.PUBLIC_API_BASE_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
}

function csrfToken() {
	if (typeof document === "undefined") return "";

	return (
		document.cookie
			.split("; ")
			.find((cookie) => cookie.startsWith("smart_journal_csrf="))
			?.split("=")[1] ?? ""
	);
}

function isMutatingMethod(method?: string) {
	return Boolean(method && !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase()));
}

export async function parseResponse<T>(response: Response): Promise<T> {
	if (response.status === 204) return undefined as T;

	const text = await response.text();
	const data = text ? JSON.parse(text) : null;

	if (!response.ok) {
		throw new ApiError(data?.error ?? "Request backend gagal.", response.status);
	}

	return data as T;
}

async function apiFetch<T>(path: string, init: RequestInit = {}) {
	const headers = new Headers(init.headers);

	if (init.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const csrf = csrfToken();
	if (csrf && isMutatingMethod(init.method)) {
		headers.set("X-CSRF-Token", decodeURIComponent(csrf));
	}

	const response = await fetch(`${apiBaseUrl()}${path}`, {
		...init,
		credentials: "include",
		headers,
	});

	return parseResponse<T>(response);
}

export function createSession(idToken: string) {
	return apiFetch<AuthSessionResponse>("/api/auth/session", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${idToken}`,
		},
	});
}

export function getSession() {
	return apiFetch<AuthSessionResponse>("/api/auth/session");
}

export function destroySession() {
	return apiFetch<{ authenticated: false }>("/api/auth/session", {
		method: "DELETE",
	});
}

export function requestEmailVerification() {
	return apiFetch<{ sent: boolean }>("/api/auth/email-verification", {
		method: "POST",
	});
}

export function createProfile(input: {
	email: string;
	name: string;
	avatar_url?: string;
	bio?: string;
	timezone?: string;
}) {
	return apiFetch<Profile>("/api/profile", {
		method: "POST",
		body: JSON.stringify({
			email: input.email,
			name: input.name,
			avatar_url: input.avatar_url ?? "",
			bio: input.bio ?? "",
			timezone: normalizeTimeZone(input.timezone ?? DEFAULT_TIMEZONE),
		}),
	});
}

export function updateProfile(input: Partial<Pick<Profile, "name" | "avatar_url" | "bio" | "timezone">>) {
	return apiFetch<Profile>("/api/profile", {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

export function getProfile() {
	return apiFetch<Profile>("/api/profile");
}

export function createJournal(rawText: string) {
	return apiFetch<JournalResponse>("/api/journals", {
		method: "POST",
		body: JSON.stringify({ raw_text: rawText }),
	});
}

export async function getNotes(limit = 50) {
	const response = await apiFetch<{ notes?: Note[] | null }>(`/api/notes?limit=${limit}`);
	return { notes: Array.isArray(response?.notes) ? response.notes : [] };
}

export async function getTransactions(limit = 50) {
	const response = await apiFetch<{ transactions?: Transaction[] | null }>(`/api/transactions?limit=${limit}`);
	return { transactions: Array.isArray(response?.transactions) ? response.transactions : [] };
}

export async function getReminders(limit = 50) {
	const response = await apiFetch<{ reminders?: Reminder[] | null }>(`/api/reminders?limit=${limit}`);
	return { reminders: Array.isArray(response?.reminders) ? response.reminders : [] };
}

export function createReminder(input: {
	note_id?: string;
	remind_at: string;
	message: string;
	status?: Reminder["status"];
	timezone?: string;
}) {
	const timezone = normalizeTimeZone(input.timezone ?? DEFAULT_TIMEZONE);

	return apiFetch<Reminder>("/api/reminders", {
		method: "POST",
		body: JSON.stringify({
			note_id: input.note_id,
			remind_at: localDateTimeToRfc3339WithTimeZoneOffset(input.remind_at, timezone),
			message: input.message,
			status: input.status ?? "pending",
		}),
	});
}

export function updateReminder(
	reminderId: string,
	input: Partial<Pick<Reminder, "note_id" | "remind_at" | "message" | "status">> & { timezone?: string },
) {
	const timezone = normalizeTimeZone(input.timezone ?? DEFAULT_TIMEZONE);
	const body = {
		...input,
		remind_at: input.remind_at ? localDateTimeToRfc3339WithTimeZoneOffset(input.remind_at, timezone) : undefined,
		timezone: undefined,
	};

	return apiFetch<Reminder>(`/api/reminders/${reminderId}`, {
		method: "PATCH",
		body: JSON.stringify(body),
	});
}
