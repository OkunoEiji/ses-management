<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { theme } from '$lib/stores/theme.svelte';

	let { children } = $props();

	$effect(() => {
		theme.init();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
