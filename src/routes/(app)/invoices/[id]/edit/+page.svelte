<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import InvoiceForm from '$lib/components/invoices/InvoiceForm.svelte';
	import { invoices, findInvoice, type InvoiceInput } from '$lib/mock/invoices';
	import { applyStatusTimestamps, resolveEngineerName } from '$lib/mock/invoice-utils';

	const id = $derived(page.params.id);
	const invoice = $derived(id ? findInvoice(id) : undefined);

	let isSubmitting = $state(false);

	function handleSubmit(data: InvoiceInput) {
		if (!id || !invoice) return;
		isSubmitting = true;

		const timestamps = applyStatusTimestamps(data, invoice);
		const index = invoices.findIndex((inv) => inv.id === id);
		if (index >= 0) {
			invoices[index] = {
				id,
				...data,
				created_at: invoice.created_at ?? timestamps.updated_at,
				...timestamps
			};
		}

		goto(`/invoices/${id}`);
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="icon" onclick={() => history.back()}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">請求書編集</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{invoice?.invoice_number ?? resolveEngineerName(invoice ?? {}) ?? ''}を編集します
			</p>
		</div>
	</div>

	{#if !invoice}
		<p class="text-muted-foreground">請求書が見つかりません</p>
		<Button variant="link" onclick={() => goto('/invoices')}>一覧に戻る</Button>
	{:else}
		{#key invoice.id}
			<InvoiceForm
				initialData={invoice}
				onSubmit={handleSubmit}
				{isSubmitting}
				submitLabel="更新する"
			/>
		{/key}
	{/if}
</div>
