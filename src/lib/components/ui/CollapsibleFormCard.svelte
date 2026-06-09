<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import * as Card from '$lib/components/ui/card';

	let {
		title,
		open = $bindable(true),
		contentClass = 'px-3 py-1.5',
		children
	}: {
		title: string;
		open?: boolean;
		contentClass?: string;
		children: Snippet;
	} = $props();
</script>

<Card.Root size="sm" class="gap-0 overflow-hidden rounded-xl border border-border bg-card py-0 shadow-xs ring-0">
	<Card.Header
		class="flex flex-row items-center justify-between gap-2 border-border px-3 pt-1.5 pb-1 {open
			? 'border-b'
			: ''}"
	>
		<Card.Title class="text-xs font-semibold">{title}</Card.Title>
		<button
			type="button"
			class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
			aria-expanded={open}
			aria-label={open ? `${title}を閉じる` : `${title}を開く`}
			onclick={() => (open = !open)}
		>
			<ChevronDown class="h-3.5 w-3.5 transition-transform {open ? 'rotate-180' : ''}" />
		</button>
	</Card.Header>
	{#if open}
		<Card.Content class={contentClass}>
			{@render children()}
		</Card.Content>
	{/if}
</Card.Root>
