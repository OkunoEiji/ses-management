<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import OrderForm from '$lib/components/orders/OrderForm.svelte';
	import { orderSheets, findOrderSheet, type Order } from '$lib/mock/orders';
	import { today } from '$lib/utils';

	const id = $derived(page.params.id);
	const order = $derived(id ? findOrderSheet(id) : undefined);

	let isSubmitting = $state(false);

	function handleSubmit(data: Omit<Order, 'id'>) {
		if (!id || !order) return;
		isSubmitting = true;

		const index = orderSheets.findIndex((o) => o.id === id);
		if (index >= 0) {
			orderSheets[index] = {
				id,
				...data,
				created_at: order.created_at ?? today(),
				updated_at: today()
			};
		}

		goto(`/orders/${id}`);
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="icon" onclick={() => history.back()}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">注文書編集</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{order?.order_number ?? order?.project_name ?? ''}を編集します
			</p>
		</div>
	</div>

	{#if !order}
		<p class="text-muted-foreground">注文書が見つかりません</p>
		<Button variant="link" onclick={() => goto('/orders')}>一覧に戻る</Button>
	{:else}
		{#key order.id}
			<OrderForm
				initialData={order}
				onSubmit={handleSubmit}
				{isSubmitting}
				submitLabel="更新する"
			/>
		{/key}
	{/if}
</div>
