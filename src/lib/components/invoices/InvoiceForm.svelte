<script lang="ts">
	import FileCheck from '@lucide/svelte/icons/file-check';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import type { Engineer, Invoice, InvoiceInput, InvoiceStatus, Order, Project } from '$lib/types';
	import { calcRates } from '$lib/utils/order-utils';
	import InvoicePreview from '$lib/components/invoices/InvoicePreview.svelte';
	import CollapsibleFormCard from '$lib/components/ui/CollapsibleFormCard.svelte';
	import {
		calcDueDateFromBillingMonth,
		generateInvoiceNumber,
		INVOICE_PREVIEW_PAGE_HEIGHT_PX,
		INVOICE_PREVIEW_PAGE_WIDTH_PX,
		resolveDeductionOvertimeRates,
		toInvoicePreview
	} from '$lib/utils/invoice-utils';
	import { companySettings } from '$lib/stores/company-settings.svelte';
	import { today } from '$lib/utils';

	const previewPageWidth = `${INVOICE_PREVIEW_PAGE_WIDTH_PX}px`;
	const previewPageHeight = `${INVOICE_PREVIEW_PAGE_HEIGHT_PX}px`;

	let {
		engineers = [],
		projects = [],
		orders = [],
		initialData = {},
		onSubmit,
		isSubmitting = false,
		submitLabel = '登録する'
	}: {
		engineers?: Engineer[];
		projects?: Project[];
		orders?: Order[];
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

	let cardsOpen = $state({
		basic: true,
		rates: true,
		notes: true
	});

	const selectClass =
		'mt-0.5 flex h-7 w-full rounded-md border border-input bg-background px-2 py-0 text-xs shadow-xs';
	const textareaClass = selectClass + ' min-h-[2rem] resize-none py-1 leading-snug';
	const labelClass = 'text-[11px] font-medium leading-none';
	const cardContentClass = 'px-3 py-1.5';

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

	const hoursFeedback = $derived.by(() => {
		const actual = Number(actual_hours);
		if (actual_hours.trim() === '' || Number.isNaN(actual)) return null;
		const min = Number(standard_hours_min) || 140;
		const max = Number(standard_hours_max) || 180;
		if (actual < min) return { kind: 'deduction' as const, hours: min - actual };
		if (actual > max) return { kind: 'overtime' as const, hours: actual - max };
		return { kind: 'ok' as const, hours: 0 };
	});

	const livePreview = $derived.by(() => {
		const up = Number(unit_price);
		return toInvoicePreview(
			{
				id: initialData.id ?? 'draft',
				invoice_number: invoice_number.trim() || null,
				issue_date: issue_date.trim() || today(),
				due_date: due_date.trim() || null,
				client_name: client_name.trim() || '（請求先未入力）',
				engineer_id: engineer_id || null,
				project_id: project_id || null,
				billing_month: billing_month.trim() || today().slice(0, 7),
				unit_price: Number.isNaN(up) ? 0 : up,
				actual_hours: numOrUndefined(actual_hours) ?? null,
				standard_hours_min: Number(standard_hours_min) || 140,
				standard_hours_max: Number(standard_hours_max) || 180,
				deduction_rate: resolvedRates.deduction_rate,
				overtime_rate: resolvedRates.overtime_rate,
				travel_expenses: Number(travel_expenses) || 0,
				tax_rate: Number(tax_rate) || 10,
				status,
				notes: notes.trim() || null,
				created_at: initialData.created_at
			},
			companySettings.value
		);
	});

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
		const order = orders.find((o) => o.id === orderId);
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

<form
	class="invoice-form-screen flex h-full min-h-0 w-full flex-col"
	style="--invoice-page-width: {previewPageWidth}; --invoice-page-height: {previewPageHeight}"
	onsubmit={handleSubmit}
>
	<div class="document-form-columns min-h-0 flex-1 grid grid-cols-1 gap-2 xl:grid-cols-2 xl:gap-3">
		<div class="min-h-0 min-w-0 xl:h-full">
			<div class="document-form-fields">
			<div class="space-y-1 pb-1">
			{#if !isEdit}
				<div
					class="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-accent/30 px-2 py-1.5"
				>
					<FileCheck class="h-3 w-3 shrink-0 text-primary" />
					<label class="sr-only" for="order_sheet_id">注文書から自動入力</label>
					<select
						id="order_sheet_id"
						class="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"
						value=""
						onchange={(e) => onOrderSheetSelect(e.currentTarget.value)}
					>
						<option value="">注文書から自動入力...</option>
						{#each orders as order (order.id)}
							<option value={order.id}>
								{order.order_number ?? '（番号なし）'}
								{#if order.engineer_name}| {order.engineer_name}{/if}
								{#if order.project_name}| {order.project_name}{/if}
							</option>
						{/each}
					</select>
				</div>
			{/if}

			<CollapsibleFormCard title="基本情報" bind:open={cardsOpen.basic} contentClass={`${cardContentClass} grid grid-cols-3 gap-x-2 gap-y-1.5`}>
					<div class="col-span-3">
						<label class={labelClass} for="project_id">案件</label>
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
					<div class="col-span-3">
						<label class={labelClass} for="client_name">
							請求先 <span class="text-destructive">*</span>
						</label>
						<Input
							id="client_name"
							bind:value={client_name}
							required
							class="mt-0.5 h-7 text-xs"
							placeholder="○○株式会社"
						/>
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
					<div>
						<label class={labelClass} for="invoice_number">請求No</label>
						<Input id="invoice_number" bind:value={invoice_number} class="mt-0.5 h-7 text-xs" />
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
							class="mt-0.5 h-7 text-xs"
						/>
					</div>
					<div>
						<label class={labelClass} for="issue_date">日付</label>
						<Input
							id="issue_date"
							type="date"
							bind:value={issue_date}
							required
							class="mt-0.5 h-7 text-xs"
						/>
					</div>
					<div>
						<label class={labelClass} for="due_date">お支払期限</label>
						<Input id="due_date" type="date" bind:value={due_date} class="mt-0.5 h-7 text-xs" />
					</div>
			</CollapsibleFormCard>

			<CollapsibleFormCard title="単価・作業時間" bind:open={cardsOpen.rates} contentClass={`${cardContentClass} space-y-1.5`}>
					<div class="grid grid-cols-4 gap-x-2 gap-y-1.5">
						<div>
							<label class={labelClass} for="unit_price">
								請求単価（万円/月）<span class="text-destructive">*</span>
							</label>
							<Input
								id="unit_price"
								type="number"
								bind:value={unit_price}
								required
								class="mt-0.5 h-7 text-xs"
								oninput={() =>
									applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max)}
							/>
						</div>
						<div>
							<label class={labelClass} for="actual_hours">
								作業時間（h）
								{#if hoursFeedback?.kind === 'deduction'}
									<span class="text-[10px] font-normal text-red-600">- {hoursFeedback.hours}H</span>
								{:else if hoursFeedback?.kind === 'overtime'}
									<span class="text-[10px] font-normal text-blue-600">+ {hoursFeedback.hours}H</span>
								{/if}
							</label>
							<Input
								id="actual_hours"
								type="number"
								bind:value={actual_hours}
								class="mt-0.5 h-7 text-xs"
							/>
						</div>
						<div>
							<label class={labelClass} for="travel_expenses">交通費（円）</label>
							<Input
								id="travel_expenses"
								type="number"
								bind:value={travel_expenses}
								class="mt-0.5 h-7 text-xs"
							/>
						</div>
						<div>
							<label class={labelClass} for="tax_rate">税率（%）</label>
							<Input id="tax_rate" type="number" bind:value={tax_rate} class="mt-0.5 h-7 text-xs" />
						</div>
					</div>

					<div class="grid grid-cols-4 gap-x-2 gap-y-1.5">
						<div>
							<label class={labelClass} for="standard_hours_min">基準 下限（h）</label>
							<Input
								id="standard_hours_min"
								type="number"
								bind:value={standard_hours_min}
								class="mt-0.5 h-7 text-xs"
								oninput={() =>
									applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max)}
							/>
						</div>
						<div>
							<label class={labelClass} for="standard_hours_max">基準 上限（h）</label>
							<Input
								id="standard_hours_max"
								type="number"
								bind:value={standard_hours_max}
								class="mt-0.5 h-7 text-xs"
								oninput={() =>
									applyRatesFromUnitPrice(unit_price, standard_hours_min, standard_hours_max)}
							/>
						</div>
						<div>
							<label class={labelClass} for="deduction_rate">控除単価（円/h）</label>
							<Input
								id="deduction_rate"
								type="number"
								bind:value={deduction_rate}
								class="mt-0.5 h-7 text-xs"
							/>
						</div>
						<div>
							<label class={labelClass} for="overtime_rate">超過単価（円/h）</label>
							<Input
								id="overtime_rate"
								type="number"
								bind:value={overtime_rate}
								class="mt-0.5 h-7 text-xs"
							/>
						</div>
					</div>
			</CollapsibleFormCard>

			<CollapsibleFormCard title="備考" bind:open={cardsOpen.notes} contentClass={cardContentClass}>
					<label class="sr-only" for="notes">備考</label>
					<textarea id="notes" class={textareaClass} rows={2} bind:value={notes}></textarea>
			</CollapsibleFormCard>
			</div>
			</div>
		</div>

		<aside class="flex min-h-0 min-w-0 flex-col overflow-hidden xl:h-full">
			<p class="mb-0.5 shrink-0 text-[11px] font-medium text-muted-foreground">請求書プレビュー</p>
			<div
				class="box-border min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/30 p-1.5"
			>
				<div class="invoice-preview-scaler mx-auto">
					<div class="invoice-preview-scaler-inner">
						<InvoicePreview invoice={livePreview} />
					</div>
				</div>
			</div>
			<div class="flex shrink-0 justify-end pt-1.5">
				<Button type="submit" disabled={isSubmitting} size="sm" class="min-w-28">
					{isSubmitting ? '保存中...' : submitLabel}
				</Button>
			</div>
		</aside>
	</div>
</form>

<style>
	.invoice-form-screen {
		--invoice-preview-chrome: 8.5rem;
		--preview-scale: min(
			1,
			calc((100dvh - var(--invoice-preview-chrome)) / var(--invoice-page-height))
		);
	}

	@media (min-width: 1280px) {
		.invoice-form-screen {
			--invoice-preview-chrome: 8rem;
		}
	}

	.invoice-preview-scaler {
		width: calc(var(--invoice-page-width) * var(--preview-scale));
		height: calc(var(--invoice-page-height) * var(--preview-scale));
		overflow: hidden;
	}

	.invoice-preview-scaler-inner {
		width: var(--invoice-page-width);
		transform: scale(var(--preview-scale));
		transform-origin: top left;
	}
</style>
