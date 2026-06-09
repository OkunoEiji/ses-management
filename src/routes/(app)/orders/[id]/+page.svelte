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
	import { downloadPdf } from '$lib/utils/pdf-download';

	const id = $derived(page.params.id);
	const order = $derived(id ? findOrderSheet(id) : undefined);

	let estimateRef = $state<HTMLElement | null>(null);
	let orderRef = $state<HTMLElement | null>(null);
	let downloading = $state<'estimate' | 'order' | null>(null);

	const statusStyles: Record<OrderStatus, string> = {
		下書き: 'bg-gray-100 text-gray-600 border-gray-200',
		送付済み: 'bg-blue-50 text-blue-700 border-blue-200',
		承認済み: 'bg-emerald-50 text-emerald-700 border-emerald-200'
	};

	function displayStatus(status?: OrderStatus): OrderStatus {
		return status ?? '下書き';
	}

	function formatDisplayDate(value?: string | null): string {
		if (!value) return '';
		return value.replace(/-/g, '/');
	}

	function markSent() {
		if (!order) return;
		order.status = '送付済み';
	}

	function markApproved() {
		if (!order) return;
		order.status = '承認済み';
	}

	async function handleDownloadPdf(
		ref: HTMLElement | null,
		kind: 'estimate' | 'order'
	) {
		if (!order || !ref) return;
		downloading = kind;
		try {
			const name =
			kind === 'estimate'
				? `見積書_${order.order_number ?? order.id}.pdf`
				: `${order.order_type === '注文請書' ? '注文請書' : '注文書'}_${order.order_number ?? order.id}.pdf`;
				await downloadPdf(ref, name);
		} catch (e) {
			console.error(e);
			alert('PDF生成に失敗しました');
		} finally {
			downloading = null;
		}
	}
</script>

<div class="space-y-6 p-6">
	{#if !order}
		<div class="py-16 text-center text-muted-foreground">
			<p>注文書が見つかりません</p>
			<Button variant="link" onclick={() => goto('/orders')}>一覧に戻る</Button>
		</div>
	{:else}
		{@const ord = order}
		{@const status = displayStatus(ord.status)}

		<div class="flex flex-wrap items-center gap-3">
			<Button variant="ghost" size="icon" onclick={() => history.back()}>
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="text-2xl font-bold tracking-tight">
						{ord.order_number ?? ord.order_type ?? '注文書'}
					</h1>
					<Badge variant="outline" class={statusStyles[status]}>{status}</Badge>
					{#if ord.order_type}
						<Badge variant="secondary">{ord.order_type}</Badge>
					{/if}
				</div>
				<p class="mt-0.5 text-sm text-muted-foreground">
					{ord.project_name}　{ord.engineer_name ?? ''}
					{#if ord.period_start || ord.period_end}
						　{formatDisplayDate(ord.period_start)}〜{formatDisplayDate(ord.period_end)}
					{/if}
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" class="gap-2" onclick={() => goto(`/orders/${id}/edit`)}>
					<Pencil class="h-4 w-4" />
					編集
				</Button>
				{#if status === '下書き'}
					<Button class="gap-2" onclick={markSent}>
						<Send class="h-4 w-4" />
						送付済みにする
					</Button>
				{/if}
				{#if status === '送付済み'}
					<Button variant="secondary" class="gap-2" onclick={markApproved}>
						<CheckCircle class="h-4 w-4" />
						承認済みにする
					</Button>
				{/if}
			</div>
		</div>

		<div class="space-y-8">
			<section>
				<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
					<h2 class="text-sm font-medium text-muted-foreground">
						見積書（上位会社向け・{ord.client_company}）
					</h2>
					<Button
						class="gap-2 shrink-0"
						onclick={() => handleDownloadPdf(estimateRef, 'estimate')}
						disabled={downloading !== null}
					>
						<Download class="h-4 w-4" />
						{downloading === 'estimate' ? 'PDF生成中...' : 'PDFダウンロード'}
					</Button>
				</div>
				<div class="overflow-x-auto rounded-xl border border-border bg-muted/30 p-4">
					<div class="mx-auto w-fit">
						<OrderPreview bind:ref={estimateRef} order={ord} displayMode="estimate" />
					</div>
				</div>
			</section>

			<section>
				<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
					<h2 class="text-sm font-medium text-muted-foreground">
						{ord.order_type === '注文請書' ? '注文請書' : '注文書'}（所属会社向け・{ord.engineer_affiliation_company ?? ord.client_company}）
					</h2>
					<Button
						class="gap-2 shrink-0"
						onclick={() => handleDownloadPdf(orderRef, 'order')}
						disabled={downloading !== null}
					>
						<Download class="h-4 w-4" />
						{downloading === 'order' ? 'PDF生成中...' : 'PDFダウンロード'}
					</Button>
				</div>
				<div class="overflow-x-auto rounded-xl border border-border bg-muted/30 p-4">
					<div class="mx-auto w-fit">
						<OrderPreview bind:ref={orderRef} order={ord} displayMode="order" />
					</div>
				</div>
			</section>
		</div>
	{/if}
</div>