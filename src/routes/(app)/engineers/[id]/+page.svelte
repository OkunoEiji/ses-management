<script lang="ts">
    import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import FileText from '@lucide/svelte/icons/file-text';
	import Receipt from '@lucide/svelte/icons/receipt';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Building2 from '@lucide/svelte/icons/building-2';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import StatusBadge from '$lib/components/dashboard/StatusBadge.svelte';
	let { data } = $props();
	const id = $derived(page.params.id);
	const engineer = $derived(data.engineer);
	
    function formatDate(value?: string) {
		if (!value) return '';
		return new Date(value).toLocaleDateString('ja-JP');
	}
</script>

<div class="space-y-6 p-6 max-w-3xl">
	{#if !engineer}
		<div class="py-16 text-center text-muted-foreground">
			<p>要員が見つかりません</p>
			<Button variant="link" onclick={() => goto('/engineers')}>一覧に戻る</Button>
		</div>
	{:else}
		{@const e = engineer}
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div class="flex items-center gap-3">
				<Button variant="ghost" size="icon" onclick={() => history.back()}>
					<ArrowLeft class="h-5 w-5" />
				</Button>
				<div>
					<div class="flex flex-wrap items-center gap-3">
						<h1 class="text-2xl font-bold tracking-tight">{e.name}</h1>
						<StatusBadge status={e.status} />
					</div>
					{#if e.name_kana}
						<p class="mt-0.5 text-sm text-muted-foreground">{e.name_kana}</p>
					{/if}
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" class="gap-2" onclick={() => goto(`/engineers/${id}/skill-sheet`)}>
					<FileText class="h-4 w-4" /> スキルシート
				</Button>
				<Button variant="outline" class="gap-2" onclick={() => goto(`/invoices/new?engineer_id=${id}`)}>
					<Receipt class="h-4 w-4" /> 請求書作成
				</Button>
				<Button variant="outline" class="gap-2" onclick={() => goto(`/engineers/${id}/edit`)}>
					<Pencil class="h-4 w-4" /> 編集
				</Button>
			</div>
		</div>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#if e.age != null}
				<Card.Root class="p-4">
					<p class="text-xs text-muted-foreground">年齢</p>
					<p class="mt-1 text-lg font-semibold">{e.age}歳</p>
				</Card.Root>
			{/if}
			{#if e.experience_years != null}
				<Card.Root class="p-4">
					<p class="text-xs text-muted-foreground">経験年数</p>
					<p class="mt-1 text-lg font-semibold">{e.experience_years}年</p>
				</Card.Root>
			{/if}
			{#if e.desired_unit_price != null}
				<Card.Root class="p-4">
					<p class="text-xs text-muted-foreground">希望単価</p>
					<p class="mt-1 text-lg font-semibold">{e.desired_unit_price}万/月</p>
				</Card.Root>
			{/if}
			{#if e.min_unit_price != null}
				<Card.Root class="p-4">
					<p class="text-xs text-muted-foreground">下限単価</p>
					<p class="mt-1 text-lg font-semibold">{e.min_unit_price}万/月</p>
				</Card.Root>
			{/if}
		</div>
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base">基本情報</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#if e.gender}
						<div>
							<p class="text-xs text-muted-foreground">性別</p>
							<p class="mt-0.5 text-sm font-medium">{e.gender}</p>
						</div>
					{/if}
					{#if e.nearest_station}
						<div class="flex items-start gap-2">
							<MapPin class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">最寄り駅</p>
								<p class="mt-0.5 text-sm font-medium">{e.nearest_station}</p>
							</div>
						</div>
					{/if}
					<div class="flex items-start gap-2">
						<Building2 class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
						<div>
							<p class="text-xs text-muted-foreground">要員区分</p>
							<p class="mt-0.5 text-sm font-medium">
								{e.engineer_type}{e.affiliation_company ? ` / ${e.affiliation_company}` : ''}
							</p>
						</div>
					</div>
					{#if e.parent_company}
						<div>
							<p class="text-xs text-muted-foreground">上位会社</p>
							<p class="mt-0.5 text-sm font-medium">{e.parent_company}</p>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base">スキル</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if e.skills.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each e.skills as skill}
							<Badge variant="secondary">{skill}</Badge>
						{/each}
					</div>
				{/if}
				{#if e.skill_summary}
					{#if e.skills.length > 0}<hr class="border-border" />{/if}
					<div>
						<p class="mb-1 text-xs text-muted-foreground">スキル概要</p>
						<p class="whitespace-pre-wrap text-sm">{e.skill_summary}</p>
					</div>
				{/if}
				{#if e.skills.length === 0 && !e.skill_summary}
					<p class="text-sm text-muted-foreground">スキル情報が未登録です</p>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base">契約・稼働情報</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#if e.availability_date}
						<div class="flex items-start gap-2">
							<Calendar class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">稼働可能日</p>
								<p class="mt-0.5 text-sm font-medium">{formatDate(e.availability_date)}</p>
							</div>
						</div>
					{/if}
					{#if e.current_project}
						<div class="flex items-start gap-2">
							<Briefcase class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">現在の案件</p>
								<p class="mt-0.5 text-sm font-medium">{e.current_project}</p>
							</div>
						</div>
					{/if}
					{#if e.contract_end_date}
						<div class="flex items-start gap-2">
							<Calendar class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">契約終了日</p>
								<p class="mt-0.5 text-sm font-medium">{formatDate(e.contract_end_date)}</p>
							</div>
						</div>
					{/if}
				</div>
				{#if e.remarks}
					<div class="mt-4 rounded-lg bg-muted/50 p-3">
						<p class="mb-1 text-xs text-muted-foreground">備考</p>
						<p class="whitespace-pre-wrap text-sm">{e.remarks}</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>