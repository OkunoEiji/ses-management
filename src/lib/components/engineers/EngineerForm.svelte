<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FormField from '$lib/components/engineers/FormField.svelte';
	import SkillTagInput from '$lib/components/engineers/SkillTagInput.svelte';
	import type { Engineer, Project } from '$lib/types';
	import { calcRates } from '$lib/utils/order-utils';

	type FormTab = 'profile' | 'work' | 'rates';

	const tabOrder: FormTab[] = ['profile', 'work', 'rates'];

	let {
		formId = 'engineer-form',
		projects = [],
		initialData = {},
		onSubmit,
		isSubmitting = false,
		submitLabel = '登録する',
		showFooterSubmit = true
	}: {
		formId?: string;
		projects?: Project[];
		initialData?: Partial<Engineer>;
		onSubmit: (data: Omit<Engineer, 'id'>) => void;
		isSubmitting?: boolean;
		submitLabel?: string;
		showFooterSubmit?: boolean;
	} = $props();

	const tabs: { id: FormTab; label: string; description: string }[] = [
		{ id: 'profile', label: '基本・スキル', description: '氏名・所属・スキル' },
		{ id: 'work', label: '稼働・契約', description: 'ステータス・案件・単価希望' },
		{ id: 'rates', label: '単価条件', description: '請求・支払の精算条件' }
	];

	function formStateFromEngineer(data: Partial<Engineer> = {}) {
		return {
			name: data.name ?? '',
			name_kana: data.name_kana ?? '',
			age: data.age,
			gender: (data.gender ?? '') as Engineer['gender'] | '',
			nearest_station: data.nearest_station ?? '',
			engineer_type: data.engineer_type ?? '自社',
			affiliation_company: data.affiliation_company ?? '',
			parent_company: data.parent_company ?? '',
			project_id: data.project_id ?? '',
			current_project: data.current_project ?? '',
			experience_years: data.experience_years,
			skills: data.skills ?? [],
			skill_summary: data.skill_summary ?? '',
			status: data.status ?? '待機中',
			availability_date: data.availability_date ?? '',
			desired_unit_price: data.desired_unit_price,
			min_unit_price: data.min_unit_price,
			contract_end_date: data.contract_end_date ?? '',
			billing_unit_price: data.billing_unit_price,
			standard_hours_min: data.standard_hours_min ?? 140,
			standard_hours_max: data.standard_hours_max ?? 180,
			hourly_deduction_rate: data.hourly_deduction_rate,
			hourly_overtime_rate: data.hourly_overtime_rate,
			cost_unit_price: data.cost_unit_price,
			cost_deduction_rate: data.cost_deduction_rate,
			cost_overtime_rate: data.cost_overtime_rate,
			remarks: data.remarks ?? ''
		};
	}

	const init = (() => formStateFromEngineer(initialData))();

	let activeTab = $state<FormTab>('profile');
	let name = $state(init.name);
	let name_kana = $state(init.name_kana);
	let age = $state(init.age?.toString() ?? '');
	let gender = $state<Engineer['gender'] | ''>(init.gender);
	let nearest_station = $state(init.nearest_station);
	let engineer_type = $state<Engineer['engineer_type']>(init.engineer_type);
	let affiliation_company = $state(init.affiliation_company);
	let parent_company = $state(init.parent_company);
	let project_id = $state(init.project_id);
	let current_project = $state(init.current_project);
	let experience_years = $state(init.experience_years?.toString() ?? '');
	let skills = $state<string[]>([...init.skills]);
	let skill_summary = $state(init.skill_summary);
	let status = $state<Engineer['status']>(init.status);
	let availability_date = $state(init.availability_date);
	let desired_unit_price = $state(init.desired_unit_price?.toString() ?? '');
	let min_unit_price = $state(init.min_unit_price?.toString() ?? '');
	let contract_end_date = $state(init.contract_end_date);
	let billing_unit_price = $state(init.billing_unit_price?.toString() ?? '');
	let standard_hours_min = $state(String(init.standard_hours_min));
	let standard_hours_max = $state(String(init.standard_hours_max));
	let hourly_deduction_rate = $state(init.hourly_deduction_rate?.toString() ?? '');
	let hourly_overtime_rate = $state(init.hourly_overtime_rate?.toString() ?? '');
	let cost_unit_price = $state(init.cost_unit_price?.toString() ?? '');
	let cost_deduction_rate = $state(init.cost_deduction_rate?.toString() ?? '');
	let cost_overtime_rate = $state(init.cost_overtime_rate?.toString() ?? '');
	let remarks = $state(init.remarks);

	const showAffiliation = $derived(engineer_type === 'BP');
	const activeTabMeta = $derived(tabs.find((t) => t.id === activeTab)!);
	const canGoPrev = $derived(activeTab !== 'profile');
	const canGoNext = $derived(activeTab !== 'rates');

	function goPrev() {
		const i = tabOrder.indexOf(activeTab);
		if (i > 0) activeTab = tabOrder[i - 1];
	}

	function goNext() {
		const i = tabOrder.indexOf(activeTab);
		if (i < tabOrder.length - 1) activeTab = tabOrder[i + 1];
	}

	const selectClass =
		'flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm shadow-xs';
	const textareaClass =
		'flex min-h-[4.5rem] w-full resize-none rounded-lg border border-input bg-background px-2.5 py-2 text-sm shadow-xs leading-relaxed';
	const inputClass = 'h-8 text-sm';
	const sectionTitleClass = 'text-sm font-semibold tracking-tight text-foreground';
	const sectionDescClass = 'text-xs text-muted-foreground';

	function numOrUndefined(v: string): number | undefined {
		if (v.trim() === '') return undefined;
		const n = Number(v);
		return Number.isFinite(n) ? n : undefined;
	}

	function applyBillingRates(up: string, hMin: string, hMax: string) {
		const { deduction, overtime } = calcRates(
			parseFloat(up) || 0,
			parseFloat(hMin) || 0,
			parseFloat(hMax) || 0
		);
		if (deduction > 0) hourly_deduction_rate = String(deduction);
		if (overtime > 0) hourly_overtime_rate = String(overtime);
	}

	function applyCostRates(up: string, hMin: string, hMax: string) {
		const { deduction, overtime } = calcRates(
			parseFloat(up) || 0,
			parseFloat(hMin) || 0,
			parseFloat(hMax) || 0
		);
		if (deduction > 0) cost_deduction_rate = String(deduction);
		if (overtime > 0) cost_overtime_rate = String(overtime);
	}

	function onBillingUnitPriceInput(value: string) {
		billing_unit_price = value;
		applyBillingRates(value, standard_hours_min, standard_hours_max);
	}

	function onBillingHoursInput(key: 'standard_hours_min' | 'standard_hours_max', value: string) {
		if (key === 'standard_hours_min') standard_hours_min = value;
		else standard_hours_max = value;
		applyBillingRates(billing_unit_price, standard_hours_min, standard_hours_max);
	}

	function onCostUnitPriceInput(value: string) {
		cost_unit_price = value;
		applyCostRates(value, standard_hours_min, standard_hours_max);
	}

	function onProjectChange(id: string) {
		project_id = id;
		if (!id) return;
		const proj = projects.find((p) => p.id === id);
		if (!proj) return;
		current_project = proj.name;
		if (proj.client_company) parent_company = proj.client_company;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) {
			activeTab = 'profile';
			return;
		}

		onSubmit({
			name: name.trim(),
			name_kana: name_kana.trim() || undefined,
			age: numOrUndefined(age),
			gender: gender || undefined,
			nearest_station: nearest_station.trim() || undefined,
			engineer_type,
			affiliation_company: affiliation_company.trim() || undefined,
			parent_company: parent_company.trim() || undefined,
			project_id: project_id || undefined,
			current_project: current_project.trim() || undefined,
			experience_years: numOrUndefined(experience_years),
			skills: [...skills],
			skill_summary: skill_summary.trim() || undefined,
			status,
			availability_date: availability_date || undefined,
			desired_unit_price: numOrUndefined(desired_unit_price),
			min_unit_price: numOrUndefined(min_unit_price),
			contract_end_date: contract_end_date || undefined,
			billing_unit_price: numOrUndefined(billing_unit_price),
			standard_hours_min: numOrUndefined(standard_hours_min) ?? 140,
			standard_hours_max: numOrUndefined(standard_hours_max) ?? 180,
			hourly_deduction_rate: numOrUndefined(hourly_deduction_rate),
			hourly_overtime_rate: numOrUndefined(hourly_overtime_rate),
			cost_unit_price: numOrUndefined(cost_unit_price),
			cost_deduction_rate: numOrUndefined(cost_deduction_rate),
			cost_overtime_rate: numOrUndefined(cost_overtime_rate),
			remarks: remarks.trim() || undefined
		});
	}
</script>

<form
	id={formId}
	class="engineer-form-screen flex h-full min-h-0 w-full flex-col gap-3"
	onsubmit={handleSubmit}
>
	<nav class="flex shrink-0 gap-1 rounded-xl bg-muted/50 p-1" aria-label="入力ステップ">
		{#each tabs as tab, i (tab.id)}
			<button
				type="button"
				class="flex min-w-0 flex-1 flex-col items-start rounded-lg px-3 py-2 text-left transition-colors {activeTab ===
				tab.id
					? 'bg-background text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'}"
				aria-current={activeTab === tab.id ? 'step' : undefined}
				onclick={() => (activeTab = tab.id)}
			>
				<span class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
					Step {i + 1}
				</span>
				<span class="text-sm font-semibold leading-tight">{tab.label}</span>
				<span class="hidden truncate text-[11px] text-muted-foreground sm:block">{tab.description}</span>
			</button>
		{/each}
	</nav>

	<div class="engineer-form-panel min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
		<div class="border-b border-border px-5 py-3">
			<h2 class={sectionTitleClass}>{activeTabMeta.label}</h2>
			<p class={sectionDescClass}>{activeTabMeta.description}</p>
		</div>

		<div class="engineer-form-panel-body px-5 py-4">
			{#if activeTab === 'profile'}
				<div class="space-y-6">
					<section class="space-y-3">
						<h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">本人情報</h3>
						<div class="grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-4">
							<FormField label="氏名" forId="name" required>
								<Input id="name" bind:value={name} required class={inputClass} />
							</FormField>
							<FormField label="氏名（カナ）" forId="name_kana">
								<Input id="name_kana" bind:value={name_kana} class={inputClass} />
							</FormField>
							<FormField label="年齢" forId="age">
								<Input id="age" type="number" bind:value={age} class={inputClass} />
							</FormField>
							<FormField label="性別" forId="gender">
								<select id="gender" class={selectClass} bind:value={gender}>
									<option value="">選択</option>
									<option value="男性">男性</option>
									<option value="女性">女性</option>
									<option value="その他">その他</option>
								</select>
							</FormField>
							<FormField label="最寄り駅" forId="nearest_station">
								<Input id="nearest_station" bind:value={nearest_station} class={inputClass} />
							</FormField>
						</div>
					</section>

					<section class="space-y-3">
						<h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">所属・区分</h3>
						<div class="grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-4">
							<FormField label="要員区分" forId="engineer_type">
								<select id="engineer_type" class={selectClass} bind:value={engineer_type}>
									<option value="自社">自社</option>
									<option value="BP">BP</option>
									<option value="フリーランス">フリーランス</option>
								</select>
							</FormField>
							{#if showAffiliation}
								<FormField label="所属会社（BP元）" forId="affiliation_company">
									<Input
										id="affiliation_company"
										bind:value={affiliation_company}
										placeholder="株式会社◯◯"
										class={inputClass}
									/>
								</FormField>
							{/if}
							<FormField label="上位会社（エンド）" forId="parent_company" class={showAffiliation ? '' : 'xl:col-span-2'}>
								<Input
									id="parent_company"
									bind:value={parent_company}
									placeholder="株式会社△△"
									class={inputClass}
								/>
							</FormField>
						</div>
					</section>

					<section class="space-y-3">
						<h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">スキル</h3>
						<div class="grid gap-4 xl:grid-cols-[7rem_1fr]">
							<FormField label="経験年数" forId="experience_years">
								<Input
									id="experience_years"
									type="number"
									bind:value={experience_years}
									class={inputClass}
								/>
							</FormField>
							<FormField label="保有スキル" hint="Enter で追加">
								<SkillTagInput bind:skills />
							</FormField>
						</div>
						<FormField label="スキル概要" forId="skill_summary">
							<textarea id="skill_summary" class={textareaClass} bind:value={skill_summary}></textarea>
						</FormField>
					</section>
				</div>
			{:else if activeTab === 'work'}
				<div class="space-y-6">
					<section class="space-y-3">
						<h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">稼働状況</h3>
						<div class="grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-4">
							<FormField label="ステータス" forId="status" required>
								<select id="status" class={selectClass} bind:value={status}>
									<option value="待機中">待機中</option>
									<option value="商談中">商談中</option>
									<option value="稼働中">稼働中</option>
									<option value="退場予定">退場予定</option>
								</select>
							</FormField>
							<FormField label="稼働可能日" forId="availability_date">
								<Input
									id="availability_date"
									type="date"
									bind:value={availability_date}
									class={inputClass}
								/>
							</FormField>
							<FormField label="契約終了日" forId="contract_end_date">
								<Input
									id="contract_end_date"
									type="date"
									bind:value={contract_end_date}
									class={inputClass}
								/>
							</FormField>
						</div>
					</section>

					<section class="space-y-3">
						<h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">案件</h3>
						<div class="grid grid-cols-2 gap-x-4 gap-y-3">
							<FormField label="担当案件" forId="project_id">
								<select
									id="project_id"
									class={selectClass}
									value={project_id}
									onchange={(e) => onProjectChange(e.currentTarget.value)}
								>
									<option value="">未設定</option>
									{#each projects as proj (proj.id)}
										<option value={proj.id}>{proj.name}</option>
									{/each}
								</select>
							</FormField>
							<FormField label="現在の案件名" forId="current_project" hint="手入力も可">
								<Input id="current_project" bind:value={current_project} class={inputClass} />
							</FormField>
						</div>
					</section>

					<section class="space-y-3">
						<h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">希望単価</h3>
						<div class="grid grid-cols-2 gap-x-4 gap-y-3 xl:max-w-xl">
							<FormField label="希望単価" forId="desired_unit_price" hint="万円/月">
								<Input
									id="desired_unit_price"
									type="number"
									bind:value={desired_unit_price}
									class={inputClass}
								/>
							</FormField>
							<FormField label="下限単価" forId="min_unit_price" hint="万円/月">
								<Input id="min_unit_price" type="number" bind:value={min_unit_price} class={inputClass} />
							</FormField>
						</div>
					</section>

					<FormField label="備考" forId="remarks">
						<textarea id="remarks" class={textareaClass} bind:value={remarks}></textarea>
					</FormField>
				</div>
			{:else}
				<div class="grid h-full gap-5 xl:grid-cols-2">
					<section class="flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
						<div>
							<h3 class={sectionTitleClass}>請求条件</h3>
							<p class={sectionDescClass}>上位会社への請求</p>
						</div>
						<FormField label="請求単価" forId="billing_unit_price" hint="万円/月">
							<Input
								id="billing_unit_price"
								type="number"
								value={billing_unit_price}
								oninput={(e) => onBillingUnitPriceInput(e.currentTarget.value)}
								placeholder="60"
								class={inputClass}
							/>
						</FormField>
						<div class="grid grid-cols-2 gap-3">
							<FormField label="基準時間 下限" forId="standard_hours_min" hint="h/月">
								<Input
									id="standard_hours_min"
									type="number"
									value={standard_hours_min}
									oninput={(e) => onBillingHoursInput('standard_hours_min', e.currentTarget.value)}
									class={inputClass}
								/>
							</FormField>
							<FormField label="基準時間 上限" forId="standard_hours_max" hint="h/月">
								<Input
									id="standard_hours_max"
									type="number"
									value={standard_hours_max}
									oninput={(e) => onBillingHoursInput('standard_hours_max', e.currentTarget.value)}
									class={inputClass}
								/>
							</FormField>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<FormField
								label="控除単価"
								forId="hourly_deduction_rate"
								hint="円/h · 自動計算可"
							>
								<Input
									id="hourly_deduction_rate"
									type="number"
									bind:value={hourly_deduction_rate}
									placeholder="10円切捨"
									class={inputClass}
								/>
							</FormField>
							<FormField
								label="超過単価"
								forId="hourly_overtime_rate"
								hint="円/h · 自動計算可"
							>
								<Input
									id="hourly_overtime_rate"
									type="number"
									bind:value={hourly_overtime_rate}
									placeholder="10円切捨"
									class={inputClass}
								/>
							</FormField>
						</div>
					</section>

					<section class="flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
						<div>
							<h3 class={sectionTitleClass}>支払条件</h3>
							<p class={sectionDescClass}>所属会社への支払</p>
						</div>
						<FormField label="支払単価" forId="cost_unit_price" hint="万円/月">
							<Input
								id="cost_unit_price"
								type="number"
								value={cost_unit_price}
								oninput={(e) => onCostUnitPriceInput(e.currentTarget.value)}
								placeholder="50"
								class={inputClass}
							/>
						</FormField>
						<div class="grid grid-cols-2 gap-3">
							<FormField label="支払控除単価" forId="cost_deduction_rate" hint="円/h">
								<Input
									id="cost_deduction_rate"
									type="number"
									bind:value={cost_deduction_rate}
									class={inputClass}
								/>
							</FormField>
							<FormField label="支払超過単価" forId="cost_overtime_rate" hint="円/h">
								<Input
									id="cost_overtime_rate"
									type="number"
									bind:value={cost_overtime_rate}
									class={inputClass}
								/>
							</FormField>
						</div>
					</section>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex shrink-0 items-center justify-between gap-3">
		<div class="flex gap-2">
			<Button
				type="button"
				variant="outline"
				size="icon"
				class="h-8 w-8"
				disabled={!canGoPrev}
				aria-label="前のステップ"
				onclick={goPrev}
			>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="outline"
				size="icon"
				class="h-8 w-8"
				disabled={!canGoNext}
				aria-label="次のステップ"
				onclick={goNext}
			>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>
		{#if showFooterSubmit}
			<Button type="submit" class="h-8 px-5" disabled={isSubmitting}>
				{isSubmitting ? '保存中...' : submitLabel}
			</Button>
		{/if}
	</div>
</form>

<style>
	.engineer-form-panel-body {
		height: calc(100% - 3.75rem);
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-gutter: stable;
	}
</style>
