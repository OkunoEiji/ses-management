<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Send from '@lucide/svelte/icons/send';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import InvoicePreview from '$lib/components/invoices/InvoicePreview.svelte';
	import { findInvoice, type InvoiceStatus } from '$lib/mock/invoices';
	import { applyStatusTimestamps, toInvoicePreview } from '$lib/mock/invoice-utils';
	import { companySettings } from '$lib/stores/company-settings.svelte';
	import { today } from '$lib/utils';
	import Download from '@lucide/svelte/icons/download';

	const id = $derived(page.params.id);
	const invoice = $derived(id ? findInvoice(id) : undefined);
	const preview = $derived(invoice ? toInvoicePreview(invoice, companySettings.value) : null);

	let pdfRef = $state<HTMLElement | null>(null);
	let downloading = $state(false);

	const statusStyles: Record<InvoiceStatus, string> = {
		下書き: 'bg-gray-100 text-gray-700 border-gray-200',
		送付済み: 'bg-blue-50 text-blue-700 border-blue-200',
		入金確認中: 'bg-amber-50 text-amber-700 border-amber-200',
		入金済み: 'bg-emerald-50 text-emerald-700 border-emerald-200'
	};

	function displayStatus(status?: InvoiceStatus): InvoiceStatus {
		return status ?? '下書き';
	}

	function markSent() {
		if (!invoice) return;
		const now = today();
		const timestamps = applyStatusTimestamps({ status: '送付済み' }, invoice, now);
		invoice.status = '送付済み';
		invoice.sent_at = timestamps.sent_at;
		invoice.updated_at = timestamps.updated_at;
	}

	function markPaid() {
		if (!invoice) return;
		const now = today();
		const timestamps = applyStatusTimestamps({ status: '入金済み' }, invoice, now);
		invoice.status = '入金済み';
		invoice.sent_at = timestamps.sent_at;
		invoice.paid_at = timestamps.paid_at;
		invoice.updated_at = timestamps.updated_at;
	}

	async function handleDownloadPdf() {
		if (!pdfRef || !preview) return;
		downloading = true;
		try {
			const { downloadPdf } = await import('$lib/utils/pdf-download');
			const name = `請求書_${preview.invoice_number ?? preview.id}.pdf`;
			await downloadPdf(pdfRef, name);
		} catch (e) {
			console.error(e);
			alert('PDF生成に失敗しました');
		} finally {
			downloading = false;
		}
	}
</script>

<div class="space-y-6 p-6">
	{#if !invoice || !preview}
		<div class="py-16 text-center text-muted-foreground">
			<p>請求書が見つかりません</p>
			<Button variant="link" onclick={() => goto('/invoices')}>一覧に戻る</Button>
		</div>
	{:else}
		{@const status = displayStatus(preview.status)}

		<div class="flex flex-wrap items-center gap-3">
			<Button variant="ghost" size="icon" onclick={() => history.back()}>
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="text-2xl font-bold tracking-tight">
						{preview.invoice_number ?? '請求書'}
					</h1>
					<Badge variant="outline" class={statusStyles[status]}>{status}</Badge>
				</div>
				<p class="mt-0.5 text-sm text-muted-foreground">
					{preview.client_name}　{preview.billing_month}分　作業者: {preview.engineer_name || '—'}
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" class="gap-2" onclick={() => goto(`/invoices/${id}/edit`)}>
					<Pencil class="h-4 w-4" />
					編集
				</Button>
				<Button class="gap-2" onclick={handleDownloadPdf} disabled={downloading}>
					<Download class="h-4 w-4" />
					{downloading ? 'PDF生成中...' : 'PDFダウンロード'}
				</Button>
				{#if status === '下書き'}
					<Button class="gap-2" onclick={markSent}>
						<Send class="h-4 w-4" />
						送付済みにする
					</Button>
				{/if}
				{#if status === '送付済み' || status === '入金確認中'}
					<Button variant="secondary" onclick={markPaid}>入金済みにする</Button>
				{/if}
			</div>
		</div>

		<div class="overflow-x-auto rounded-xl border border-border bg-muted/30 p-4">
			<div class="mx-auto w-fit">
				<InvoicePreview bind:ref={pdfRef} invoice={preview} />
			</div>
		</div>
	{/if}
</div>
