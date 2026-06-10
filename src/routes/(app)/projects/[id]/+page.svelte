<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Users from '@lucide/svelte/icons/users';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import StatusBadge from '$lib/components/dashboard/StatusBadge.svelte';
	import type { ProjectStatus } from '$lib/types';

	let { data } = $props();
	const id = $derived(page.params.id);
	const project = $derived(data.project);
	const assignedEngineers = $derived(data.engineers);

	const statusStyles: Record<ProjectStatus, string> = {
		商談中: 'bg-amber-50 text-amber-700 border-amber-200',
		稼働中: 'bg-blue-50 text-blue-700 border-blue-200',
		終了: 'bg-gray-100 text-gray-600 border-gray-200'
	};

	function displayStatus(status?: ProjectStatus) {
		return status ?? '商談中';
	}

	function formatDate(value?: string | null) {
		if (!value) return '';
		return new Date(value).toLocaleDateString('ja-JP');
	}
</script>

<div class="max-w-3xl space-y-6 p-6">
	{#if !project}
		<div class="py-16 text-center text-muted-foreground">
			<p>案件が見つかりません</p>
			<Button variant="link" onclick={() => goto('/projects')}>一覧に戻る</Button>
		</div>
	{:else}
		{@const p = project}
		{@const status = displayStatus(p.status)}

		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<Button variant="ghost" size="icon" onclick={() => history.back()}>
					<ArrowLeft class="h-5 w-5" />
				</Button>
				<div>
					<div class="flex flex-wrap items-center gap-3">
						<h1 class="text-2xl font-bold tracking-tight">{p.name}</h1>
						<Badge variant="outline" class={statusStyles[status]}>{status}</Badge>
					</div>
					{#if p.work_location}
						<p class="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
							<MapPin class="h-3 w-3" />
							{p.work_location}
						</p>
					{/if}
				</div>
			</div>
			<Button variant="outline" class="gap-2" onclick={() => goto(`/projects/${id}/edit`)}>
				<Pencil class="h-4 w-4" />
				編集
			</Button>
		</div>

		{#if p.start_date || p.end_date}
			<div class="flex gap-4 text-sm text-muted-foreground">
				{#if p.start_date}
					<span>開始：{formatDate(p.start_date)}</span>
				{/if}
				{#if p.end_date}
					<span>終了：{formatDate(p.end_date)}</span>
				{/if}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="flex items-center gap-2 text-sm font-semibold">
						<Building2 class="h-4 w-4" />
						上位会社
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-2 text-sm">
					{#if p.client_company}
						<p class="font-semibold">{p.client_company}</p>
					{/if}
					{#if p.client_address}
						<p class="text-muted-foreground">{p.client_address}</p>
					{/if}
					{#if p.client_company || p.client_address}
						<hr class="border-border" />
					{/if}
					{#if p.client_contact_name}
						<p class="font-medium">担当：{p.client_contact_name}</p>
					{/if}
					{#if p.client_contact_tel}
						<p class="flex items-center gap-1 text-muted-foreground">
							<Phone class="h-3 w-3" />
							{p.client_contact_tel}
						</p>
					{/if}
					{#if p.client_contact_email}
						<p class="flex items-center gap-1 text-muted-foreground">
							<Mail class="h-3 w-3" />
							{p.client_contact_email}
						</p>
					{/if}
					{#if !p.client_company && !p.client_address && !p.client_contact_name && !p.client_contact_tel && !p.client_contact_email}
						<p class="text-muted-foreground">未登録</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="flex items-center gap-2 text-sm font-semibold">
						<Building2 class="h-4 w-4" />
						仲介会社（請求先）
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-2 text-sm">
					{#if p.agency_company}
						<p class="font-semibold">{p.agency_company}</p>
					{/if}
					{#if p.agency_address}
						<p class="text-muted-foreground">{p.agency_address}</p>
					{/if}
					{#if p.agency_company || p.agency_address}
						<hr class="border-border" />
					{/if}
					{#if p.agency_contact_name}
						<p class="font-medium">担当：{p.agency_contact_name}</p>
					{/if}
					{#if p.agency_contact_email}
						<p class="flex items-center gap-1 text-muted-foreground">
							<Mail class="h-3 w-3" />
							{p.agency_contact_email}
						</p>
					{/if}
					{#if !p.agency_company && !p.agency_address && !p.agency_contact_name && !p.agency_contact_email}
						<p class="text-muted-foreground">未登録</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="flex items-center gap-2 text-sm font-semibold">
					<Users class="h-4 w-4" />
					アサイン要員（{assignedEngineers.length}名）
				</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if assignedEngineers.length === 0}
					<p class="text-sm text-muted-foreground">要員は紐づいていません</p>
				{:else}
					<div class="space-y-2">
						{#each assignedEngineers as eng (eng.id)}
							<button
								type="button"
								class="flex w-full cursor-pointer items-center justify-between rounded-lg bg-muted/50 p-2 text-left transition-colors hover:bg-muted"
								onclick={() => goto(`/engineers/${eng.id}`)}
							>
								<p class="text-sm font-medium">{eng.name}</p>
								<StatusBadge status={eng.status} />
							</button>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		{#if p.remarks}
			<Card.Root>
				<Card.Content class="pt-4">
					<p class="mb-1 text-xs text-muted-foreground">備考</p>
					<p class="whitespace-pre-wrap text-sm">{p.remarks}</p>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
