<script lang="ts">
	import { goto } from '$app/navigation';
	import Users from '@lucide/svelte/icons/users';
	import Clock from '@lucide/svelte/icons/clock';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import * as Card from '$lib/components/ui/card';
    import StatCard from '$lib/components/dashboard/StatCard.svelte';
    import StatusBadge from '$lib/components/dashboard/StatusBadge.svelte';

	// 後で +page.server.ts の data に差し替え
	const engineers = [
		{ id: '1', name: '山田太郎', status: '待機中', skills: ['Java', 'Spring'], desired_unit_price: 70 },
		{ id: '2', name: '佐藤花子', status: '稼働中', skills: ['React', 'TypeScript'], desired_unit_price: 65 },
		{ id: '3', name: '鈴木一郎', status: '退場予定', skills: ['AWS', 'Go'], desired_unit_price: 80 }
	];

	const stats = {
		total: engineers.length,
		waiting: engineers.filter((e) => e.status === '待機中').length,
		negotiating: engineers.filter((e) => e.status === '商談中').length,
		active: engineers.filter((e) => e.status === '稼働中').length,
		leaving: engineers.filter((e) => e.status === '退場予定').length
	};

	const availableSoon = engineers
		.filter((e) => e.status === '待機中' || e.status === '退場予定')
		.slice(0, 5);
</script>

<div class="space-y-6 p-6">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">ダッシュボード</h1>
		<p class="mt-1 text-sm text-muted-foreground">要員の稼働状況を一覧で確認できます</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatCard label="全要員数" value={stats.total} icon={Users} accent="bg-primary/10 text-primary" />
		<StatCard label="待機中" value={stats.waiting} icon={Clock} accent="bg-emerald-100 text-emerald-700" />
		<StatCard label="商談中" value={stats.negotiating} icon={TrendingUp} accent="bg-amber-100 text-amber-700" />
		<StatCard label="稼働中" value={stats.active} icon={Briefcase} accent="bg-blue-100 text-blue-700" />
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base font-semibold">アサイン可能な要員</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if availableSoon.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">該当する要員はありません</p>
				{:else}
					<div class="space-y-3">
						{#each availableSoon as eng (eng.id)}
							<button
								type="button"
								class="flex w-full cursor-pointer items-center justify-between rounded-lg bg-muted/50 p-3 text-left transition-colors hover:bg-muted"
								onclick={() => goto(`/engineers/${eng.id}`)}
							>
								<div>
									<p class="text-sm font-medium">{eng.name}</p>
									<div class="mt-1 flex flex-wrap gap-1">
										{#each (eng.skills ?? []).slice(0, 3) as skill}
											<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
												{skill}
											</span>
										{/each}
									</div>
								</div>
								<div class="text-right">
									<StatusBadge status={eng.status} />
									{#if eng.desired_unit_price}
										<p class="mt-1 text-xs text-muted-foreground">{eng.desired_unit_price}万/月</p>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base font-semibold">ステータス内訳</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each [
						{ label: '待機中', count: stats.waiting, color: 'bg-emerald-500' },
						{ label: '商談中', count: stats.negotiating, color: 'bg-amber-500' },
						{ label: '稼働中', count: stats.active, color: 'bg-blue-500' },
						{ label: '退場予定', count: stats.leaving, color: 'bg-red-500' }
					] as item}
						<div class="space-y-1.5">
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">{item.label}</span>
								<span class="font-medium">{item.count}名</span>
							</div>
							<div class="h-2 overflow-hidden rounded-full bg-muted">
								<div
									class="h-full rounded-full transition-all duration-500 {item.color}"
									style="width: {stats.total ? (item.count / stats.total) * 100 : 0}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>