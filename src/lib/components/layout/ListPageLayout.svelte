<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		toolbar,
		children
	}: {
		toolbar: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="list-page flex h-full min-h-0 flex-col gap-5 overflow-hidden p-6">
	<div class="shrink-0 space-y-5">
		{@render toolbar()}
	</div>
	<div class="list-page-body min-h-0 flex-1 overflow-y-auto p-0.5">
		{@render children()}
	</div>
</div>
