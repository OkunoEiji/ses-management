<script lang="ts">
	import { goto } from '$app/navigation';
	import Plus from '@lucide/svelte/icons/plus';
	import Eye from '@lucide/svelte/icons/eye';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import FileCheck from '@lucide/svelte/icons/file-check';
	import Search from '@lucide/svelte/icons/search';
	import Calendar from '@lucide/svelte/icons/calendar';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import ListPageLayout from '$lib/components/layout/ListPageLayout.svelte';
	import { invalidateAll } from '$app/navigation';
	import { submitDeleteAction } from '$lib/api/submit';
	import type { Order, OrderStatus } from '$lib/types';
	import { daysUntil } from '$lib/utils';
	import { cn } from '$lib/utils';

	type TabKey = 'estimate' | 'order';
	type PriceField = 'billing' | 'cost';

	let { data } = $props();
	let orderList = $derived(data.orders);
	let search = $state('');
	let filterStatus = $state<'all' | OrderStatus>('all');
	let activeTab = $state<TabKey>('estimate');

	let deleteTarget = $state<Order | null>(null);
	let deleteDialogOpen = $state(false);

	const statusStyles: Record<OrderStatus, string> = {
		下書き: 'bg-gray-100 text-gray-600 border-gray-200',
		送付済み: 'bg-blue-50 text-blue-700 border-blue-200',
		承認済み: 'bg-emerald-50 text-emerald-700 border-emerald-200'
	};

	const selectClass =
		'flex h-9 w-36 shrink-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs';

	function displayStatus(status?: OrderStatus): OrderStatus {
		return status ?? '下書き';
	}

	function formatDisplayDate(value?: string | null): string {
		if (!value) return '';
		return value.replace(/-/g, '/');
	}

	function filterOrders(list: Order[]): Order[] {
		const q = search.trim().toLowerCase();
		return list
			.filter((o) => {
				const matchSearch =
					!q ||
					o.project_name?.toLowerCase().includes(q) ||
					o.client_company?.toLowerCase().includes(q) ||
					o.engineer_name?.toLowerCase().includes(q) ||
					o.order_number?.toLowerCase().includes(q);
				const matchStatus = filterStatus === 'all' || displayStatus(o.status) === filterStatus;
				return matchSearch && matchStatus;
			})
			.sort((a, b) => {
				if (!a.period_end && !b.period_end) return 0;
				if (!a.period_end) return 1;
				if (!b.period_end) return -1;
				return a.period_end.localeCompare(b.period_end);
			});
	}

	const estimateOrders = $derived(
		filterOrders(
			orderList.filter((o) => (o.unit_price ?? 0) > 0 || !!o.client_company)
		)
	);

	const costOrders = $derived(
		filterOrders(orderList.filter((o) => (o.cost_unit_price ?? 0) > 0))
	);

	const activeList = $derived(activeTab === 'estimate' ? estimateOrders : costOrders);
	const priceField = $derived<PriceField>(activeTab === 'estimate' ? 'billing' : 'cost');

	function groupByProject(list: Order[]): Record<string, Order[]> {
		const map: Record<string, Order[]> = {};
		for (const o of list) {
			const key = o.project_name || '（未設定）';
			if (!map[key]) map[key] = [];
			map[key].push(o);
		}
		return map;
	}

	const grouped = $derived(groupByProject(activeList));

	function periodMeta(periodEnd?: string | null) {
		if (!periodEnd) {
			return { daysLeft: null as number | null, isExpired: false, isExpiringSoon: false };
		}
		const daysLeft = daysUntil(periodEnd);
		return {
			daysLeft,
			isExpired: daysLeft < 0,
			isExpiringSoon: daysLeft >= 0 && daysLeft <= 30
		};
	}

	function displayPrice(order: Order, priceField: PriceField): number {
		return priceField === 'cost' ? (order.cost_unit_price ?? 0) : (order.unit_price ?? 0);
	}

	function subtitleCompany(order: Order, priceField: PriceField): string {
		if (priceField === 'cost') {
			return order.engineer_affiliation_company || order.client_company;
		}
		return order.client_company;
	}

	function openDelete(order: Order) {
		deleteTarget = order;
		deleteDialogOpen = true;
	}

	function closeDelete() {
		deleteDialogOpen = false;
		deleteTarget = null;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		await submitDeleteAction(deleteTarget.id);
		closeDelete();
		await invalidateAll();
	}
</script>

<ListPageLayout>
	{#snippet toolbar()}
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">注文書一覧</h1>
			</div>
			<Button class="gap-2" onclick={() => goto('/orders/new')}>
				<Plus class="h-4 w-4" />
				新規作成
			</Button>
		</div>

		<div class="flex flex-wrap gap-3">
			<div class="relative min-w-[200px] flex-1">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input class="pl-9" placeholder="案件名・会社名・要員名・番号で検索" bind:value={search} />
			</div>
			<select class={selectClass} bind:value={filterStatus}>
				<option value="all">状態：全て</option>
				<option value="下書き">下書き</option>
				<option value="送付済み">送付済み</option>
				<option value="承認済み">承認済み</option>
			</select>
		</div>

		<div class="space-y-4">
			<div class="inline-flex h-10 items-center gap-1 rounded-lg bg-muted p-1">
			<button
				type="button"
				class={cn(
					'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
					activeTab === 'estimate'
						? 'bg-background text-foreground shadow-xs'
						: 'text-muted-foreground hover:text-foreground'
				)}
				onclick={() => (activeTab = 'estimate')}
			>
				<TrendingUp class="h-4 w-4" />
				見積書（上位向け・請求条件）
				<Badge variant="secondary" class="ml-1">{estimateOrders.length}</Badge>
			</button>
			<button
				type="button"
				class={cn(
					'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
					activeTab === 'order'
						? 'bg-background text-foreground shadow-xs'
						: 'text-muted-foreground hover:text-foreground'
				)}
				onclick={() => (activeTab = 'order')}
			>
				<TrendingDown class="h-4 w-4" />
				注文書（所属向け・支払条件）
				<Badge variant="secondary" class="ml-1">{costOrders.length}</Badge>
			</button>
		</div>

			{#if activeTab === 'estimate'}
				<p class="text-xs text-muted-foreground">
					上位会社への見積書 — 請求単価・請求条件を使用
				</p>
			{:else}
				<p class="text-xs text-muted-foreground">
					所属会社への注文書 — 支払単価・支払条件を使用（支払単価未設定の案件は表示されません）
				</p>
			{/if}
		</div>
	{/snippet}
	{#snippet children()}
		{#if activeList.length === 0}
			<Card.Root class="border border-border p-16 text-center text-muted-foreground shadow-none ring-0">
				<FileCheck class="mx-auto mb-3 h-10 w-10 opacity-30" />
				<p class="font-medium">データがありません</p>
			</Card.Root>
		{:else}
			<div class="space-y-2">
				{#each Object.entries(grouped) as [projName, projOrders] (projName)}
					<Card.Root class="gap-0 border border-border py-0 shadow-none ring-0">
						<Card.Header class="px-5 pt-2">
							<div class="flex items-center justify-between">
								<Card.Title
									class="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
								>
									案件名：{projName}
								</Card.Title>
								<span class="text-l text-muted-foreground">{projOrders.length}件</span>
							</div>
						</Card.Header>
						<Card.Content class="space-y-0.5 px-6 py-1">
							{#each projOrders as order (order.id)}
								{@const status = displayStatus(order.status)}
								{@const meta = periodMeta(order.period_end)}
								{@const price = displayPrice(order, priceField)}
								<div
									role="button"
									tabindex="0"
									class={cn(
										'flex cursor-pointer flex-col justify-between gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center',
										meta.isExpired
											? 'border-red-200 bg-red-50/50 hover:bg-red-50'
											: meta.isExpiringSoon
												? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
												: 'border-border bg-background hover:bg-muted/40'
									)}
									onclick={() => goto(`/orders/${order.id}`)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											goto(`/orders/${order.id}`);
										}
									}}
								>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium">
											{order.order_number ?? '-'}
										</p>
										<p class="truncate text-xs text-muted-foreground">
											{subtitleCompany(order, priceField)}
											{#if order.engineer_name}
												　要員：{order.engineer_name}
											{/if}
										</p>
										{#if order.period_start || order.period_end}
											<p
												class="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
											>
												<Calendar class="h-3 w-3 shrink-0" />
												{formatDisplayDate(order.period_start)}
												{#if order.period_start && order.period_end}
													<span>　〜　</span>
												{/if}
												{formatDisplayDate(order.period_end)}
												{#if meta.daysLeft !== null}
													<span
														class={cn(
															'font-medium',
															meta.isExpired
																? 'text-red-600'
																: meta.isExpiringSoon
																	? 'text-amber-600'
																	: 'text-muted-foreground'
														)}
													>
														{meta.isExpired
															? `（${Math.abs(meta.daysLeft)}日超過）`
															: `（残${meta.daysLeft}日）`}
													</span>
												{/if}
											</p>
										{/if}
									</div>
									<div class="flex shrink-0 items-center gap-3">
										{#if meta.isExpired}
											<AlertTriangle class="h-4 w-4 text-red-500" />
										{:else if meta.isExpiringSoon}
											<AlertTriangle class="h-4 w-4 text-amber-500" />
										{/if}
										{#if price > 0}
											<span class="text-sm font-semibold text-primary">{price}万円</span>
										{/if}
										<Badge variant="outline" class={statusStyles[status]}>{status}</Badge>
										<div
											class="flex gap-1"
											role="presentation"
											onclick={(e) => e.stopPropagation()}
											onkeydown={(e) => e.stopPropagation()}
										>
											<Button
												variant="ghost"
												size="icon"
												class="h-7 w-7"
												onclick={() => goto(`/orders/${order.id}`)}
											>
												<Eye class="h-3.5 w-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-7 w-7"
												onclick={() => goto(`/orders/${order.id}/edit`)}
											>
												<Pencil class="h-3.5 w-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-7 w-7 text-destructive hover:text-destructive"
												onclick={() => openDelete(order)}
											>
												<Trash2 class="h-3.5 w-3.5" />
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}
	{/snippet}
</ListPageLayout>

<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>削除しますか？</Dialog.Title>
				<Dialog.Description>
					「{deleteTarget?.order_number ?? deleteTarget?.project_name}」を削除します。この操作は取り消せません。
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={closeDelete}>キャンセル</Button>
				<Button variant="destructive" onclick={handleDelete}>削除する</Button>
			</Dialog.Footer>
		</Dialog.Content>
</Dialog.Root>
