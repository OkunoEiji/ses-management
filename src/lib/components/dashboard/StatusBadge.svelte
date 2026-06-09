<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const styles: Record<string, string> = {
		'待機中': 'bg-emerald-100 text-emerald-700',
		'商談中': 'bg-amber-100 text-amber-700',
		'稼働中': 'bg-blue-100 text-blue-700',
		'退場予定': 'bg-red-100 text-red-700'
	};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {styles[status] ?? 'bg-secondary text-secondary-foreground'}">
	{status}
</span>