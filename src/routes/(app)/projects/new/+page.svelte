<script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import ProjectForm from '$lib/components/projects/ProjectForm.svelte';
	import { projects, type Project } from '$lib/mock/projects';

	let isSubmitting = $state(false);

	function handleSubmit(data: Omit<Project, 'id'>) {
		isSubmitting = true;

		const newProject: Project = {
			id: crypto.randomUUID(),
			...data
		};

		projects.push(newProject);
		goto(`/projects/${newProject.id}`);
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center gap-3">
		<Button variant="ghost" size="icon" onclick={() => history.back()}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">案件登録</h1>
			<p class="mt-1 text-sm text-muted-foreground">案件の情報を入力してください</p>
		</div>
	</div>

	<ProjectForm onSubmit={handleSubmit} {isSubmitting} submitLabel="登録する" />
</div>
