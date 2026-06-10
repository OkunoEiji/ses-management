<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { Button } from '$lib/components/ui/button';
	import { theme } from '$lib/stores/theme.svelte';
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={() => theme.toggle()}
	aria-label={theme.isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
>
	{#if theme.isDark}
		<Sun class="h-5 w-5 text-yellow-500" />
	{:else}
		<Moon class="h-5 w-5 text-yellow-500" />
	{/if}
</Button>
