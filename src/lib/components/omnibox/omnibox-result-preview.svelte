<script lang="ts">
	import AlarmClockIcon from "@lucide/svelte/icons/alarm-clock";
	import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
	import CheckIcon from "@lucide/svelte/icons/check";
	import Edit3Icon from "@lucide/svelte/icons/edit-3";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import SendIcon from "@lucide/svelte/icons/send";
	import WalletCardsIcon from "@lucide/svelte/icons/wallet-cards";
	import XIcon from "@lucide/svelte/icons/x";

	import { Button } from "$lib/components/ui/button/index.js";

	export type OmniboxPreview = {
		kind: string;
		amount: string;
		category: string;
		reminder: string;
		destination: string;
		source: string;
	};

	type Props = {
		preview: OmniboxPreview;
		onCancel: () => void;
		onEdit: () => void;
		onSave: () => void;
	};

	let { preview, onCancel, onEdit, onSave }: Props = $props();

	let hasReminder = $derived(preview.reminder !== "Tidak ada alarm");
	let isFinance = $derived(preview.kind === "Pemasukan" || preview.kind.includes("Pengeluaran"));
</script>

<section class="rounded-md border border-border bg-card p-4 sm:p-5" aria-live="polite">
	<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex min-w-0 items-start gap-3">
			<div class="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
				<BadgeCheckIcon class="size-4 text-chart-1" />
			</div>
			<div class="min-w-0">
				<p class="text-sm text-muted-foreground">Draft hasil omnibox</p>
				<h2 class="mt-0.5 text-base font-medium">Tinjau sebelum disimpan</h2>
			</div>
		</div>

		<Button variant="ghost" size="icon" aria-label="Batalkan draft" onclick={onCancel}>
			<XIcon class="size-4" />
		</Button>
	</div>

	<div class="rounded-md border border-border bg-background p-3">
		<div class="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
			<FileTextIcon class="size-4" />
			<span>Input asli</span>
		</div>
		<p class="text-sm leading-6 text-foreground">{preview.source}</p>
	</div>

	<div class="mt-3 grid gap-3 md:grid-cols-3">
		<div class="rounded-md border border-border p-3">
			<div class="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
				<WalletCardsIcon class="size-4" />
				<span>Finance</span>
			</div>
			<p class="font-medium">{isFinance ? preview.amount : "Tidak ada nominal"}</p>
			<p class="mt-1 text-sm text-muted-foreground">{isFinance ? preview.category : "Disimpan sebagai catatan"}</p>
		</div>

		<div class="rounded-md border border-border p-3">
			<div class="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
				<AlarmClockIcon class="size-4" />
				<span>Reminder</span>
			</div>
			<p class="font-medium">{preview.reminder}</p>
			<p class="mt-1 text-sm text-muted-foreground">{hasReminder ? `Kirim via ${preview.destination}` : "Tanpa notifikasi"}</p>
		</div>

		<div class="rounded-md border border-border p-3">
			<div class="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
				<SendIcon class="size-4" />
				<span>Tujuan</span>
			</div>
			<p class="font-medium">{preview.kind}</p>
			<p class="mt-1 text-sm text-muted-foreground">Masuk ke timeline hari ini</p>
		</div>
	</div>

	<div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		<Button variant="outline" onclick={onEdit}>
			<Edit3Icon class="size-4" />
			Edit input
		</Button>
		<Button onclick={onSave}>
			<CheckIcon class="size-4" />
			Simpan draft
		</Button>
	</div>
</section>
