<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import EngineerForm from '$lib/components/engineers/EngineerForm.svelte';
	import { submitJsonAction } from '$lib/api/submit';
	import type { Engineer } from '$lib/types';

	let { data } = $props();
	const formId = 'engineer-edit-form';
	const id = $derived(page.params.id);
	const engineer = $derived(data.engineer);

	let isSubmitting = $state(false);

	async function handleSubmit(formData: Omit<Engineer, 'id'>) {
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

<div class="document-form-page flex h-full min-h-0 flex-col overflow-hidden p-4">
	<header class="flex shrink-0 items-center gap-2 border-b border-border pb-3">
		<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" onclick={() => history.back()}>
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div class="min-w-0">
			<h1 class="text-lg font-bold tracking-tight">要員情報の編集</h1>
			<p class="truncate text-xs text-muted-foreground">
				{engineer?.name ?? ''} — タブを切り替えて各項目を編集できます
			</p>
		</div>
	</header>

	<div class="min-h-0 flex-1 pt-3">
		{#if !engineer}
			<div class="py-16 text-center text-muted-foreground">
				<p>要員が見つかりません</p>
				<Button variant="link" onclick={() => goto('/engineers')}>一覧に戻る</Button>
			</div>
		{:else}
			{#key engineer.id}
				<EngineerForm
					{formId}
					projects={data.projects}
					initialData={engineer}
					onSubmit={handleSubmit}
					{isSubmitting}
					submitLabel="更新する"
				/>
			{/key}
		{/if}
	</div>
</div>
