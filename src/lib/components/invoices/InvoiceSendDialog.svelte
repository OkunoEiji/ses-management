<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Send from '@lucide/svelte/icons/send';
	import {
		buildInvoiceEmailDefaults,
		type InvoicePreviewData
	} from '$lib/mock/invoice-utils';
	import { sendInvoiceEmail } from '$lib/mock/invoice-send-logs';
	import { companySettings } from '$lib/stores/company-settings.svelte';

	let {
		open = $bindable(false),
		preview,
		invoiceId,
		pdfRef = null,
		clientContactName = null,
		clientContactEmail = null,
		onSent
	}: {
		open?: boolean;
		preview: InvoicePreviewData;
		invoiceId: string;
		pdfRef?: HTMLElement | null;
		clientContactName?: string | null;
		clientContactEmail?: string | null;
		onSent?: () => void;
	} = $props();

	const pdfFilename = $derived(`請求書_${preview.invoice_number ?? preview.id}.pdf`);

	let confirmOpen = $state(false);
	let sending = $state(false);
	let sendingPhase = $state<'pdf' | 'mail' | null>(null);

	let fromEmail = $state('');
	let toEmail = $state('');
	let subject = $state('');
	let body = $state('');

	const senderOptions = $derived.by(() => {
		const cs = companySettings.value;
		return [
			{ value: cs.sender_email_primary, label: cs.sender_email_primary },
			{ value: cs.sender_email_secondary, label: cs.sender_email_secondary }
		].filter((opt, i, arr) => opt.value && arr.findIndex((o) => o.value === opt.value) === i);
	});

	const selectClass =
		'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:ring-3';
	const textareaClass =
		selectClass + ' min-h-[12rem] resize-y py-2 leading-relaxed';
	const labelClass = 'text-sm font-medium';

	function resetForm() {
		const defaults = buildInvoiceEmailDefaults(preview, {
			clientContactName,
			clientContactEmail
		});
		fromEmail = defaults.fromEmail;
		toEmail = defaults.toEmail;
		subject = defaults.subject;
		body = defaults.body;
	}

	$effect(() => {
		if (open) resetForm();
	});

	function validateForm(): boolean {
		if (!fromEmail.trim()) {
			alert('送信元メールアドレスを選択してください');
			return false;
		}
		if (!toEmail.trim()) {
			alert('送信先メールアドレスを入力してください');
			return false;
		}
		if (!subject.trim()) {
			alert('件名を入力してください');
			return false;
		}
		if (!body.trim()) {
			alert('本文を入力してください');
			return false;
		}
		return true;
	}

	function handleSendClick() {
		if (!validateForm()) return;
		confirmOpen = true;
	}

	function closeConfirm() {
		confirmOpen = false;
	}

	async function handleConfirmSend() {
		if (!pdfRef) {
			alert('請求書プレビューの準備ができていません');
			return;
		}

		sending = true;
		sendingPhase = 'pdf';
		try {
			const { generatePdfBase64 } = await import('$lib/utils/pdf-download');
			const content_base64 = await generatePdfBase64(pdfRef);

			sendingPhase = 'mail';
			await sendInvoiceEmail({
				invoice_id: invoiceId,
				from_email: fromEmail.trim(),
				to_email: toEmail.trim(),
				subject: subject.trim(),
				body: body.trim(),
				status: 'sent',
				attachment: {
					filename: pdfFilename,
					content_base64
				}
			});
			confirmOpen = false;
			open = false;
			onSent?.();
		} catch (e) {
			console.error(e);
			alert(sendingPhase === 'pdf' ? 'PDF生成に失敗しました' : 'メール送付に失敗しました');
		} finally {
			sending = false;
			sendingPhase = null;
		}
	}

	const sendingLabel = $derived.by(() => {
		if (!sending) return '送付';
		if (sendingPhase === 'pdf') return 'PDF生成中...';
		return '送付中...';
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>請求書を送付する</Dialog.Title>
			<Dialog.Description>メールで請求書PDFを送付します。</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label class={labelClass} for="send-from">送信元メールアドレス</label>
				<select id="send-from" class={selectClass} bind:value={fromEmail}>
					{#each senderOptions as opt (opt.value)}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-1.5">
				<label class={labelClass} for="send-to">送信先メールアドレス</label>
				<Input id="send-to" type="email" bind:value={toEmail} placeholder="example@company.co.jp" />
			</div>

			<div class="space-y-1.5">
				<label class={labelClass} for="send-subject">件名</label>
				<Input id="send-subject" bind:value={subject} />
			</div>

			<div class="space-y-1.5">
				<label class={labelClass} for="send-body">本文</label>
				<textarea id="send-body" class={textareaClass} bind:value={body}></textarea>
			</div>

			<p class="text-xs text-muted-foreground">
				添付ファイル: {pdfFilename}
			</p>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>キャンセル</Button>
			<Button class="gap-1.5" onclick={handleSendClick}>
				<Send class="h-3.5 w-3.5" />
				送付
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>送付の確認</Dialog.Title>
			<Dialog.Description>
				{toEmail} 宛に請求書（{pdfFilename}）を添付して送付します。よろしいですか？
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={closeConfirm} disabled={sending}>キャンセル</Button>
			<Button onclick={handleConfirmSend} disabled={sending}>
				{sendingLabel}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
