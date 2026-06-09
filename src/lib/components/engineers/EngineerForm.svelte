<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import type { Engineer } from '$lib/mock/engineers';

	export type EngineerFormData = Partial<
		Omit<Engineer, 'id' | 'skills'> & { skillsText: string }
	>;

	let {
		initialData = {},
		onSubmit,
		isSubmitting = false,
		submitLabel = '登録する'
	}: {
		initialData?: Partial<Engineer>;
		onSubmit: (data: Omit<Engineer, 'id'>) => void;
		isSubmitting?: boolean;
		submitLabel?: string;
	} = $props();

    function formStateFromEngineer(data: Partial<Engineer> = {}) {
		return {
			name: data.name ?? '',
			name_kana: data.name_kana ?? '',
			status: data.status ?? '待機中',
			engineer_type: data.engineer_type ?? '自社',
			gender: (data.gender ?? '') as Engineer['gender'] | '',
			age: data.age,
			nearest_station: data.nearest_station ?? '',
			experience_years: data.experience_years,
			desired_unit_price: data.desired_unit_price,
			min_unit_price: data.min_unit_price,
			availability_date: data.availability_date ?? '',
			skills: data.skills ?? [],
			skill_summary: data.skill_summary ?? '',
			affiliation_company: data.affiliation_company ?? '',
			remarks: data.remarks ?? ''
		};
	}
	// $props() のあと:
	const init = (() => formStateFromEngineer(initialData))();
	let name = $state(init.name);
	let name_kana = $state(init.name_kana);
	let status = $state<Engineer['status']>(init.status);
	let engineer_type = $state<Engineer['engineer_type']>(init.engineer_type);
	let gender = $state<Engineer['gender'] | ''>(init.gender);
	let age = $state(init.age?.toString() ?? '');
	let nearest_station = $state(init.nearest_station);
	let experience_years = $state(init.experience_years?.toString() ?? '');
	let desired_unit_price = $state(init.desired_unit_price?.toString() ?? '');
	let min_unit_price = $state(init.min_unit_price?.toString() ?? '');
	let availability_date = $state(init.availability_date);
	let skillsText = $state(init.skills.join(', '));
	let skill_summary = $state(init.skill_summary);
	let affiliation_company = $state(init.affiliation_company);
	let remarks = $state(init.remarks);

	const selectClass =
		'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs';
	const labelClass = 'text-sm font-medium';

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;

		onSubmit({
			name: name.trim(),
			name_kana: name_kana.trim() || undefined,
			status,
			engineer_type,
			gender: gender || undefined,
			age: age ? Number(age) : undefined,
			nearest_station: nearest_station.trim() || undefined,
			experience_years: experience_years ? Number(experience_years) : undefined,
			desired_unit_price: desired_unit_price ? Number(desired_unit_price) : undefined,
			min_unit_price: min_unit_price ? Number(min_unit_price) : undefined,
			availability_date: availability_date || undefined,
			skills: skillsText
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			skill_summary: skill_summary.trim() || undefined,
			affiliation_company: affiliation_company.trim() || undefined,
			remarks: remarks.trim() || undefined
		});
	}
</script>

<form class="max-w-2xl space-y-6" onsubmit={handleSubmit}>
	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label class={labelClass} for="name">氏名 *</label>
			<Input id="name" bind:value={name} required class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="name_kana">ふりがな</label>
			<Input id="name_kana" bind:value={name_kana} class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="status">ステータス *</label>
			<select id="status" class={selectClass} bind:value={status}>
				<option value="待機中">待機中</option>
				<option value="商談中">商談中</option>
				<option value="稼働中">稼働中</option>
				<option value="退場予定">退場予定</option>
			</select>
		</div>
		<div>
			<label class={labelClass} for="engineer_type">要員区分 *</label>
			<select id="engineer_type" class={selectClass} bind:value={engineer_type}>
				<option value="自社">自社</option>
				<option value="BP">BP</option>
				<option value="フリーランス">フリーランス</option>
			</select>
		</div>
		<div>
			<label class={labelClass} for="gender">性別</label>
			<select id="gender" class={selectClass} bind:value={gender}>
				<option value="">未選択</option>
				<option value="男性">男性</option>
				<option value="女性">女性</option>
				<option value="その他">その他</option>
			</select>
		</div>
		<div>
			<label class={labelClass} for="age">年齢</label>
			<Input id="age" type="number" bind:value={age} class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="nearest_station">最寄り駅</label>
			<Input id="nearest_station" bind:value={nearest_station} class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="experience_years">経験年数</label>
			<Input id="experience_years" type="number" bind:value={experience_years} class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="desired_unit_price">希望単価（万/月）</label>
			<Input id="desired_unit_price" type="number" bind:value={desired_unit_price} class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="min_unit_price">下限単価（万/月）</label>
			<Input id="min_unit_price" type="number" bind:value={min_unit_price} class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="availability_date">稼働可能日</label>
			<Input id="availability_date" type="date" bind:value={availability_date} class="mt-1" />
		</div>
		<div>
			<label class={labelClass} for="affiliation_company">所属会社</label>
			<Input id="affiliation_company" bind:value={affiliation_company} class="mt-1" />
		</div>
		<div class="sm:col-span-2">
			<label class={labelClass} for="skills">スキル（カンマ区切り）</label>
			<Input id="skills" bind:value={skillsText} class="mt-1" placeholder="Java, Spring, AWS" />
		</div>
		<div class="sm:col-span-2">
			<label class={labelClass} for="skill_summary">スキル概要</label>
			<textarea
				id="skill_summary"
				class="{selectClass} min-h-24"
				bind:value={skill_summary}
			></textarea>
		</div>
		<div class="sm:col-span-2">
			<label class={labelClass} for="remarks">備考</label>
			<textarea id="remarks" class="{selectClass} min-h-20" bind:value={remarks}></textarea>
		</div>
	</div>

	<Button type="submit" disabled={isSubmitting}>
		{isSubmitting ? '保存中...' : submitLabel}
	</Button>
</form>