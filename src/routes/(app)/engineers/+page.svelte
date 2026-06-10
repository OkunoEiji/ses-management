<script lang="ts">
    import { goto } from "$app/navigation";
    import UserPlus from '@lucide/svelte/icons/user-plus';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import StatusBadge from '$lib/components/dashboard/StatusBadge.svelte';
	import ListPageLayout from '$lib/components/layout/ListPageLayout.svelte';
	import { engineers as initialEngineers, type Engineer } from '$lib/mock/engineers';
    
    let engineerList = $state<Engineer[]>(initialEngineers);

    // フィルター
    let search = $state('');
    let statusFilter = $state<'all' | Engineer['status']>('all');
    let typeFilter = $state<'all' | Engineer['engineer_type']>('all');

    // 削除ダイアログ
    let deleteTarget = $state<Engineer | null>(null);
    let deleteDialogOpen = $state(false);

    // ReactのuseMemo相当
    const filtered = $derived(
        engineerList.filter((engineer) => {
            if (statusFilter !== 'all' && engineer.status !== statusFilter) return false;
            if (typeFilter !== 'all' && engineer.engineer_type !== typeFilter) return false;

            if (search.trim()) {
                const query = search.trim().toLowerCase();
                const matchName = engineer.name.toLocaleLowerCase().includes(query);
                const matchKana = engineer.name_kana?.toLocaleLowerCase().includes(query) ?? false;
                const matchSkill = engineer.skills.some((skill) => skill.toLowerCase().includes(query));

                if (!matchName && !matchKana && !matchSkill) return false;
            }

            return true;
        })
    );

    function openDelete(engineer: Engineer) {
        deleteTarget = engineer;
        deleteDialogOpen = true;
    }

    function closeDelete() {
        deleteDialogOpen = false;
        deleteTarget = null;
    }

    function handleDelete() {
        if (!deleteTarget) return;

        engineerList = engineerList.filter((engineer) => engineer.id !== deleteTarget!.id);
        closeDelete();
    }

    const selectClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs';
</script>


<ListPageLayout>
	{#snippet toolbar()}
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">要員一覧</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					{engineerList.length}名の要員が登録されています
				</p>
			</div>
			<Button class="gap-2" onclick={() => goto('/engineers/new')}>
				<UserPlus class="h-4 w-4" />
				新規登録
			</Button>
		</div>
		<div class="grid gap-3 sm:grid-cols-3">
			<Input placeholder="名前・スキルで検索" bind:value={search} />
			<select class={selectClass} bind:value={statusFilter}>
				<option value="all">ステータス: すべて</option>
				<option value="待機中">待機中</option>
				<option value="商談中">商談中</option>
				<option value="稼働中">稼働中</option>
				<option value="退場予定">退場予定</option>
			</select>
			<select class={selectClass} bind:value={typeFilter}>
				<option value="all">種別: すべて</option>
				<option value="自社">自社</option>
				<option value="BP">BP</option>
				<option value="フリーランス">フリーランス</option>
			</select>
		</div>
	{/snippet}
	{#snippet children()}
	<div class="rounded-xl border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>名前</Table.Head>
					<Table.Head>ステータス</Table.Head>
					<Table.Head>種別</Table.Head>
					<Table.Head>スキル</Table.Head>
					<Table.Head>希望単価</Table.Head>
					<Table.Head class="w-20"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if filtered.length === 0}
					<Table.Row>
						<Table.Cell colspan={6} class="py-8 text-center text-muted-foreground">
							該当する要員はありません
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each filtered as eng (eng.id)}
						<Table.Row
							class="cursor-pointer"
							onclick={() => goto(`/engineers/${eng.id}`)}
						>
							<Table.Cell>
								<div class="font-medium">{eng.name}</div>
								{#if eng.name_kana}
									<div class="text-xs text-muted-foreground">{eng.name_kana}</div>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<StatusBadge status={eng.status} />
							</Table.Cell>
							<Table.Cell>{eng.engineer_type}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each eng.skills.slice(0, 3) as skill}
										<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
											{skill}
										</span>
									{/each}
								</div>
							</Table.Cell>
							<Table.Cell>
								{eng.desired_unit_price != null ? `${eng.desired_unit_price}万/月` : '-'}
							</Table.Cell>
							<Table.Cell>
								<Button
									variant="ghost"
									size="icon"
									onclick={(e) => {
										e.stopPropagation();
										openDelete(eng);
									}}
								>
									<Trash2 class="h-4 w-4 text-destructive" />
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
	{/snippet}
</ListPageLayout>

<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>要員を削除しますか？</Dialog.Title>
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