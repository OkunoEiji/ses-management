<script lang="ts">
	import LogOut from '@lucide/svelte/icons/log-out';
	import { Button } from '$lib/components/ui/button';
</script>

<form method="POST" action="/logout">
	<Button type="submit" variant="ghost" size="icon" aria-label="ログアウト">
		<LogOut class="h-5 w-5" />
	</Button>
</form>
