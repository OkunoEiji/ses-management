<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type {
		Order,
		OrderStatus,
		OrderType,
		ContractType,
		Transportation
	} from '$lib/mock/orders';
	import { engineers } from '$lib/mock/engineers';
	import { projects } from '$lib/mock/projects';
	import {
		NOTES_DEFAULT,
		generateOrderNumber,
		calcRates,
		calcOrderAmounts
	} from '$lib/mock/order-utils';
	import { today } from '$lib/utils';

	let {
		initialData = {},
		onSubmit,
		isSubmitting = false,
		submitLabel = '作成する'
	}: {
		initialData?: Partial<Order>;
		onSubmit: (data: Omit<Order, 'id'>) => void;
		isSubmitting?: boolean;
		submitLabel?: string;
	} = $props();

	const isEdit = $derived(!!initialData.id);

	function formStateFromOrder(data: Partial<Order> = {}) {
		const merged = { notes: NOTES_DEFAULT, ...data };
		return {
			order_number: merged.order_number ?? '',
			order_type: (merged.order_type ?? '注文書') as OrderType,
			issue_date: merged.issue_date ?? today(),
			project_id: merged.project_id ?? '',
			project_name: merged.project_name ?? '',
			engineer_id: merged.engineer_id ?? '',
			engineer_name: merged.engineer_name ?? '',
			client_company: merged.client_company ?? '',
			engineer_affiliation_company: merged.engineer_affiliation_company ?? '',
			engineer_parent_company: merged.engineer_parent_company ?? '',
			unit_price: merged.unit_price != null ? String(merged.unit_price) : '',
			months: merged.months != null ? String(merged.months) : '1',
			period_start: merged.period_start ?? '',
			period_end: merged.period_end ?? '',
			standard_hours_min: String(merged.standard_hours_min ?? 140),
			standard_hours_max: String(merged.standard_hours_max ?? 180),
			overtime_rate: merged.overtime_rate != null ? String(merged.overtime_rate) : '',
			deduction_rate: merged.deduction_rate != null ? String(merged.deduction_rate) : '',
			cost_unit_price: merged.cost_unit_price != null ? String(merged.cost_unit_price) : '',
			cost_deduction_rate:
				merged.cost_deduction_rate != null ? String(merged.cost_deduction_rate) : '',
			cost_overtime_rate: merged.cost_overtime_rate != null ? String(merged.cost_overtime_rate) : '',
			contract_type: (merged.contract_type ?? '準委任') as ContractType,
			settlement_unit: merged.settlement_unit ?? '15分　日/月共に',
			transportation: (merged.transportation ?? '基本単価に含む') as Transportation,
			deliverable: merged.deliverable ?? '作業報告書',
			status: (merged.status ?? '下書き') as OrderStatus,
			notes: merged.notes ?? NOTES_DEFAULT
		};
	}

	const init = formStateFromOrder(initialData);

	let order_number = $state(
		init.order_number || (!initialData.id ? generateOrderNumber(init.order_type, 0) : '')
	);
	let order_type = $state<OrderType>(init.order_type);
	let issue_date = $state(init.issue_date);
	let project_id = $state(init.project_id);
	let project_name = $state(init.project_name);
	let engineer_id = $state(init.engineer_id);
	let engineer_name = $state(init.engineer_name);
	let client_company = $state(init.client_company);
	let engineer_affiliation_company = $state(init.engineer_affiliation_company);
	let engineer_parent_company = $state(init.engineer_parent_company);
	let unit_price = $state(init.unit_price);
	let months = $state(init.months);
	let period_start = $state(init.period_start);
	let period_end = $state(init.period_end);
	let standard_hours_min = $state(init.standard_hours_min);
	let standard_hours_max = $state(init.standard_hours_max);
	let overtime_rate = $state(init.overtime_rate);
	let deduction_rate = $state(init.deduction_rate);
	let cost_unit_price = $state(init.cost_unit_price);
	let cost_deduction_rate = $state(init.cost_deduction_rate);
	let cost_overtime_rate = $state(init.cost_overtime_rate);
	let contract_type = $state<ContractType>(init.contract_type);
	let settlement_unit = $state(init.settlement_unit);
	let transportation = $state<Transportation>(init.transportation);
	let deliverable = $state(init.deliverable);
	let status = $state<OrderStatus>(init.status);
	let notes = $state(init.notes);

	const selectClass =
		'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs';
	const textareaClass = selectClass + ' min-h-24 py-2';
	const labelClass = 'text-sm font-medium';

	const unitPriceNum = $derived(parseFloat(unit_price) || 0);
	const monthsNum = $derived(parseFloat(months) || 1);
	const amounts = $derived(calcOrderAmounts(unitPriceNum, monthsNum));

	function fmtNum(n: number): string {
		return n.toLocaleString();
	}

	function emptyToNull(value: string): string | null {
		return value.trim() ? value.trim() : null;
	}

	function numOrUndefined(value: string): number | undefined {
		if (value.trim() === '') return undefined;
		const n = Number(value);
		return Number.isNaN(n) ? undefined : n;
	}

	function onOrderTypeChange(type: OrderType) {
		order_type = type;
		if (!isEdit || !order_number.trim()) {
			order_number = generateOrderNumber(type, 0);
		}
	}

	function applyBillingRates(up: string, hMin: string, hMax: string) {
		const { deduction, overtime } = calcRates(parseFloat(up) || 0, parseFloat(hMin) || 0, parseFloat(hMax) || 0);
		if (deduction > 0) deduction_rate = String(deduction);
		if (overtime > 0) overtime_rate = String(overtime);
	}

	function applyCostRates(up: string, hMin: string, hMax: string) {
		const { deduction, overtime } = calcRates(parseFloat(up) || 0, parseFloat(hMin) || 0, parseFloat(hMax) || 0);
		if (deduction > 0) cost_deduction_rate = String(deduction);
		if (overtime > 0) cost_overtime_rate = String(overtime);
	}

	function onBillingUnitPriceInput(value: string) {
		unit_price = value;
		applyBillingRates(value, standard_hours_min, standard_hours_max);
	}

	function onBillingHoursInput(key: 'standard_hours_min' | 'standard_hours_max', value: string) {
		if (key === 'standard_hours_min') standard_hours_min = value;
		else standard_hours_max = value;
		applyBillingRates(unit_price, standard_hours_min, standard_hours_max);
	}

	function onCostUnitPriceInput(value: string) {
		cost_unit_price = value;
		applyCostRates(value, standard_hours_min, standard_hours_max);
	}

	function onProjectChange(id: string) {
		if (!id) {
			project_id = '';
			return;
		}
		project_id = id;
		const proj = projects.find((p) => p.id === id);
		if (!proj) return;
		project_name = proj.name;
		client_company = proj.client_company ?? client_company;
		engineer_affiliation_company = proj.agency_company ?? engineer_affiliation_company;
	}

	function onEngineerChange(id: string) {
		if (!id) {
			engineer_id = '';
			return;
		}
		engineer_id = id;
		const eng = engineers.find((e) => e.id === id);
		if (!eng) return;

		engineer_name = eng.name;
		engineer_affiliation_company = eng.affiliation_company ?? '';
		engineer_parent_company = eng.parent_company ?? '';

		if (eng.billing_unit_price != null) {
			unit_price = String(eng.billing_unit_price);
			applyBillingRates(unit_price, standard_hours_min, standard_hours_max);
		}
		if (eng.standard_hours_min != null) standard_hours_min = String(eng.standard_hours_min);
		if (eng.standard_hours_max != null) standard_hours_max = String(eng.standard_hours_max);
		if (eng.hourly_deduction_rate != null) deduction_rate = String(eng.hourly_deduction_rate);
		if (eng.hourly_overtime_rate != null) overtime_rate = String(eng.hourly_overtime_rate);

		if (eng.cost_unit_price != null) {
			cost_unit_price = String(eng.cost_unit_price);
			applyCostRates(cost_unit_price, standard_hours_min, standard_hours_max);
		}
		if (eng.cost_deduction_rate != null) cost_deduction_rate = String(eng.cost_deduction_rate);
		if (eng.cost_overtime_rate != null) cost_overtime_rate = String(eng.cost_overtime_rate);

		if (eng.project_id && !project_id) onProjectChange(eng.project_id);
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!issue_date.trim() || !client_company.trim()) return;

		const up = parseFloat(unit_price) || 0;
		const m = parseFloat(months) || 1;
		const calc = calcOrderAmounts(up, m);

		const data: Omit<Order, 'id'> = {
			order_number: emptyToNull(order_number),
			order_type,
			issue_date: issue_date.trim(),
			project_id: emptyToNull(project_id),
			project_name: project_name.trim() || 'SES業務委託費',
			engineer_id: emptyToNull(engineer_id),
			engineer_name: emptyToNull(engineer_name),
			client_company: client_company.trim(),
			engineer_affiliation_company: emptyToNull(engineer_affiliation_company),
			engineer_parent_company: emptyToNull(engineer_parent_company),
			unit_price: up,
			months: m,
			period_start: emptyToNull(period_start),
			period_end: emptyToNull(period_end),
			standard_hours_min: parseFloat(standard_hours_min) || 140,
			standard_hours_max: parseFloat(standard_hours_max) || 180,
			overtime_rate: numOrUndefined(overtime_rate) ?? 0,
			deduction_rate: numOrUndefined(deduction_rate) ?? 0,
			cost_unit_price: numOrUndefined(cost_unit_price) ?? 0,
			cost_deduction_rate: numOrUndefined(cost_deduction_rate) ?? 0,
			cost_overtime_rate: numOrUndefined(cost_overtime_rate) ?? 0,
			amount_subtotal: calc.amount_subtotal,
			tax_amount: calc.tax_amount,
			order_amount: calc.order_amount,
			contract_type,
			settlement_unit: emptyToNull(settlement_unit),
			transportation,
			deliverable: emptyToNull(deliverable),
			status,
			notes: emptyToNull(notes)
		};

		onSubmit(data);
	}
</script>

<form class="max-w-3xl space-y-6" onsubmit={handleSubmit}>
	<!-- 書類情報 -->
	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">書類情報</Card.Title>
		</Card.Header>
		<Card.Content class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label class={labelClass} for="order_type">書類種別</label>
				<select
					id="order_type"
					class={selectClass}
					value={order_type}
					onchange={(e) => onOrderTypeChange(e.currentTarget.value as OrderType)}
				>
					<option value="注文書">注文書</option>
					<option value="注文請書">注文請書</option>
				</select>
			</div>
			<div>
				<label class={labelClass} for="order_number">書類番号</label>
				<Input id="order_number" bind:value={order_number} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="issue_date">
					発行日 <span class="text-destructive">*</span>
				</label>
				<Input id="issue_date" type="date" bind:value={issue_date} required class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="status">ステータス</label>
				<select id="status" class={selectClass} bind:value={status}>
					<option value="下書き">下書き</option>
					<option value="送付済み">送付済み</option>
					<option value="承認済み">承認済み</option>
				</select>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 注文先・案件・要員 -->
	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">注文先・案件・要員</Card.Title>
		</Card.Header>
		<Card.Content class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label class={labelClass} for="project_id">案件から入力</label>
				<select
					id="project_id"
					class={selectClass}
					value={project_id}
					onchange={(e) => onProjectChange(e.currentTarget.value)}
				>
					<option value="">案件を選択</option>
					{#each projects as proj (proj.id)}
						<option value={proj.id}>{proj.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class={labelClass} for="engineer_id">要員から入力</label>
				<select
					id="engineer_id"
					class={selectClass}
					value={engineer_id}
					onchange={(e) => onEngineerChange(e.currentTarget.value)}
				>
					<option value="">要員を選択（レート自動入力）</option>
					{#each engineers as eng (eng.id)}
						<option value={eng.id}>{eng.name}</option>
					{/each}
				</select>
			</div>
			<div class="md:col-span-2">
				<label class={labelClass} for="project_name">案件名</label>
				<Input id="project_name" bind:value={project_name} class="mt-1" />
			</div>
			<div class="md:col-span-2">
				<label class={labelClass} for="client_company">
					上位会社（見積書の宛先） <span class="text-destructive">*</span>
				</label>
				<Input
					id="client_company"
					bind:value={client_company}
					required
					class="mt-1"
					placeholder="上位会社・エンドユーザー"
				/>
			</div>
			<div class="md:col-span-2">
				<label class={labelClass} for="engineer_affiliation_company">所属会社（注文書の宛先）</label>
				<Input
					id="engineer_affiliation_company"
					bind:value={engineer_affiliation_company}
					class="mt-1"
					placeholder="要員の所属会社（BP等）"
				/>
			</div>
			<div>
				<label class={labelClass} for="engineer_name">要員名</label>
				<Input id="engineer_name" bind:value={engineer_name} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="engineer_parent_company">上位会社名（補足）</label>
				<Input
					id="engineer_parent_company"
					bind:value={engineer_parent_company}
					class="mt-1"
					placeholder="エンドユーザー名"
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 注文内容・金額 -->
	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">注文内容・金額</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label class={labelClass} for="unit_price">単価（万円/月）</label>
					<Input
						id="unit_price"
						type="number"
						value={unit_price}
						oninput={(e) => onBillingUnitPriceInput(e.currentTarget.value)}
						class="mt-1"
						placeholder="例：56"
					/>
				</div>
				<div>
					<label class={labelClass} for="months">月数</label>
					<Input id="months" type="number" bind:value={months} min="1" class="mt-1" />
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label class={labelClass} for="period_start">期間 開始日</label>
					<Input id="period_start" type="date" bind:value={period_start} class="mt-1" />
				</div>
				<div>
					<label class={labelClass} for="period_end">期間 終了日</label>
					<Input id="period_end" type="date" bind:value={period_end} class="mt-1" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class={labelClass} for="standard_hours_min">基準時間 下限（h）</label>
					<Input
						id="standard_hours_min"
						type="number"
						value={standard_hours_min}
						oninput={(e) => onBillingHoursInput('standard_hours_min', e.currentTarget.value)}
						class="mt-1"
					/>
				</div>
				<div>
					<label class={labelClass} for="standard_hours_max">基準時間 上限（h）</label>
					<Input
						id="standard_hours_max"
						type="number"
						value={standard_hours_max}
						oninput={(e) => onBillingHoursInput('standard_hours_max', e.currentTarget.value)}
						class="mt-1"
					/>
				</div>
				<div>
					<label class={labelClass} for="overtime_rate">
						超過単価（円/h）
						<span class="ml-1 text-xs text-muted-foreground">自動計算（手動修正可）</span>
					</label>
					<Input
						id="overtime_rate"
						type="number"
						bind:value={overtime_rate}
						class="mt-1"
						placeholder="単価÷上限h（10円切捨）"
					/>
				</div>
				<div>
					<label class={labelClass} for="deduction_rate">
						控除単価（円/h）
						<span class="ml-1 text-xs text-muted-foreground">自動計算（手動修正可）</span>
					</label>
					<Input
						id="deduction_rate"
						type="number"
						bind:value={deduction_rate}
						class="mt-1"
						placeholder="単価÷下限h（10円切捨）"
					/>
				</div>
			</div>

			<div class="mt-2 border-t pt-4">
				<p class="mb-3 text-sm font-medium text-muted-foreground">支払条件（所属会社への支払）</p>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div>
						<label class={labelClass} for="cost_unit_price">支払単価（万円/月）</label>
						<Input
							id="cost_unit_price"
							type="number"
							value={cost_unit_price}
							oninput={(e) => onCostUnitPriceInput(e.currentTarget.value)}
							class="mt-1"
							placeholder="例：50"
						/>
					</div>
					<div>
						<label class={labelClass} for="cost_deduction_rate">支払控除単価（円/h）</label>
						<Input
							id="cost_deduction_rate"
							type="number"
							bind:value={cost_deduction_rate}
							class="mt-1"
							placeholder="例：2500"
						/>
					</div>
					<div>
						<label class={labelClass} for="cost_overtime_rate">支払超過単価（円/h）</label>
						<Input
							id="cost_overtime_rate"
							type="number"
							bind:value={cost_overtime_rate}
							class="mt-1"
							placeholder="例：3000"
						/>
					</div>
				</div>
			</div>

			<div class="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
				<div class="flex justify-between">
					<span class="text-muted-foreground">単価 × {monthsNum}ヶ月</span>
					<span>¥{fmtNum(amounts.amount_subtotal)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">消費税（10%）</span>
					<span>¥{fmtNum(amounts.tax_amount)}</span>
				</div>
				<hr class="border-border" />
				<div class="flex justify-between text-base font-bold">
					<span>発注金額（税込）</span>
					<span class="text-primary">¥{fmtNum(amounts.order_amount)}</span>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 契約条件 -->
	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">契約条件</Card.Title>
		</Card.Header>
		<Card.Content class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label class={labelClass} for="contract_type">契約形態</label>
				<select id="contract_type" class={selectClass} bind:value={contract_type}>
					<option value="準委任">準委任</option>
					<option value="派遣">派遣</option>
				</select>
			</div>
			<div>
				<label class={labelClass} for="settlement_unit">清算単位</label>
				<Input id="settlement_unit" bind:value={settlement_unit} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="transportation">交通費</label>
				<select id="transportation" class={selectClass} bind:value={transportation}>
					<option value="基本単価に含む">基本単価に含む</option>
					<option value="別途精算">別途精算</option>
				</select>
			</div>
			<div>
				<label class={labelClass} for="deliverable">納品物</label>
				<Input id="deliverable" bind:value={deliverable} class="mt-1" />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 固定条件 -->
	<Card.Root class="bg-muted/30">
		<Card.Header class="pb-2">
			<Card.Title class="text-sm text-muted-foreground">固定条件（全書類共通）</Card.Title>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			<p>納入日：毎月末日　／　検収日：毎月末日　／　支払日：検収月の翌々月15日（45日サイト）</p>
		</Card.Content>
	</Card.Root>

	<!-- 特記事項 -->
	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">特記事項</Card.Title>
		</Card.Header>
		<Card.Content>
			<textarea id="notes" class={textareaClass} rows={6} bind:value={notes}></textarea>
		</Card.Content>
	</Card.Root>

	<div class="flex justify-end">
		<Button type="submit" disabled={isSubmitting}>
			{isSubmitting ? '保存中...' : submitLabel}
		</Button>
	</div>
</form>