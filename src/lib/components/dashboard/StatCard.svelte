<script lang="ts">
	import type { Component } from 'svelte';

	let {
		label,
		value,
		icon: Icon,
		accent = 'bg-primary/10 text-primary'
	}: {
		label: string;
		value: number;
		icon: Component;
		accent?: string;
	} = $props();
</script>

<div class="rounded-xl border bg-card p-6 shadow-xs">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-sm text-muted-foreground">{label}</p>
			<p class="text-3xl font-bold">{value}</p>
		</div>
		<div class={`rounded-lg p-3 ${accent}`}>
			<Icon class="size-5" />
		</div>
	</div>
</div>