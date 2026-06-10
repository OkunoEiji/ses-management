<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import OrderForm from '$lib/components/orders/OrderForm.svelte';
	import { submitJsonAction } from '$lib/api/submit';
	import type { Order } from '$lib/types';

	let { data } = $props();
	const id = $derived(page.params.id);
	const order = $derived(data.order);

	let isSubmitting = $state(false);

	async function handleSubmit(formData: Omit<Order, 'id'>) {
		isSubmitting = true;
		try {
			await submitJsonAction(formData);
		} catch (e) {
			console.error(e);
			alert('保存に失敗しました');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="document-form-page flex h-full min-h-0 flex-col overflow-hidden p-3">
	<header class="flex shrink-0 items-center gap-2 border-b border-border pb-2">
		<Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => history.back()}>
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div class="min-w-0">
			<h1 class="text-base font-bold tracking-tight">注文書編集</h1>
			{#if order}
				<p class="truncate text-[11px] text-muted-foreground">
					{order.order_number ?? order.project_name}
				</p>
			{/if}
		</div>
	</header>

	<div class="min-h-0 flex-1 pt-2">
		{#if !order}
			<p class="text-sm text-muted-foreground">注文書が見つかりません</p>
			<Button variant="link" class="h-auto p-0" onclick={() => goto('/orders')}>一覧に戻る</Button>
		{:else}
			{#key order.id}
				<OrderForm
					engineers={data.engineers}
					projects={data.projects}
					initialData={order}
					onSubmit={handleSubmit}
					{isSubmitting}
					submitLabel="更新する"
				/>
			{/key}
		{/if}
	</div>
</div>
