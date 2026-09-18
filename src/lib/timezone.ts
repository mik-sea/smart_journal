export const DEFAULT_TIMEZONE = "Asia/Jakarta";

export const TIMEZONE_OPTIONS = [
	{ value: "Asia/Jakarta", label: "WIB - Asia/Jakarta" },
	{ value: "Asia/Makassar", label: "WITA - Asia/Makassar" },
	{ value: "Asia/Jayapura", label: "WIT - Asia/Jayapura" },
	{ value: "UTC", label: "UTC" },
] as const;

type DateInput = Date | string | number | null | undefined;

function toDate(value: DateInput) {
	if (!value) return null;

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeTimeZone(value?: string | null) {
	const timezone = value?.trim() || DEFAULT_TIMEZONE;

	try {
		new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
		return timezone;
	} catch {
		return DEFAULT_TIMEZONE;
	}
}

export function getBrowserTimeZone() {
	return normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE);
}

function getOffsetMinutes(date: Date, timeZone = DEFAULT_TIMEZONE) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: normalizeTimeZone(timeZone),
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	}).formatToParts(date);

	const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
	const zonedAsUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));

	return Math.round((zonedAsUtc - date.getTime()) / 60000);
}

function formatOffset(minutes: number) {
	const sign = minutes >= 0 ? "+" : "-";
	const absolute = Math.abs(minutes);
	const hours = Math.floor(absolute / 60)
		.toString()
		.padStart(2, "0");
	const mins = (absolute % 60).toString().padStart(2, "0");

	return `${sign}${hours}:${mins}`;
}

export function getTimeZoneOffset(timeZone = DEFAULT_TIMEZONE, value: DateInput = new Date()) {
	const date = toDate(value) ?? new Date();
	return formatOffset(getOffsetMinutes(date, timeZone));
}

export function formatTimeZoneLabel(timeZone = DEFAULT_TIMEZONE, value: DateInput = new Date()) {
	const normalized = normalizeTimeZone(timeZone);
	return `${normalized} (UTC${getTimeZoneOffset(normalized, value)})`;
}

export function formatDateTimeInTimeZone(
	value: DateInput,
	timeZone = DEFAULT_TIMEZONE,
	options: Intl.DateTimeFormatOptions = {},
) {
	const date = toDate(value);
	if (!date) return "-";

	return new Intl.DateTimeFormat("id-ID", {
		timeZone: normalizeTimeZone(timeZone),
		...options,
	}).format(date);
}

export function hasExplicitTimeZone(value: string) {
	return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value.trim());
}

export function localDateTimeToRfc3339WithTimeZoneOffset(value: string, timeZone = DEFAULT_TIMEZONE) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (hasExplicitTimeZone(trimmed)) return trimmed;

	const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
	if (!match) return trimmed;

	const [, year, month, day, hour, minute, second = "00"] = match;
	const utcGuess = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));
	const offset = getTimeZoneOffset(timeZone, utcGuess);

	return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
}

export function toRfc3339WithTimeZoneOffset(value: DateInput, timeZone = DEFAULT_TIMEZONE) {
	const date = toDate(value);
	if (!date) return "";

	const normalized = normalizeTimeZone(timeZone);
	const offsetMinutes = getOffsetMinutes(date, normalized);
	const zoned = new Date(date.getTime() + offsetMinutes * 60_000);
	const pad = (input: number) => input.toString().padStart(2, "0");

	return [
		`${zoned.getUTCFullYear()}-${pad(zoned.getUTCMonth() + 1)}-${pad(zoned.getUTCDate())}`,
		`T${pad(zoned.getUTCHours())}:${pad(zoned.getUTCMinutes())}:${pad(zoned.getUTCSeconds())}`,
		formatOffset(offsetMinutes),
	].join("");
}
