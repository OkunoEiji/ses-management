<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import InvoiceForm from '$lib/components/invoices/InvoiceForm.svelte';
	import { invoices, type Invoice, type InvoiceInput } from '$lib/mock/invoices';
	import { engineers } from '$lib/mock/engineers';
	import { projects } from '$lib/mock/projects';
	import { applyStatusTimestamps, calcDueDateFromBillingMonth, generateInvoiceNumber } from '$lib/mock/invoice-utils';
	import { today } from '$lib/utils';

	let isSubmitting = $state(false);

	const prefillEngineerId = $derived(page.url.searchParams.get('engineer_id'));
	const prefillProjectId = $derived(page.url.searchParams.get('project_id'));

	const initialData = $derived.by(() => {
		const billingMonth = today().slice(0, 7);
		const data: Partial<Invoice> = {
			issue_date: today(),
			status: '下書き',
			billing_month: billingMonth,
			due_date: calcDueDateFromBillingMonth(billingMonth)
		};

		const engId = prefillEngineerId;
		if (engId) {
			const eng = engineers.find((e) => e.id === engId);
			if (eng) {
				data.engineer_id = eng.id;
				data.unit_price = eng.billing_unit_price ?? eng.desired_unit_price ?? 0;
				data.standard_hours_min = eng.standard_hours_min;
				data.standard_hours_max = eng.standard_hours_max;
				data.deduction_rate = eng.hourly_deduction_rate;
				data.overtime_rate = eng.hourly_overtime_rate;
			}
		}

		const projId = prefillProjectId ?? engineers.find((e) => e.id === engId)?.project_id;
		if (projId) {
			const proj = projects.find((p) => p.id === projId);
			if (proj) {
				data.project_id = proj.id;
				data.client_name = proj.agency_company ?? proj.client_company ?? '';
			}
		}

		return data;
	});

	function handleSubmit(data: InvoiceInput) {
		isSubmitting = true;
		const now = today();
		const timestamps = applyStatusTimestamps(data, null, now);

		const newInvoice = {
			id: crypto.randomUUID(),
			...data,
			invoice_number: data.invoice_number ?? generateInvoiceNumber(invoices.length),
			created_at: now,
			...timestamps
		};

		invoices.push(newInvoice);
		goto(`/invoices/${newInvoice.id}`);
	}
</script>

<div class="document-form-page flex h-full min-h-0 flex-col overflow-hidden p-3">
	<header class="flex shrink-0 items-center gap-2 border-b border-border pb-2">
		<Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => history.back()}>
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<h1 class="text-base font-bold tracking-tight">請求書作成</h1>
	</header>

	<div class="min-h-0 flex-1 pt-2">
		{#key `${prefillEngineerId}-${prefillProjectId}`}
			<InvoiceForm initialData={initialData} onSubmit={handleSubmit} {isSubmitting} submitLabel="作成する" />
		{/key}
	</div>
</div>
