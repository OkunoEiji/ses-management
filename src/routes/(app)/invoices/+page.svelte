<script lang="ts">
	import { goto } from '$app/navigation';
	import Plus from '@lucide/svelte/icons/plus';
	import Eye from '@lucide/svelte/icons/eye';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import FileText from '@lucide/svelte/icons/file-text';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { invoices, type Invoice, type InvoiceStatus } from '$lib/mock/invoices';
	import { enrichInvoice, resolveDueDate } from '$lib/mock/invoice-utils';
	import { daysUntil, formatYen } from '$lib/utils';

	let deleteTarget = $state<Invoice | null>(null);
	let deleteDialogOpen = $state(false);

	const statusStyles: Record<InvoiceStatus, string> = {
		下書き: 'bg-gray-100 text-gray-700 border-gray-200',
		送付済み: 'bg-blue-50 text-blue-700 border-blue-200',
		入金確認中: 'bg-amber-50 text-amber-700 border-amber-200',
		入金済み: 'bg-emerald-50 text-emerald-700 border-emerald-200'
	};

	function displayStatus(status?: InvoiceStatus): InvoiceStatus {
		return status ?? '下書き';
	}

	function formatDisplayDate(value?: string | null): string {
		if (!value) return '-';
		return value.replace(/-/g, '/');
	}

	const sortedInvoices = $derived(
		[...invoices].sort((a, b) => {
			const aDue = resolveDueDate(a);
			const bDue = resolveDueDate(b);
			if (!aDue && !bDue) return 0;
			if (!aDue) return 1;
			if (!bDue) return -1;
			return aDue.localeCompare(bDue);
		})
	);

	function openDelete(invoice: Invoice) {
		deleteTarget = invoice;
		deleteDialogOpen = true;
	}

	function closeDelete() {
		deleteDialogOpen = false;
		deleteTarget = null;
	}

	function handleDelete() {
		if (!deleteTarget) return;
		const idx = invoices.findIndex((inv) => inv.id === deleteTarget!.id);
		if (idx >= 0) invoices.splice(idx, 1);
		closeDelete();
	}

	function dueDateMeta(inv: Invoice) {
		const due = resolveDueDate(inv);
		if (!due) {
			return { daysLeft: null as number | null, isOverdue: false, isDueSoon: false };
		}
		const daysLeft = daysUntil(due);
		const status = displayStatus(inv.status);
		const isPaid = status === '入金済み';
		return {
			daysLeft,
			isOverdue: !isPaid && daysLeft < 0,
			isDueSoon: !isPaid && daysLeft >= 0 && daysLeft <= 7
		};
	}
</script>

<div class="space-y-5 p-6">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">請求書一覧</h1>
			<p class="mt-1 text-sm text-muted-foreground">{invoices.length}件の請求書</p>
		</div>
		<Button class="gap-2" onclick={() => goto('/invoices/new')}>
			<Plus class="h-4 w-4" />
			新規作成
		</Button>
	</div>

	{#if invoices.length === 0}
		<Card.Root class="p-16 text-center text-muted-foreground">
			<FileText class="mx-auto mb-3 h-10 w-10 opacity-30" />
			<p class="font-medium">請求書がありません</p>
			<p class="mt-1 text-sm">「新規作成」から請求書を作成してください</p>
		</Card.Root>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-border bg-card">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/50">
						<Table.Head class="font-semibold">請求No</Table.Head>
						<Table.Head class="font-semibold">作業者</Table.Head>
						<Table.Head class="font-semibold">請求先</Table.Head>
						<Table.Head class="font-semibold">請求月</Table.Head>
						<Table.Head class="text-right font-semibold">合計（税込）</Table.Head>
						<Table.Head class="font-semibold">ステータス</Table.Head>
						<Table.Head class="font-semibold">お支払期限</Table.Head>
						<Table.Head class="text-center font-semibold">操作</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each sortedInvoices as inv (inv.id)}
						{@const display = enrichInvoice(inv)}
						{@const status = displayStatus(display.status)}
						{@const meta = dueDateMeta(display)}
						<Table.Row
							class="cursor-pointer {meta.isOverdue
								? 'bg-red-50 hover:bg-red-100'
								: meta.isDueSoon
									? 'bg-amber-50 hover:bg-amber-100'
									: 'hover:bg-muted/30'}"
							onclick={() => goto(`/invoices/${inv.id}`)}
						>
							<Table.Cell class="font-mono text-sm">
								{display.invoice_number ?? '-'}
							</Table.Cell>
							<Table.Cell class="font-medium">{display.engineer_name || '—'}</Table.Cell>
							<Table.Cell>{display.client_name}</Table.Cell>
							<Table.Cell>{display.billing_month}</Table.Cell>
							<Table.Cell class="text-right font-medium">
								{formatYen(display.total_amount)}
							</Table.Cell>
							<Table.Cell>
								<Badge variant="outline" class={statusStyles[status]}>
									{status}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-1">
									{#if meta.isOverdue || meta.isDueSoon}
										<AlertTriangle
											class="h-3.5 w-3.5 {meta.isOverdue
												? 'text-red-500'
												: 'text-amber-500'}"
										/>
									{/if}
									<span
										class={meta.isOverdue
											? 'font-medium text-red-600'
											: meta.isDueSoon
												? 'font-medium text-amber-600'
												: ''}
									>
										{formatDisplayDate(resolveDueDate(display))}
									</span>
									{#if meta.daysLeft !== null && status !== '入金済み'}
										<span
											class="ml-1 text-xs {meta.isOverdue
												? 'text-red-500'
												: meta.isDueSoon
													? 'text-amber-500'
													: 'text-muted-foreground'}"
										>
											{meta.isOverdue
												? `(${Math.abs(meta.daysLeft)}日超)`
												: `(残${meta.daysLeft}日)`}
										</span>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<div
									class="flex justify-center gap-1"
									role="presentation"
									onclick={(e) => e.stopPropagation()}
								>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										onclick={() => goto(`/invoices/${inv.id}`)}
									>
										<Eye class="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-destructive hover:text-destructive"
										onclick={() => openDelete(display)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}

	<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>請求書を削除しますか？</Dialog.Title>
				<Dialog.Description>この操作は取り消せません。</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={closeDelete}>キャンセル</Button>
				<Button variant="destructive" onclick={handleDelete}>削除する</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
