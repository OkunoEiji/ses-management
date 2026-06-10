<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Send from '@lucide/svelte/icons/send';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import InvoicePreview from '$lib/components/invoices/InvoicePreview.svelte';
	import InvoiceSendDialog from '$lib/components/invoices/InvoiceSendDialog.svelte';
	import type { InvoiceStatus } from '$lib/types';
	import {
		INVOICE_PREVIEW_PAGE_HEIGHT_PX,
		INVOICE_PREVIEW_PAGE_WIDTH_PX
	} from '$lib/utils/invoice-utils';
	import Download from '@lucide/svelte/icons/download';

	const previewPageWidth = `${INVOICE_PREVIEW_PAGE_WIDTH_PX}px`;
	const previewPageHeight = `${INVOICE_PREVIEW_PAGE_HEIGHT_PX}px`;

	let { data } = $props();
	const id = $derived(page.params.id);
	const invoice = $derived(data.invoice);
	const preview = $derived(data.preview);
	const project = $derived(data.project);

	let pdfRef = $state<HTMLElement | null>(null);
	let downloading = $state(false);
	let sendDialogOpen = $state(false);

	const statusStyles: Record<InvoiceStatus, string> = {
		下書き: 'bg-gray-100 text-gray-700 border-gray-200',
		送付済み: 'bg-blue-50 text-blue-700 border-blue-200',
		入金確認中: 'bg-amber-50 text-amber-700 border-amber-200',
		入金済み: 'bg-emerald-50 text-emerald-700 border-emerald-200'
	};

	function displayStatus(status?: InvoiceStatus): InvoiceStatus {
		return status ?? '下書き';
	}

	const isMailSent = $derived(!!preview?.sent_at);
	const isSendDisabled = $derived(displayStatus(preview?.status) === '下書き');

	async function handleSent() {
		await invalidateAll();
	}

	async function markPaid() {
		if (!id) return;
		await fetch(`/api/invoices/${id}/mark-paid`, { method: 'POST' });
		await invalidateAll();
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

<div class="document-form-page flex h-full min-h-0 flex-col overflow-hidden p-3">
	{#if !invoice || !preview}
		<div class="py-16 text-center text-muted-foreground">
			<p>請求書が見つかりません</p>
			<Button variant="link" onclick={() => goto('/invoices')}>一覧に戻る</Button>
		</div>
	{:else}
		{@const status = displayStatus(preview.status)}

		<header class="flex shrink-0 flex-wrap items-center gap-2 border-b border-border pb-2">
			<Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => history.back()}>
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="truncate text-base font-bold tracking-tight">
						{preview.invoice_number ?? '請求書'}
					</h1>
					<Badge variant="outline" class={statusStyles[status]}>{status}</Badge>
				</div>
				<p class="truncate text-[11px] text-muted-foreground">
					{preview.client_name}　{preview.billing_month}分　作業者: {preview.engineer_name || '—'}
				</p>
			</div>
			<div class="flex shrink-0 flex-wrap gap-1.5">
				<Button variant="outline" size="sm" class="h-7 gap-1 px-2 text-xs" onclick={() => goto(`/invoices/${id}/edit`)}>
					<Pencil class="h-3.5 w-3.5" />
					編集
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="h-7 gap-1 px-2 text-xs"
					onclick={handleDownloadPdf}
					disabled={downloading}
				>
					<Download class="h-3.5 w-3.5" />
					{downloading ? 'PDF生成中...' : 'PDFダウンロード'}
				</Button>
				<Button
					variant={isMailSent ? 'secondary' : 'default'}
					size="sm"
					class="h-7 gap-1 px-2 text-xs"
					disabled={isSendDisabled}
					onclick={() => (sendDialogOpen = true)}
				>
					<Send class="h-3.5 w-3.5" />
					送付する
				</Button>
				{#if status === '送付済み' || status === '入金確認中'}
					<Button variant="secondary" size="sm" class="h-7 gap-1 px-2 text-xs" onclick={markPaid}>
						入金済み
					</Button>
				{/if}
			</div>
		</header>

		<div
			class="invoice-detail-screen flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
			style="--invoice-page-width: {previewPageWidth}; --invoice-page-height: {previewPageHeight}"
		>
			<div
				class="box-border min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/30 p-1.5"
			>
				<div class="invoice-detail-preview-scaler mx-auto">
					<div class="invoice-detail-preview-scaler-inner">
						<InvoicePreview bind:ref={pdfRef} invoice={preview} />
					</div>
				</div>
			</div>
		</div>

		<InvoiceSendDialog
			bind:open={sendDialogOpen}
			{preview}
			invoiceId={invoice.id}
			pdfRef={pdfRef}
			clientContactName={project?.client_contact_name}
			clientContactEmail={project?.client_contact_email}
			onSent={handleSent}
		/>
	{/if}
</div>

<style>
	.invoice-detail-screen {
		--invoice-detail-preview-chrome: 7.5rem;
		--preview-scale: min(
			1,
			calc((100dvh - var(--invoice-detail-preview-chrome)) / var(--invoice-page-height))
		);
	}

	@media (min-width: 1280px) {
		.invoice-detail-screen {
			--invoice-detail-preview-chrome: 7rem;
		}
	}

	.invoice-detail-preview-scaler {
		width: calc(var(--invoice-page-width) * var(--preview-scale));
		height: calc(var(--invoice-page-height) * var(--preview-scale));
		overflow: hidden;
	}

	.invoice-detail-preview-scaler-inner {
		width: var(--invoice-page-width);
		transform: scale(var(--preview-scale));
		transform-origin: top left;
	}
</style>
