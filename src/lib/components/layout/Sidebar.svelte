<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Users from '@lucide/svelte/icons/users';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import FileText from '@lucide/svelte/icons/file-text';
	import Settings from '@lucide/svelte/icons/settings';
	import X from '@lucide/svelte/icons/x';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	type NavItem = {
		path: string;
		label: string;
		icon: Component;
	};

	let {
		isOpen = false,
		onToggle
	}: {
		isOpen?: boolean;
		onToggle: () => void;
	} = $props();

	const navItems: NavItem[] = [
		{ path: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
		{ path: '/engineers', label: '要員一覧', icon: Users },
		{ path: '/engineers/new', label: '要員登録', icon: UserPlus },
		{ path: '/projects', label: '案件一覧', icon: Briefcase },
		{ path: '/orders', label: '注文書一覧', icon: ClipboardList },
		{ path: '/invoices', label: '請求書一覧', icon: FileText },
		{ path: '/settings', label: '会社設定', icon: Settings }
	];

	function handleNavClick() {
		if (typeof window !== 'undefined' && window.innerWidth < 1024) {
			onToggle();
		}
	}
</script>

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/30 lg:hidden"
		aria-label="メニューを閉じる"
		onclick={onToggle}
	></button>
{/if}

<aside
	class={cn(
		'fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0',
		isOpen ? 'translate-x-0' : '-translate-x-full'
	)}
>
	<div class="flex h-16 items-center justify-between border-b border-border px-6">
		<div class="flex items-center gap-2.5">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
				<Users class="h-4 w-4 text-primary-foreground" />
			</div>
			<span class="text-base font-semibold tracking-tight">SES要員管理</span>
		</div>
		<Button variant="ghost" size="icon" class="lg:hidden" onclick={onToggle}>
			<X class="h-5 w-5" />
		</Button>
	</div>

	<nav class="space-y-1 p-4">
		{#each navItems as item (item.path)}
			{@const isActive = page.url.pathname === item.path}
			<a
				href={item.path}
				onclick={handleNavClick}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
					isActive
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-secondary hover:text-foreground'
				)}
			>
				<item.icon class="h-4.5 w-4.5" />
				{item.label}
			</a>
		{/each}
	</nav>
</aside>