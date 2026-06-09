<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';

	let {
		skills = $bindable([])
	}: {
		skills?: string[];
	} = $props();

	let draft = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	function addSkill(value?: string) {
		const v = (value ?? draft).trim();
		if (!v || skills.includes(v)) {
			draft = '';
			return;
		}
		skills = [...skills, v];
		draft = '';
	}

	function removeSkill(skill: string) {
		skills = skills.filter((s) => s !== skill);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addSkill();
		}
		if (e.key === 'Backspace' && draft === '' && skills.length > 0) {
			skills = skills.slice(0, -1);
		}
	}

	function focusInput() {
		inputEl?.focus();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="flex min-h-8 cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
	role="presentation"
	onclick={focusInput}
>
	{#each skills as skill (skill)}
		<span
			class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
		>
			{skill}
			<button
				type="button"
				class="inline-flex rounded-sm text-muted-foreground transition-colors hover:text-foreground"
				aria-label="{skill}を削除"
				onclick={(e) => {
					e.stopPropagation();
					removeSkill(skill);
				}}
			>
				<X class="h-3 w-3" />
			</button>
		</span>
	{/each}
	<input
		bind:this={inputEl}
		bind:value={draft}
		onkeydown={onKeydown}
		type="text"
		class="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
		placeholder={skills.length === 0 ? 'スキルを入力して Enter' : '追加…'}
	/>
	<button
		type="button"
		class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
		aria-label="スキルを追加"
		onclick={(e) => {
			e.stopPropagation();
			addSkill();
		}}
	>
		<Plus class="h-3.5 w-3.5" />
	</button>
</div>
