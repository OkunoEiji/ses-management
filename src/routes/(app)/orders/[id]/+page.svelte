<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Send from '@lucide/svelte/icons/send';
	import Download from '@lucide/svelte/icons/download';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import OrderPreview from '$lib/components/orders/OrderPreview.svelte';
	import { findOrderSheet, type OrderStatus } from '$lib/mock/orders';
	import {
		ORDER_PREVIEW_PAGE_HEIGHT_PX,
		ORDER_PREVIEW_PAGE_WIDTH_PX
	} from '$lib/mock/order-utils';
	import { downloadPdf } from '$lib/utils/pdf-download';

	const previewPageWidth = `${ORDER_PREVIEW_PAGE_WIDTH_PX}px`;
	const previewPageHeight = `${ORDER_PREVIEW_PAGE_HEIGHT_PX}px`;

	const id = $derived(page.params.id);
	const order = $derived(id ? findOrderSheet(id) : undefined);

	let previewRef = $state<HTMLElement | null>(null);
	let activeTab = $state<'estimate' | 'order'>('estimate');
	let downloading = $state(false);

	const statusStyles: Record<OrderStatus, string> = {
		下書き: 'bg-gray-100 text-gray-600 border-gray-200',
		送付済み: 'bg-blue-50 text-blue-700 border-blue-200',
		承認済み: 'bg-emerald-50 text-emerald-700 border-emerald-200'
	};

	const tabLabels = $derived.by(() => {
		if (!order) return { estimate: '', order: '' };
		const orderDoc =
			order.order_type === '注文請書' ? '注文請書（所属会社向け）' : '注文書（所属会社向け）';
		return {
			estimate: '見積書（上位会社向け）',
			order: orderDoc
		};
	});

	const tabCaption = $derived.by(() => {
		if (!order) return '';
		if (activeTab === 'estimate') {
			return order.client_company || '—';
		}
		return order.engineer_affiliation_company ?? order.client_company ?? '—';
	});

	function displayStatus(status?: OrderStatus): OrderStatus {
		return status ?? '下書き';
	}

	function markSent() {
		if (!order) return;
		order.status = '送付済み';
	}

	function markApproved() {
		if (!order) return;
		order.status = '承認済み';
	}

	async function handleDownloadPdf() {
		if (!order || !previewRef) return;
		downloading = true;
		try {
			const name =
				activeTab === 'estimate'
					? `見積書_${order.order_number ?? order.id}.pdf`
					: `${order.order_type === '注文請書' ? '注文請書' : '注文書'}_${order.order_number ?? order.id}.pdf`;
			await downloadPdf(previewRef, name);
		} catch (e) {
			console.error(e);
			alert('PDF生成に失敗しました');
		} finally {
			downloading = false;
		}
	}
</script>

<div class="document-form-page flex h-full min-h-0 flex-col overflow-hidden p-3">
	{#if !order}
		<div class="py-16 text-center text-muted-foreground">
			<p>注文書が見つかりません</p>
			<Button variant="link" onclick={() => goto('/orders')}>一覧に戻る</Button>
		</div>
	{:else}
		{@const ord = order}
		{@const status = displayStatus(ord.status)}

		<header class="flex shrink-0 flex-wrap items-center gap-2 border-b border-border pb-2">
			<Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => history.back()}>
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="truncate text-base font-bold tracking-tight">
						{ord.order_number ?? ord.order_type ?? '注文書'}
					</h1>
					<Badge variant="outline" class={statusStyles[status]}>{status}</Badge>
					{#if ord.order_type}
						<Badge variant="secondary" class="text-[11px]">{ord.order_type}</Badge>
					{/if}
				</div>
				<p class="truncate text-[11px] text-muted-foreground">
					{ord.project_name}
					{#if ord.engineer_name}　{ord.engineer_name}{/if}
				</p>
			</div>
			<div class="flex shrink-0 flex-wrap gap-1.5">
				<Button variant="outline" size="sm" class="h-7 gap-1 px-2 text-xs" onclick={() => goto(`/orders/${id}/edit`)}>
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
				{#if status === '下書き'}
					<Button size="sm" class="h-7 gap-1 px-2 text-xs" onclick={markSent}>
						<Send class="h-3.5 w-3.5" />
						送付済み
					</Button>
				{/if}
				{#if status === '送付済み'}
					<Button variant="secondary" size="sm" class="h-7 gap-1 px-2 text-xs" onclick={markApproved}>
						<CheckCircle class="h-3.5 w-3.5" />
						承認済み
					</Button>
				{/if}
			</div>
		</header>

		<div
			class="order-detail-screen flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
			style="--order-page-width: {previewPageWidth}; --order-page-height: {previewPageHeight}"
		>
			<div class="mb-1 flex shrink-0 items-center gap-2">
				<div class="flex gap-1">
					<button
						type="button"
						class="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors {activeTab ===
						'estimate'
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
						onclick={() => (activeTab = 'estimate')}
					>
						{tabLabels.estimate}
					</button>
					<button
						type="button"
						class="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors {activeTab ===
						'order'
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
						onclick={() => (activeTab = 'order')}
					>
						{tabLabels.order}
					</button>
				</div>
				<p class="truncate text-[11px] text-muted-foreground">宛先：{tabCaption}</p>
			</div>

			<div
				class="box-border min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/30 p-1.5"
			>
				<div class="order-detail-preview-scaler mx-auto">
					<div class="order-detail-preview-scaler-inner">
						{#key activeTab}
							<OrderPreview bind:ref={previewRef} order={ord} displayMode={activeTab} />
						{/key}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.order-detail-screen {
		--order-detail-preview-chrome: 10rem;
		--preview-scale: min(
			1,
			calc((100dvh - var(--order-detail-preview-chrome)) / var(--order-page-height))
		);
	}

	@media (min-width: 1280px) {
		.order-detail-screen {
			--order-detail-preview-chrome: 9rem;
		}
	}

	.order-detail-preview-scaler {
		width: calc(var(--order-page-width) * var(--preview-scale));
		height: calc(var(--order-page-height) * var(--preview-scale));
		overflow: hidden;
	}

	.order-detail-preview-scaler-inner {
		width: var(--order-page-width);
		transform: scale(var(--preview-scale));
		transform-origin: top left;
	}
</style>
