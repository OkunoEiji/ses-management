<script lang="ts">
	import { goto } from '$app/navigation';
	import Plus from '@lucide/svelte/icons/plus';
	import Eye from '@lucide/svelte/icons/eye';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Building2 from '@lucide/svelte/icons/building-2';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import ListPageLayout from '$lib/components/layout/ListPageLayout.svelte';
	import { projects as initialProjects, type Project, type ProjectStatus } from '$lib/mock/projects';

	let projectList = $state<Project[]>(initialProjects);

	let deleteTarget = $state<Project | null>(null);
	let deleteDialogOpen = $state(false);

	const statusStyles: Record<ProjectStatus, string> = {
		商談中: 'bg-amber-50 text-amber-700 border-amber-200',
		稼働中: 'bg-blue-50 text-blue-700 border-blue-200',
		終了: 'bg-gray-100 text-gray-600 border-gray-200'
	};

	function displayStatus(status?: ProjectStatus) {
		return status ?? '商談中';
	}

	function openDelete(project: Project) {
		deleteTarget = project;
		deleteDialogOpen = true;
	}

	function closeDelete() {
		deleteDialogOpen = false;
		deleteTarget = null;
	}

	function handleDelete() {
		if (!deleteTarget) return;
		projectList = projectList.filter((p) => p.id !== deleteTarget!.id);
		closeDelete();
	}
</script>

<ListPageLayout>
	{#snippet toolbar()}
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">案件一覧</h1>
				<p class="mt-1 text-sm text-muted-foreground">{projectList.length}件の案件</p>
			</div>
			<Button class="gap-2" onclick={() => goto('/projects/new')}>
				<Plus class="h-4 w-4" />
				新規登録
			</Button>
		</div>
	{/snippet}
	{#snippet children()}
	{#if projectList.length === 0}
		<Card.Root class="p-16 text-center text-muted-foreground">
			<Building2 class="mx-auto mb-3 h-10 w-10 opacity-30" />
			<p class="font-medium">案件がありません</p>
		</Card.Root>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-border bg-card">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/50">
						<Table.Head class="font-semibold">案件名</Table.Head>
						<Table.Head class="font-semibold">上位会社</Table.Head>
						<Table.Head class="font-semibold">請求先（仲介）</Table.Head>
						<Table.Head class="font-semibold">担当者</Table.Head>
						<Table.Head class="font-semibold">ステータス</Table.Head>
						<Table.Head class="font-semibold">勤務地</Table.Head>
						<Table.Head class="text-center font-semibold">操作</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each projectList as proj (proj.id)}
						<Table.Row
							class="cursor-pointer hover:bg-muted/30"
							onclick={() => goto(`/projects/${proj.id}`)}
						>
							<Table.Cell class="font-medium">{proj.name}</Table.Cell>
							<Table.Cell>{proj.client_company ?? '-'}</Table.Cell>
							<Table.Cell>{proj.agency_company ?? '-'}</Table.Cell>
							<Table.Cell>
								<div>
									{#if proj.client_contact_name}
										<p class="text-sm">{proj.client_contact_name}</p>
									{/if}
									{#if proj.agency_contact_name}
										<p class="text-xs text-muted-foreground">
											{proj.agency_contact_name}（仲介）
										</p>
									{/if}
									{#if !proj.client_contact_name && !proj.agency_contact_name}
										<span class="text-muted-foreground">-</span>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								{@const status = displayStatus(proj.status)}
								<Badge variant="outline" class={statusStyles[status]}>
									{status}
								</Badge>
							</Table.Cell>
							<Table.Cell>{proj.work_location ?? '-'}</Table.Cell>
							<Table.Cell>
								<div
									class="flex justify-center gap-1"
									role="presentation"
									onclick={(e) => e.stopPropagation()}
								>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										onclick={() => goto(`/projects/${proj.id}`)}
									>
										<Eye class="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										onclick={() => goto(`/projects/${proj.id}/edit`)}
									>
										<Pencil class="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-destructive hover:text-destructive"
										onclick={() => openDelete(proj)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
	{/snippet}
</ListPageLayout>

<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>案件を削除しますか？</Dialog.Title>
				<Dialog.Description>
					「{deleteTarget?.name}」を削除します。この操作は取り消せません。
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={closeDelete}>キャンセル</Button>
				<Button variant="destructive" onclick={handleDelete}>削除する</Button>
			</Dialog.Footer>
		</Dialog.Content>
</Dialog.Root>