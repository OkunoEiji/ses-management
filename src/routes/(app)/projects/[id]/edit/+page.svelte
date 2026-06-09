<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import ProjectForm from '$lib/components/projects/ProjectForm.svelte';
	import { projects, findProject, type Project } from '$lib/mock/projects';

	const id = $derived(page.params.id);
	const project = $derived(id ? findProject(id) : undefined);

	let isSubmitting = $state(false);

	function handleSubmit(data: Omit<Project, 'id'>) {
		if (!id) return;
		isSubmitting = true;

		const index = projects.findIndex((p) => p.id === id);
		if (index >= 0) {
			projects[index] = { id, ...data };
		}

		goto(`/projects/${id}`);
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="icon" onclick={() => history.back()}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">案件編集</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{project?.name ?? ''}の情報を編集します
			</p>
		</div>
	</div>

	{#if !project}
		<p class="text-muted-foreground">案件が見つかりません</p>
		<Button variant="link" onclick={() => goto('/projects')}>一覧に戻る</Button>
	{:else}
		{#key project.id}
			<ProjectForm
				initialData={project}
				onSubmit={handleSubmit}
				{isSubmitting}
				submitLabel="更新する"
			/>
		{/key}
	{/if}
</div>
