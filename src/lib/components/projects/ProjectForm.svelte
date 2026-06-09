<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import type { Project, ProjectStatus } from '$lib/mock/projects';

	let {
		initialData = {},
		onSubmit,
		isSubmitting = false,
		submitLabel = '登録する'
	}: {
		initialData?: Partial<Project>;
		onSubmit: (data: Omit<Project, 'id'>) => void;
		isSubmitting?: boolean;
		submitLabel?: string;
	} = $props();

	function formStateFromProject(data: Partial<Project> = {}) {
		return {
			name: data.name ?? '',
			status: (data.status ?? '商談中') as ProjectStatus,
			start_date: data.start_date ?? '',
			end_date: data.end_date ?? '',
			work_location: data.work_location ?? '',
			client_company: data.client_company ?? '',
			client_address: data.client_address ?? '',
			client_contact_name: data.client_contact_name ?? '',
			client_contact_email: data.client_contact_email ?? '',
			client_contact_tel: data.client_contact_tel ?? '',
			agency_company: data.agency_company ?? '',
			agency_address: data.agency_address ?? '',
			agency_contact_name: data.agency_contact_name ?? '',
			agency_contact_email: data.agency_contact_email ?? '',
			remarks: data.remarks ?? ''
		};
	}

	const init = formStateFromProject(initialData);

	let name = $state(init.name);
	let status = $state<ProjectStatus>(init.status);
	let start_date = $state(init.start_date);
	let end_date = $state(init.end_date);
	let work_location = $state(init.work_location);
	let client_company = $state(init.client_company);
	let client_address = $state(init.client_address);
	let client_contact_name = $state(init.client_contact_name);
	let client_contact_email = $state(init.client_contact_email);
	let client_contact_tel = $state(init.client_contact_tel);
	let agency_company = $state(init.agency_company);
	let agency_address = $state(init.agency_address);
	let agency_contact_name = $state(init.agency_contact_name);
	let agency_contact_email = $state(init.agency_contact_email);
	let remarks = $state(init.remarks);

	const selectClass =
		'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs';
	const labelClass = 'text-sm font-medium';
	const sectionClass = 'space-y-4 rounded-xl border border-border p-4';

	function emptyToNull(value: string): string | null {
		return value.trim() ? value.trim() : null;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;

		onSubmit({
			name: name.trim(),
			status,
			start_date: start_date || null,
			end_date: end_date || null,
			work_location: emptyToNull(work_location),
			client_company: emptyToNull(client_company),
			client_address: emptyToNull(client_address),
			client_contact_name: emptyToNull(client_contact_name),
			client_contact_email: emptyToNull(client_contact_email),
			client_contact_tel: emptyToNull(client_contact_tel),
			agency_company: emptyToNull(agency_company),
			agency_address: emptyToNull(agency_address),
			agency_contact_name: emptyToNull(agency_contact_name),
			agency_contact_email: emptyToNull(agency_contact_email),
			remarks: emptyToNull(remarks)
		});
	}
</script>

<form class="max-w-3xl space-y-6" onsubmit={handleSubmit}>
	<div class={sectionClass}>
		<h2 class="text-sm font-semibold">案件情報</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label class={labelClass} for="name">案件名 *</label>
				<Input id="name" bind:value={name} required class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="status">ステータス</label>
				<select id="status" class={selectClass} bind:value={status}>
					<option value="商談中">商談中</option>
					<option value="稼働中">稼働中</option>
					<option value="終了">終了</option>
				</select>
			</div>
			<div>
				<label class={labelClass} for="work_location">勤務地</label>
				<Input id="work_location" bind:value={work_location} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="start_date">開始日</label>
				<Input id="start_date" type="date" bind:value={start_date} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="end_date">終了日</label>
				<Input id="end_date" type="date" bind:value={end_date} class="mt-1" />
			</div>
		</div>
	</div>

	<div class={sectionClass}>
		<h2 class="text-sm font-semibold">上位会社（エンドユーザー）</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label class={labelClass} for="client_company">会社名</label>
				<Input id="client_company" bind:value={client_company} class="mt-1" />
			</div>
			<div class="sm:col-span-2">
				<label class={labelClass} for="client_address">住所</label>
				<Input id="client_address" bind:value={client_address} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="client_contact_name">担当者名</label>
				<Input id="client_contact_name" bind:value={client_contact_name} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="client_contact_tel">電話</label>
				<Input id="client_contact_tel" bind:value={client_contact_tel} class="mt-1" />
			</div>
			<div class="sm:col-span-2">
				<label class={labelClass} for="client_contact_email">メール</label>
				<Input
					id="client_contact_email"
					type="email"
					bind:value={client_contact_email}
					class="mt-1"
				/>
			</div>
		</div>
	</div>

	<div class={sectionClass}>
		<h2 class="text-sm font-semibold">仲介会社（請求先）</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label class={labelClass} for="agency_company">会社名</label>
				<Input id="agency_company" bind:value={agency_company} class="mt-1" />
			</div>
			<div class="sm:col-span-2">
				<label class={labelClass} for="agency_address">住所</label>
				<Input id="agency_address" bind:value={agency_address} class="mt-1" />
			</div>
			<div>
				<label class={labelClass} for="agency_contact_name">担当者名</label>
				<Input id="agency_contact_name" bind:value={agency_contact_name} class="mt-1" />
			</div>
			<div class="sm:col-span-2">
				<label class={labelClass} for="agency_contact_email">メール</label>
				<Input
					id="agency_contact_email"
					type="email"
					bind:value={agency_contact_email}
					class="mt-1"
				/>
			</div>
		</div>
	</div>

	<div class={sectionClass}>
		<label class={labelClass} for="remarks">備考</label>
		<textarea id="remarks" class="{selectClass} min-h-24" bind:value={remarks}></textarea>
	</div>

	<Button type="submit" disabled={isSubmitting}>
		{isSubmitting ? '保存中...' : submitLabel}
	</Button>
</form>
