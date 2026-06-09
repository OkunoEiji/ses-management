<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import OrderForm from '$lib/components/orders/OrderForm.svelte';
	import { orderSheets, type Order } from '$lib/mock/orders';
	import { engineers } from '$lib/mock/engineers';
	import { projects } from '$lib/mock/projects';
	import { generateOrderNumber } from '$lib/mock/order-utils';
	import { today } from '$lib/utils';

	let isSubmitting = $state(false);

	const prefillEngineerId = $derived(page.url.searchParams.get('engineer_id'));
	const prefillProjectId = $derived(page.url.searchParams.get('project_id'));

	const initialData = $derived.by(() => {
		const data: Partial<Order> = {
			issue_date: today(),
			status: '下書き',
			order_type: '注文書'
		};

		const engId = prefillEngineerId;
		if (engId) {
			const eng = engineers.find((e) => e.id === engId);
			if (eng) {
				data.engineer_id = eng.id;
				data.engineer_name = eng.name;
				data.engineer_affiliation_company = eng.affiliation_company ?? null;
				data.engineer_parent_company = eng.parent_company ?? null;
				data.unit_price = eng.billing_unit_price ?? eng.desired_unit_price ?? 0;
				data.cost_unit_price = eng.cost_unit_price ?? null;
				data.standard_hours_min = eng.standard_hours_min;
				data.standard_hours_max = eng.standard_hours_max;
				data.deduction_rate = eng.hourly_deduction_rate;
				data.overtime_rate = eng.hourly_overtime_rate;
				data.cost_deduction_rate = eng.cost_deduction_rate;
				data.cost_overtime_rate = eng.cost_overtime_rate;
			}
		}

		const projId = prefillProjectId ?? engineers.find((e) => e.id === engId)?.project_id;
		if (projId) {
			const proj = projects.find((p) => p.id === projId);
			if (proj) {
				data.project_id = proj.id;
				data.project_name = proj.name;
				data.client_company = proj.client_company ?? '';
				data.engineer_affiliation_company =
					proj.agency_company ?? data.engineer_affiliation_company ?? null;
			}
		}

		return data;
	});

	function handleSubmit(data: Omit<Order, 'id'>) {
		isSubmitting = true;
		const now = today();

		const newOrder: Order = {
			id: crypto.randomUUID(),
			...data,
			order_number:
				data.order_number ?? generateOrderNumber(data.order_type ?? '注文書', orderSheets.length),
			created_at: now,
			updated_at: now
		};

		orderSheets.push(newOrder);
		goto(`/orders/${newOrder.id}`);
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
		{#key `${prefillEngineerId}-${prefillProjectId}`}
			<OrderForm initialData={initialData} onSubmit={handleSubmit} {isSubmitting} submitLabel="作成する" />
		{/key}
	</div>
</div>
