<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import OrderForm from '$lib/components/orders/OrderForm.svelte';
	import { submitJsonAction } from '$lib/api/submit';
	import type { Order } from '$lib/types';
	import { today } from '$lib/utils';

	let { data } = $props();
	let isSubmitting = $state(false);

	const initialData = $derived.by(() => {
		const formData: Partial<Order> = {
			issue_date: today(),
			status: '下書き',
			order_type: '注文書'
		};

		const engId = data.prefillEngineerId;
		if (engId) {
			const eng = data.engineers.find((e) => e.id === engId);
			if (eng) {
				formData.engineer_id = eng.id;
				formData.engineer_name = eng.name;
				formData.engineer_affiliation_company = eng.affiliation_company ?? null;
				formData.engineer_parent_company = eng.parent_company ?? null;
				formData.unit_price = eng.billing_unit_price ?? eng.desired_unit_price ?? 0;
				formData.cost_unit_price = eng.cost_unit_price ?? null;
				formData.standard_hours_min = eng.standard_hours_min;
				formData.standard_hours_max = eng.standard_hours_max;
				formData.deduction_rate = eng.hourly_deduction_rate;
				formData.overtime_rate = eng.hourly_overtime_rate;
				formData.cost_deduction_rate = eng.cost_deduction_rate;
				formData.cost_overtime_rate = eng.cost_overtime_rate;
			}
		}

		const projId = data.prefillProjectId ?? data.engineers.find((e) => e.id === engId)?.project_id;
		if (projId) {
			const proj = data.projects.find((p) => p.id === projId);
			if (proj) {
				formData.project_id = proj.id;
				formData.project_name = proj.name;
				formData.client_company = proj.client_company ?? '';
				formData.engineer_affiliation_company =
					proj.agency_company ?? formData.engineer_affiliation_company ?? null;
			}
		}

		return formData;
	});

	async function handleSubmit(formData: Omit<Order, 'id'>) {
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
		<h1 class="text-base font-bold tracking-tight">注文書作成</h1>
	</header>

	<div class="min-h-0 flex-1 pt-2">
		{#key `${data.prefillEngineerId}-${data.prefillProjectId}`}
			<OrderForm
				engineers={data.engineers}
				projects={data.projects}
				initialData={initialData}
				onSubmit={handleSubmit}
				{isSubmitting}
				submitLabel="作成する"
			/>
		{/key}
	</div>
</div>
