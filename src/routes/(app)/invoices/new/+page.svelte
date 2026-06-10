<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import InvoiceForm from '$lib/components/invoices/InvoiceForm.svelte';
	import { submitJsonAction } from '$lib/api/submit';
	import { calcDueDateFromBillingMonth } from '$lib/utils/invoice-utils';
	import type { Invoice, InvoiceInput } from '$lib/types';
	import { today } from '$lib/utils';

	let { data } = $props();
	let isSubmitting = $state(false);

	const initialData = $derived.by(() => {
		const billingMonth = today().slice(0, 7);
		const formData: Partial<Invoice> = {
			issue_date: today(),
			status: '下書き',
			billing_month: billingMonth,
			due_date: calcDueDateFromBillingMonth(billingMonth)
		};

		const engId = data.prefillEngineerId;
		if (engId) {
			const eng = data.engineers.find((e) => e.id === engId);
			if (eng) {
				formData.engineer_id = eng.id;
				formData.unit_price = eng.billing_unit_price ?? eng.desired_unit_price ?? 0;
				formData.standard_hours_min = eng.standard_hours_min;
				formData.standard_hours_max = eng.standard_hours_max;
				formData.deduction_rate = eng.hourly_deduction_rate;
				formData.overtime_rate = eng.hourly_overtime_rate;
			}
		}

		const projId = data.prefillProjectId ?? data.engineers.find((e) => e.id === engId)?.project_id;
		if (projId) {
			const proj = data.projects.find((p) => p.id === projId);
			if (proj) {
				formData.project_id = proj.id;
				formData.client_name = proj.agency_company ?? proj.client_company ?? '';
			}
		}

		return formData;
	});

	async function handleSubmit(formData: InvoiceInput) {
		isSubmitting = true;
		try {
			await submitJsonAction(formData);
		} catch (e) {
			console.error(e);
			alert('保存に失敗しました');
		} finally {
			isSubmitting = false;
		}
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
		{#key `${data.prefillEngineerId}-${data.prefillProjectId}`}
			<InvoiceForm
				engineers={data.engineers}
				projects={data.projects}
				orders={data.orders}
				initialData={initialData}
				onSubmit={handleSubmit}
				{isSubmitting}
				submitLabel="作成する"
			/>
		{/key}
	</div>
</div>
