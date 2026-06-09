<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import EngineerForm from '$lib/components/engineers/EngineerForm.svelte';
	import { engineers, findEngineer, type Engineer } from '$lib/mock/engineers';

	const id = $derived(page.params.id);
	const engineer = $derived(id ? findEngineer(id) : undefined);

	let isSubmitting = $state(false);

	function handleSubmit(data: Omit<Engineer, 'id'>) {
		if (!id) return;
		isSubmitting = true;

		const index = engineers.findIndex((e) => e.id === id);
		if (index >= 0) {
			engineers[index] = { id, ...data };
		}

		goto(`/engineers/${id}`);
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="icon" onclick={() => history.back()}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">要員情報の編集</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{engineer?.name ?? ''}の情報を編集します
			</p>
		</div>
	</div>

	{#if !engineer}
		<p class="text-muted-foreground">要員が見つかりません</p>
		<Button variant="link" onclick={() => goto('/engineers')}>一覧に戻る</Button>
	{:else}
		{#key engineer.id}
			<EngineerForm
				initialData={engineer}
				onSubmit={handleSubmit}
				{isSubmitting}
				submitLabel="更新する"
			/>
		{/key}
	{/if}
</div>