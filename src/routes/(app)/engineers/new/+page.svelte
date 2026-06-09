<script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import EngineerForm from '$lib/components/engineers/EngineerForm.svelte';
	import { engineers, type Engineer } from '$lib/mock/engineers';

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

<div class="space-y-6 p-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="icon" onclick={() => history.back()}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">新規要員登録</h1>
			<p class="mt-1 text-sm text-muted-foreground">要員の情報を入力してください</p>
		</div>
	</div>

	<EngineerForm onSubmit={handleSubmit} {isSubmitting} submitLabel="登録する" />
</div>