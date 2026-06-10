<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import InvoiceForm from '$lib/components/invoices/InvoiceForm.svelte';
	import { submitJsonAction } from '$lib/api/submit';
	import { resolveEngineerName } from '$lib/utils/invoice-utils';
	import type { InvoiceInput } from '$lib/types';

	let { data } = $props();
	const id = $derived(page.params.id);
	const invoice = $derived(data.invoice);

	let isSubmitting = $state(false);

	async function handleSubmit(formData: InvoiceInput) {
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
			<h1 class="text-base font-bold tracking-tight">請求書編集</h1>
			{#if invoice}
				<p class="truncate text-[11px] text-muted-foreground">
					{invoice.invoice_number ?? resolveEngineerName(invoice, { engineerNames: new Map(data.engineers.map((e) => [e.id, e.name])) })}
				</p>
			{/if}
		</div>
	</header>

	<div class="min-h-0 flex-1 pt-2">
		{#if !invoice}
			<p class="text-sm text-muted-foreground">請求書が見つかりません</p>
			<Button variant="link" class="h-auto p-0" onclick={() => goto('/invoices')}>一覧に戻る</Button>
		{:else}
			{#key invoice.id}
				<InvoiceForm
					engineers={data.engineers}
					projects={data.projects}
					orders={data.orders}
					initialData={invoice}
					onSubmit={handleSubmit}
					{isSubmitting}
					submitLabel="更新する"
				/>
			{/key}
		{/if}
	</div>
</div>
