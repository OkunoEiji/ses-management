<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		forId,
		required = false,
		hint,
		class: className = '',
		children
	}: {
		label: string;
		forId?: string;
		required?: boolean;
		hint?: string;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<div class="space-y-1.5 {className}">
	<div class="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
		<label class="text-xs font-medium text-foreground" for={forId}>
			{label}
			{#if required}
				<span class="text-destructive">*</span>
			{/if}
		</label>
		{#if hint}
			<span class="text-[11px] text-muted-foreground">{hint}</span>
		{/if}
	</div>
	{@render children()}
</div>
