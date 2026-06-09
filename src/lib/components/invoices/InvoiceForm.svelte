<script lang="ts">
	import FileCheck from '@lucide/svelte/icons/file-check';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { Invoice, InvoiceInput, InvoiceStatus } from '$lib/mock/invoices';
	import { engineers } from '$lib/mock/engineers';
	import { projects } from '$lib/mock/projects';
	import { orderSheets } from '$lib/mock/orders';
	import { calcRates } from '$lib/mock/order-utils';
	import {
		calcDueDateFromBillingMonth,
		calcInvoiceTotals,
		generateInvoiceNumber,
		resolveDeductionOvertimeRates,
		resolveEngineerName
	} from '$lib/mock/invoice-utils';
	import { formatYen, today } from '$lib/utils';

	let {
		initialData = {},
		onSubmit,
		isSubmitting = false,
		submitLabel = '登録する'
	}: {
		initialData?: Partial<Invoice>;
		onSubmit: (data: InvoiceInput) => void;
		isSubmitting?: boolean;
		submitLabel?: string;
	} = $props();

	const isEdit = $derived(!!initialData.id);

	function formStateFromInvoice(data: Partial<Invoice> = {}) {
		const billingMonth = data.billing_month ?? today().slice(0, 7);
		const unitPrice = data.unit_price ?? 0;
		const stdMin = data.standard_hours_min ?? 140;
		const stdMax = data.standard_hours_max ?? 180;
		const rates = resolveDeductionOvertimeRates({
			unit_price: unitPrice,
			standard_hours_min: stdMin,
			standard_hours_max: stdMax,
			deduction_rate: data.deduction_rate ?? null,
			overtime_rate: data.overtime_rate ?? null
		});

		return {
			hasId: !!data.id,
			invoice_number: data.invoice_number ?? '',
			engineer_id: data.engineer_id ?? '',
			project_id: data.project_id ?? '',
			client_name: data.client_name ?? '',
			billing_month: billingMonth,
			unit_price: unitPrice,
			status: (data.status ?? '下書き') as InvoiceStatus,
			issue_date: data.issue_date ?? today(),
			due_date: data.due_date ?? calcDueDateFromBillingMonth(billingMonth),
			actual_hours: data.actual_hours,
			standard_hours_min: stdMin,
			standard_hours_max: stdMax,
			deduction_rate: rates.deduction_rate,
			overtime_rate: rates.overtime_rate,
			travel_expenses: data.travel_expenses ?? 0,
			tax_rate: data.tax_rate ?? 10,
			notes: data.notes ?? ''
		};
	}

	const init = formStateFromInvoice(initialData);

	let invoice_number = $state(
		init.invoice_number || (!init.hasId ? generateInvoiceNumber(0) : '')
	);
	let engineer_id = $state(init.engineer_id);
	let project_id = $state(init.project_id);
	let client_name = $state(init.client_name);
	let billing_month = $state(init.billing_month);
	let unit_price = $state(init.unit_price != null ? String(init.unit_price) : '');
	let status = $state<InvoiceStatus>(init.status);
	let issue_date = $state(init.issue_date);
	let due_date = $state(init.due_date);
	let actual_hours = $state(init.actual_hours?.toString() ?? '');
	let standard_hours_min = $state(String(init.standard_hours_min));
	let standard_hours_max = $state(String(init.standard_hours_max));
	let deduction_rate = $state(String(init.deduction_rate ?? ''));
	let overtime_rate = $state(String(init.overtime_rate ?? ''));
	let travel_expenses = $state(String(init.travel_expenses));
	let tax_rate = $state(String(init.tax_rate));
	let notes = $state(init.notes);

	const selectClass =
		'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs';
	const textareaClass = selectClass + ' min-h-24 py-2';
	const labelClass = 'text-sm font-medium';

	const resolvedRates = $derived.by(() => {
		const up = Number(unit_price);
		if (Number.isNaN(up) || unit_price.trim() === '') {
			return { deduction_rate: 0, overtime_rate: 0 };
		}
		return resolveDeductionOvertimeRates({
			unit_price: up,
			standard_hours_min: Number(standard_hours_min) || 140,
			standard_hours_max: Number(standard_hours_max) || 180,
			deduction_rate: numOrUndefined(deduction_rate) ?? null,
			overtime_rate: numOrUndefined(overtime_rate) ?? null
		});
	});

	const totals = $derived.by(() => {
		const up = Number(unit_price);
		if (Number.isNaN(up) || unit_price.trim() === '') return null;
		return calcInvoiceTotals({
			unit_price: up,
			actual_hours: Number(actual_hours) || 0,
			standard_hours_min: Number(standard_hours_min) || 140,
			standard_hours_max: Number(standard_hours_max) || 180,
			deduction_rate: resolvedRates.deduction_rate,
			overtime_rate: resolvedRates.overtime_rate,
			travel_expenses: Number(travel_expenses) || 0,
			tax_rate: Number(tax_rate) || 10
		});
	});

	const selectedEngineerName = $derived(
		engineer_id ? resolveEngineerName({ engineer_id }) : ''
	);

	function emptyToNull(value: string): string | null {
		return value.trim() ? value.trim() : null;
	}

	function numOrUndefined(value: string): number | undefined {
		if (value.trim() === '') return undefined;
		const n = Number(value);
		return Number.isNaN(n) ? undefined : n;
	}

	function applyRatesFromUnitPrice(up: string, hMin: string, hMax: string) {
		const { deduction, overtime } = calcRates(
			parseFloat(up) || 0,
			parseFloat(hMin) || 0,
			parseFloat(hMax) || 0
		);
		if (deduction > 0) deduction_rate = String(deduction);
		if (overtime > 0) overtime_rate = String(overtime);
	}

	function onBillingMonthChange(value: string) {
		billing_month = value;
		if (value.trim()) {
			due_date = calcDueDateFromBillingMonth(value.trim());
		}
	}

	function onOrderSheetSelect(orderId: string) {
		if (!orderId) return;
		const order = orderSheets.find((o) => o.id === orderId);
		if (!order) return;

		engineer_id = order.engineer_id ?? '';
		project_id = order.project_id ?? '';
		client_name = order.client_company ?? '';
		unit_price = order.unit_price != null ? String(order.unit_price) : '';
		standard_hours_min = String(order.standard_hours_min ?? 140);
		standard_hours_max = String(order.standard_hours_max ?? 180);
		if (order.deduction_rate != null) deduction_rate = String(order.deduction_rate);
		else applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max);
		if (order.overtime_rate != null) overtime_rate = String(order.overtime_rate);
		billing_month = order.period_start ? order.period_start.slice(0, 7) : today().slice(0, 7);
		due_date = calcDueDateFromBillingMonth(billing_month);
		if (order.issue_date) issue_date = order.issue_date;
		notes = order.notes ?? '';
	}

	function onEngineerChange(id: string) {
		engineer_id = id;
		if (!id) return;
		const eng = engineers.find((e) => e.id === id);
		if (!eng) return;

		const up = eng.billing_unit_price ?? eng.desired_unit_price;
		if (up != null) unit_price = String(up);

		standard_hours_min = String(eng.standard_hours_min ?? 140);
		standard_hours_max = String(eng.standard_hours_max ?? 180);

		if (eng.hourly_deduction_rate != null) {
			deduction_rate = String(eng.hourly_deduction_rate);
		} else {
			applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max);
		}
		if (eng.hourly_overtime_rate != null) {
			overtime_rate = String(eng.hourly_overtime_rate);
		}

		if (eng.project_id) onProjectChange(eng.project_id);
	}

	function onProjectChange(id: string) {
		project_id = id;
		if (!id) return;
		const proj = projects.find((p) => p.id === id);
		if (!proj) return;
		client_name = proj.agency_company ?? proj.client_company ?? client_name;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!engineer_id || !client_name.trim() || !billing_month.trim()) return;

		const up = Number(unit_price);
		if (Number.isNaN(up)) return;

		onSubmit({
			invoice_number: emptyToNull(invoice_number),
			issue_date: issue_date.trim(),
			due_date: emptyToNull(due_date),
			client_name: client_name.trim(),
			engineer_id: emptyToNull(engineer_id),
			project_id: emptyToNull(project_id),
			billing_month: billing_month.trim(),
			unit_price: up,
			status,
			actual_hours: numOrUndefined(actual_hours),
			standard_hours_min: Number(standard_hours_min) || 140,
			standard_hours_max: Number(standard_hours_max) || 180,
			deduction_rate: resolvedRates.deduction_rate,
			overtime_rate: resolvedRates.overtime_rate,
			travel_expenses: Number(travel_expenses) || 0,
			tax_rate: Number(tax_rate) || 10,
			notes: emptyToNull(notes)
		});
	}
</script>

<form class="max-w-3xl space-y-6" onsubmit={handleSubmit}>
	{#if !isEdit}
		<Card.Root class="border-primary/30 bg-accent/30">
			<Card.Header class="pb-3">
				<Card.Title class="flex items-center gap-2 text-base">
					<FileCheck class="h-4 w-4 text-primary" />
					注文書から自動入力
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<label class={labelClass} for="order_sheet_id">
					注文書を選択すると請求内容が自動入力されます
				</label>
				<select
					id="order_sheet_id"
					class={selectClass}
					value=""
					onchange={(e) => onOrderSheetSelect(e.currentTarget.value)}
				>
					<option value="">注文書を選択して自動入力...</option>
					{#each orderSheets as order (order.id)}
						<option value={order.id}>
							{order.order_number ?? '（番号なし）'}
							{#if order.engineer_name}| {order.engineer_name}{/if}
							{#if order.project_name}| {order.project_name}{/if}
						</option>
					{/each}
				</select>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">請求先・関連</Card.Title>
		</Card.Header>
		<Card.Content class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="md:col-span-2">
				<label class={labelClass} for="project_id">案件から自動入力</label>
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
			<div class="md:col-span-2">
				<label class={labelClass} for="client_name">
					請求先 <span class="text-destructive">*</span>
				</label>
				<Input id="client_name" bind:value={client_name} required class="mt-1" placeholder="○○株式会社" />
			</div>
			<div>
				<label class={labelClass} for="engineer_id">
					作業者 <span class="text-destructive">*</span>
				</label>
				<select
					id="engineer_id"
					class={selectClass}
					value={engineer_id}
					onchange={(e) => onEngineerChange(e.currentTarget.value)}
					required
				>
					<option value="">要員を選択</option>
					{#each engineers as eng (eng.id)}
						<option value={eng.id}>{eng.name}</option>
					{/each}
				</select>
				{#if selectedEngineerName}
					<p class="mt-1 text-xs text-muted-foreground">請求書表示: 作業者: {selectedEngineerName}</p>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">請求内容</Card.Title>
		</Card.Header>
		<Card.Content class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label class={labelClass} for="invoice_number">請求No</label>
				<Input id="invoice_number" bind:value={invoice_number} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="billing_month">
					請求対象月 <span class="text-destructive">*</span>
				</label>
				<Input
					id="billing_month"
					type="month"
					value={billing_month}
					onchange={(e) => onBillingMonthChange(e.currentTarget.value)}
					required
					class="mt-1"
				/>
			</div>
			<div>
				<label class={labelClass} for="issue_date">日付</label>
				<Input id="issue_date" type="date" bind:value={issue_date} required class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="due_date">お支払期限</label>
				<Input id="due_date" type="date" bind:value={due_date} class="mt-1" />
				<p class="mt-1 text-xs text-muted-foreground">請求対象月から自動設定（検収月の翌々月15日）</p>
			</div>
			<div>
				<label class={labelClass} for="status">ステータス</label>
				<select id="status" class={selectClass} bind:value={status}>
					<option value="下書き">下書き</option>
					<option value="送付済み">送付済み</option>
					<option value="入金確認中">入金確認中</option>
					<option value="入金済み">入金済み</option>
				</select>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">単価・作業時間</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label class={labelClass} for="unit_price">
						請求単価（万円/月）<span class="text-destructive">*</span>
					</label>
					<Input
						id="unit_price"
						type="number"
						bind:value={unit_price}
						required
						class="mt-1"
						oninput={() =>
							applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max)}
					/>
				</div>
				<div>
					<label class={labelClass} for="actual_hours">作業時間（h）</label>
					<Input id="actual_hours" type="number" bind:value={actual_hours} class="mt-1" />
				</div>
				<div>
					<label class={labelClass} for="travel_expenses">交通費・宿泊費（円）</label>
					<Input id="travel_expenses" type="number" bind:value={travel_expenses} class="mt-1" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div>
					<label class={labelClass} for="standard_hours_min">基準時間 下限（h）</label>
					<Input
						id="standard_hours_min"
						type="number"
						bind:value={standard_hours_min}
						class="mt-1"
						oninput={() =>
							applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max)}
					/>
				</div>
				<div>
					<label class={labelClass} for="standard_hours_max">基準時間 上限（h）</label>
					<Input
						id="standard_hours_max"
						type="number"
						bind:value={standard_hours_max}
						class="mt-1"
						oninput={() =>
							applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max)}
					/>
				</div>
				<div>
					<label class={labelClass} for="deduction_rate">控除単価（円/h）</label>
					<Input id="deduction_rate" type="number" bind:value={deduction_rate} class="mt-1" />
				</div>
				<div>
					<label class={labelClass} for="overtime_rate">超過単価（円/h）</label>
					<Input id="overtime_rate" type="number" bind:value={overtime_rate} class="mt-1" />
				</div>
			</div>

			<div>
				<label class={labelClass} for="tax_rate">消費税率（%）</label>
				<Input id="tax_rate" type="number" bind:value={tax_rate} class="mt-1 max-w-xs" />
			</div>

			{#if totals}
				<div class="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">月額基本（{unit_price || 0}万円）</span>
						<span>{formatYen((Number(unit_price) || 0) * 10000)}</span>
					</div>
					{#if totals.deduction_hours > 0}
						<div class="flex justify-between text-red-600">
							<span>
								控除（-{totals.deduction_hours}H × ¥{resolvedRates.deduction_rate.toLocaleString()}）
							</span>
							<span>- {formatYen(totals.deduction_amount)}</span>
						</div>
					{/if}
					{#if totals.overtime_hours > 0}
						<div class="flex justify-between text-blue-600">
							<span>
								超過（+{totals.overtime_hours}H × ¥{resolvedRates.overtime_rate.toLocaleString()}）
							</span>
							<span>+ {formatYen(totals.overtime_amount)}</span>
						</div>
					{/if}
					<hr class="border-border" />
					<div class="flex justify-between">
						<span class="text-muted-foreground">小計</span>
						<span>{formatYen(totals.amount)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">消費税（{tax_rate}%）</span>
						<span>{formatYen(totals.tax_amount)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">交通費・宿泊費</span>
						<span>{formatYen(totals.travel_expenses)}</span>
					</div>
					<hr class="border-border" />
					<div class="flex justify-between text-base font-bold">
						<span>合計（税込）</span>
						<span class="text-primary">{formatYen(totals.total_amount)}</span>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="text-base">備考</Card.Title>
		</Card.Header>
		<Card.Content>
			<textarea id="notes" class={textareaClass} rows={3} bind:value={notes}></textarea>
		</Card.Content>
	</Card.Root>

	<div class="flex justify-end">
		<Button type="submit" disabled={isSubmitting}>
			{isSubmitting ? '保存中...' : submitLabel}
		</Button>
	</div>
</form>
