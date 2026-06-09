<script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import EngineerForm from '$lib/components/engineers/EngineerForm.svelte';
	import { engineers, type Engineer } from '$lib/mock/engineers';

	const formId = 'engineer-new-form';
	let isSubmitting = $state(false);

	function handleSubmit(data: Omit<Engineer, 'id'>) {
		isSubmitting = true;

		const newEngineer: Engineer = {
			id: crypto.randomUUID(),
			...data
		};

		engineers.push(newEngineer);
		goto('/engineers');
	}
</script>

<div class="document-form-page flex h-full min-h-0 flex-col overflow-hidden p-4">
	<header class="flex shrink-0 items-center gap-2 border-b border-border pb-3">
		<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" onclick={() => history.back()}>
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div class="min-w-0">
			<h1 class="text-lg font-bold tracking-tight">新規要員登録</h1>
			<p class="text-xs text-muted-foreground">3ステップで入力できます。途中保存は登録時に反映されます。</p>
		</div>
	</header>

	<div class="min-h-0 flex-1 pt-3">
		<EngineerForm
			{formId}
			onSubmit={handleSubmit}
			{isSubmitting}
			submitLabel="登録する"
		/>
	</div>
</div>
