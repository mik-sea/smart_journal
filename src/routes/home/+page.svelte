<script lang="ts">
	import { goto } from "$app/navigation";
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import CheckIcon from "@lucide/svelte/icons/check";
	import CircleDollarSignIcon from "@lucide/svelte/icons/circle-dollar-sign";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import MailCheckIcon from "@lucide/svelte/icons/mail-check";
	import RefreshCcwIcon from "@lucide/svelte/icons/refresh-ccw";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";
	import XIcon from "@lucide/svelte/icons/x";

	import {
		ApiError,
		createJournal,
		getNotes,
		getProfile,
		getReminders,
		getTransactions,
		type JournalResponse,
		type Note,
		type Profile,
		type Reminder,
		type Transaction,
	} from "$lib/api/smart-journal";
	import { authSession, logout } from "$lib/auth";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { DEFAULT_TIMEZONE, formatDateTimeInTimeZone, normalizeTimeZone } from "$lib/timezone";

	type TimelineItem = {
		id: string;
		time: string;
		title: string;
		meta: string;
		amount?: string;
		type: "expense" | "income" | "reminder" | "note";
	};

	let entry = $state("");
	let isProcessing = $state(false);
	let isLoading = $state(false);
	let result = $state<JournalResponse | null>(null);
	let profile = $state<Profile | null>(null);
	let notes = $state<Note[]>([]);
	let transactions = $state<Transaction[]>([]);
	let reminders = $state<Reminder[]>([]);
	let errorMessage = $state("");
	let toast = $state("");
	let hasLoadedForUser = $state("");
	const suggestions = [
		"Beli kopi 30rb",
		"Ingatkan bayar listrik besok jam 8 pagi",
		"Gaji masuk 5jt dari project",
	];

	const activeTimezone = $derived(normalizeTimeZone(profile?.timezone || DEFAULT_TIMEZONE));
	const todayLabel = $derived(
		formatDateTimeInTimeZone(new Date(), activeTimezone, {
			weekday: "long",
			day: "numeric",
			month: "long",
		}),
	);
	const timeline = $derived(buildTimeline(notes, transactions, reminders, activeTimezone));
	const reminderCount = $derived(asArray(reminders).filter((item) => item.status === "pending").length);
	const incomeTotal = $derived(sumTransactions(transactions, "income"));
	const expenseTotal = $derived(sumTransactions(transactions, "expense"));
	const showEmailVerificationBanner = $derived(Boolean(profile && !profile.email_verified_at));

	$effect(() => {
		const session = $authSession;

		if (!session.loading && !session.user) {
			goto("/login");
		}

		if (session.user && hasLoadedForUser !== session.user.uid) {
			hasLoadedForUser = session.user.uid;
			loadDashboard();
		}
	});

	function formatCurrency(value: number) {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			maximumFractionDigits: 0,
		}).format(value);
	}

	function formatTime(value?: string, timeZone = activeTimezone) {
		return formatDateTimeInTimeZone(value, timeZone, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	function formatDateTime(value?: string) {
		return formatDateTimeInTimeZone(value, activeTimezone, {
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function sumTransactions(items: Transaction[], type: Transaction["type"]) {
		return asArray(items)
			.filter((item) => item.type === type)
			.reduce((total, item) => total + Number(item.amount || 0), 0);
	}

	function asArray<T>(items: T[] | null | undefined) {
		return Array.isArray(items) ? items : [];
	}

	function buildTimeline(
		noteItems: Note[] | null,
		transactionItems: Transaction[] | null,
		reminderItems: Reminder[] | null,
		timeZone: string,
	): TimelineItem[] {
		const safeNotes = asArray(noteItems);
		const safeTransactions = asArray(transactionItems);
		const safeReminders = asArray(reminderItems);

		const fromTransactions = safeTransactions.map((item) => ({
			id: `transaction-${item.id}`,
			time: formatTime(item.created_at, timeZone),
			title: item.category || "Transaksi",
			meta: item.type === "income" ? "Pemasukan" : "Pengeluaran",
			amount: `${item.type === "income" ? "+" : "-"}${formatCurrency(Number(item.amount || 0))}`,
			type: item.type,
		})) satisfies TimelineItem[];

		const fromReminders = safeReminders.map((item) => ({
			id: `reminder-${item.id}`,
			time: formatTime(item.remind_at, timeZone),
			title: item.message,
			meta: `Reminder - ${item.status}`,
			type: "reminder",
		})) satisfies TimelineItem[];

		const transactionNoteIds = new Set(safeTransactions.map((item) => item.note_id).filter(Boolean));
		const reminderNoteIds = new Set(safeReminders.map((item) => item.note_id).filter(Boolean));
		const fromNotes = safeNotes
			.filter((item) => !transactionNoteIds.has(item.id) && !reminderNoteIds.has(item.id))
			.map((item) => ({
				id: `note-${item.id}`,
				time: formatTime(item.created_at, timeZone),
				title: item.title || item.raw_text,
				meta: "Catatan",
				type: "note",
			})) satisfies TimelineItem[];

		return [...fromTransactions, ...fromReminders, ...fromNotes].slice(0, 10);
	}

	function showToast(message: string) {
		toast = message;
		window.setTimeout(() => {
			toast = "";
		}, 2600);
	}

	function setApiError(error: unknown, fallback: string) {
		errorMessage = error instanceof ApiError ? error.message : fallback;
	}

	async function loadDashboard() {
		isLoading = true;
		errorMessage = "";

		try {
			profile = await getProfile().catch(() => null);
			const [notesResponse, transactionsResponse, remindersResponse] = await Promise.all([
				getNotes(50),
				getTransactions(50),
				getReminders(50),
			]);

			notes = notesResponse.notes;
			transactions = transactionsResponse.transactions;
			reminders = remindersResponse.reminders;
		} catch (error) {
			setApiError(error, "Gagal mengambil data dari backend.");
		} finally {
			isLoading = false;
		}
	}

	async function processEntry() {
		const text = entry.trim();

		if (!text || isProcessing) return;

		isProcessing = true;
		errorMessage = "";
		result = null;

		try {
			result = await createJournal(text);
			entry = "";
			showToast("Catatan diproses dan disimpan.");
			await loadDashboard();
		} catch (error) {
			setApiError(error, "Gagal memproses catatan.");
		} finally {
			isProcessing = false;
		}
	}

	function useSuggestion(value: string) {
		entry = value;
		result = null;
	}

	async function refreshVerificationStatus() {
		try {
			await loadDashboard();
			showToast("Status akun diperbarui.");
		} catch {
			errorMessage = "Gagal memperbarui status akun.";
		}
	}

	async function signOut() {
		await logout();
		goto("/login");
	}
</script>

<svelte:head>
	<title>Home - Smart Journal</title>
</svelte:head>

<section class="min-h-[calc(100vh-3rem)] bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-5">
		<header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">{todayLabel}</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-normal">Home</h1>
			</div>

			<div class="flex flex-wrap gap-2 text-sm">
				<div class="rounded-md border border-border px-3 py-2">
					<span class="text-muted-foreground">Item</span>
					<span class="ml-2 font-medium">{timeline.length}</span>
				</div>
				<div class="rounded-md border border-border px-3 py-2">
					<span class="text-muted-foreground">Reminder</span>
					<span class="ml-2 font-medium">{reminderCount}</span>
				</div>
				<Button variant="outline" size="sm" onclick={loadDashboard} disabled={isLoading}>
					<RefreshCcwIcon class={`size-4 ${isLoading ? "animate-spin" : ""}`} />
					Refresh
				</Button>
				<Button variant="ghost" size="sm" onclick={signOut}>
					<LogOutIcon class="size-4" />
					Logout
				</Button>
			</div>
		</header>

		{#if showEmailVerificationBanner}
			<div class="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex gap-3">
					<MailCheckIcon class="mt-0.5 size-5 shrink-0" />
					<div>
						<p class="font-medium">Email belum diverifikasi</p>
						<p class="text-sm leading-6">Cek inbox untuk verifikasi agar akun siap dipakai untuk notifikasi.</p>
					</div>
				</div>
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={refreshVerificationStatus}>Cek status</Button>
				</div>
			</div>
		{/if}

		{#if errorMessage}
			<div class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				{errorMessage}
			</div>
		{/if}

		<div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
			<div class="space-y-5">
				<section class="rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-3 flex items-center justify-between gap-3">
						<h2 class="text-base font-medium">Catatan baru</h2>
						{#if isProcessing}
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<LoaderCircleIcon class="size-4 animate-spin" />
								<span>Memproses</span>
							</div>
						{/if}
					</div>

					<div class="relative">
						<Textarea
							bind:value={entry}
							disabled={isProcessing || !$authSession.user}
							placeholder="Beli kopi 30rb, ingatkan bayar listrik besok jam 8 pagi"
							class="min-h-36 resize-none rounded-md bg-background p-4 pr-14 text-base leading-7 shadow-none placeholder:text-muted-foreground md:text-base"
							onkeydown={(event) => {
								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									processEntry();
								}
							}}
						/>
						<Button
							size="icon"
							class="absolute bottom-3 right-3"
							aria-label="Proses catatan"
							disabled={!entry.trim() || isProcessing || !$authSession.user}
							onclick={processEntry}
						>
							{#if isProcessing}
								<LoaderCircleIcon class="size-4 animate-spin" />
							{:else}
								<ArrowUpIcon class="size-4" />
							{/if}
						</Button>
					</div>

					<div class="mt-3 flex flex-wrap gap-2">
						{#each suggestions as suggestion}
							<Button
								variant="outline"
								size="sm"
								class="h-auto whitespace-normal border-input px-3 py-2 text-left text-muted-foreground"
								onclick={() => useSuggestion(suggestion)}
							>
								{suggestion}
							</Button>
						{/each}
					</div>
				</section>

				{#if result}
					<section class="rounded-md border border-border bg-card p-4 sm:p-5">
						<div class="mb-4 flex items-center justify-between gap-3">
							<h2 class="text-base font-medium">Hasil AI</h2>
							<span class="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
								{result.ai_result.intents.join(", ") || "note"}
							</span>
						</div>
						<div class="grid gap-3 sm:grid-cols-2">
							<div class="rounded-md border border-border bg-background p-3">
								<p class="text-xs text-muted-foreground">Judul</p>
								<p class="mt-1 font-medium">{result.note.title}</p>
							</div>
							<div class="rounded-md border border-border bg-background p-3">
								<p class="text-xs text-muted-foreground">Reminder</p>
								<p class="mt-1 font-medium">{result.ai_result.reminder_data?.message ?? "Tidak ada reminder"}</p>
							</div>
							<div class="rounded-md border border-border bg-background p-3">
								<p class="text-xs text-muted-foreground">Transaksi</p>
								<p class="mt-1 font-medium">
									{#if result.ai_result.financial_data}
										{formatCurrency(result.ai_result.financial_data.amount)} - {result.ai_result.financial_data.category}
									{:else}
										Tidak ada transaksi
									{/if}
								</p>
							</div>
							<div class="rounded-md border border-border bg-background p-3">
								<p class="text-xs text-muted-foreground">Disimpan</p>
								<p class="mt-1 font-medium">{formatDateTime(result.note.created_at)}</p>
							</div>
						</div>
					</section>
				{/if}
			</div>

			<div class="space-y-5">
				<section id="finance" class="grid grid-cols-2 gap-3">
					<div class="rounded-md border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Pemasukan</p>
						<p class="mt-2 text-lg font-semibold text-chart-1">{formatCurrency(incomeTotal)}</p>
					</div>
					<div class="rounded-md border border-border bg-card p-4">
						<p class="text-sm text-muted-foreground">Pengeluaran</p>
						<p class="mt-2 text-lg font-semibold text-destructive">{formatCurrency(expenseTotal)}</p>
					</div>
				</section>

				<section id="reminders" class="rounded-md border border-border bg-card p-4 sm:p-5">
					<div class="mb-4 flex items-center justify-between gap-3">
						<h2 class="text-base font-medium">Aktivitas terbaru</h2>
						<span class="text-sm text-muted-foreground">{timeline.length} item</span>
					</div>

					{#if isLoading && timeline.length === 0}
						<div class="flex items-center gap-2 py-6 text-sm text-muted-foreground">
							<LoaderCircleIcon class="size-4 animate-spin" />
							<span>Mengambil data</span>
						</div>
					{:else if timeline.length === 0}
						<p class="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
							Belum ada data. Tulis catatan pertama dari omnibox.
						</p>
					{:else}
						<div class="space-y-1">
							{#each timeline as item (item.id)}
								<article class="flex gap-3 rounded-md px-2 py-3 hover:bg-secondary/60">
									<div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
										{#if item.type === "expense"}
											<WalletCardsIcon class="size-4 text-destructive" />
										{:else if item.type === "income"}
											<CircleDollarSignIcon class="size-4 text-chart-1" />
										{:else if item.type === "reminder"}
											<AlarmClockIcon class="size-4 text-chart-2" />
										{:else}
											<FileTextIcon class="size-4 text-chart-3" />
										{/if}
									</div>
									<div class="min-w-0 flex-1">
										<div class="flex items-start justify-between gap-3">
											<p class="truncate font-medium">{item.title}</p>
											<span class="shrink-0 text-xs text-muted-foreground">{item.time}</span>
										</div>
										<div class="mt-1 flex items-center justify-between gap-3">
											<p class="truncate text-sm text-muted-foreground">{item.meta}</p>
											{#if item.amount}
												<p
													class={`shrink-0 text-sm font-medium ${
														item.type === "income" ? "text-chart-1" : "text-destructive"
													}`}
												>
													{item.amount}
												</p>
											{/if}
										</div>
									</div>
								</article>
							{/each}
						</div>
					{/if}
				</section>
			</div>
		</div>
	</div>

	{#if toast}
		<div class="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm shadow-lg">
			<CheckIcon class="size-4 text-chart-1" />
			<span>{toast}</span>
			<Button variant="ghost" size="icon-xs" aria-label="Tutup notifikasi" onclick={() => (toast = "")}>
				<XIcon class="size-3" />
			</Button>
		</div>
	{/if}
</section>
