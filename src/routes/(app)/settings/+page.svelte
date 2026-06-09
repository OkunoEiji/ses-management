<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { companySettings } from '$lib/stores/company-settings.svelte';

	let saved = $state(false);

	// フォームの一時状態（保存前）
	let form = $state({ ...companySettings.value });

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		companySettings.update({ ...form });
		saved = true;
		setTimeout(() => (saved = false), 2500);
	}

	function handleReset() {
		companySettings.reset();
		form = { ...companySettings.value };
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center gap-3">
		<div class="min-w-0 flex-1">
			<h1 class="text-2xl font-bold tracking-tight">会社設定</h1>
			<p class="mt-0.5 text-sm text-muted-foreground">請求書に表示する自社情報・振込先を編集します</p>
		</div>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6 max-w-2xl">

		<!-- 会社情報 -->
		<Card.Root>
			<Card.Header>
				<Card.Title>会社情報</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1">
					<label class="text-sm font-medium" for="company_name">会社名</label>
					<Input id="company_name" bind:value={form.company_name} required />
				</div>
				<div class="space-y-1">
					<label class="text-sm font-medium" for="registration_number">登録番号（インボイスNo）</label>
					<Input id="registration_number" bind:value={form.registration_number} placeholder="T1234567890123" />
				</div>
				<div class="grid grid-cols-3 gap-3">
					<div class="space-y-1">
						<label class="text-sm font-medium" for="postal_code">郵便番号</label>
						<Input id="postal_code" bind:value={form.postal_code} placeholder="000-0000" />
					</div>
					<div class="col-span-2 space-y-1">
						<label class="text-sm font-medium" for="address">住所</label>
						<Input id="address" bind:value={form.address} placeholder="大阪府大阪市西区..." />
					</div>
				</div>
				<div class="space-y-1">
					<label class="text-sm font-medium" for="building">建物名・階数</label>
					<Input id="building" bind:value={form.building} placeholder="〇〇ビル 7F（任意）" />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 振込先 -->
		<Card.Root>
			<Card.Header>
				<Card.Title>振込先</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-3 gap-3">
					<div class="col-span-2 space-y-1">
						<label class="text-sm font-medium" for="bank_name">銀行名</label>
						<Input id="bank_name" bind:value={form.bank_name} placeholder="〇〇銀行" />
					</div>
					<div class="space-y-1">
						<label class="text-sm font-medium" for="bank_branch">支店名</label>
						<Input id="bank_branch" bind:value={form.bank_branch} placeholder="〇〇支店" />
					</div>
				</div>
				<div class="space-y-1">
					<label class="text-sm font-medium" for="bank_branch_code">支店コード</label>
					<Input id="bank_branch_code" bind:value={form.bank_branch_code} placeholder="177（任意）" class="max-w-40" />
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="text-sm font-medium" for="bank_account_type">口座種別</label>
						<Input id="bank_account_type" bind:value={form.bank_account_type} placeholder="普通預金" />
					</div>
					<div class="space-y-1">
						<label class="text-sm font-medium" for="bank_account_number">口座番号</label>
						<Input id="bank_account_number" bind:value={form.bank_account_number} placeholder="1234567" />
					</div>
				</div>
				<div class="space-y-1">
					<label class="text-sm font-medium" for="bank_account_name">口座名義</label>
					<Input id="bank_account_name" bind:value={form.bank_account_name} placeholder="カブシキガイシャ〇〇" />
				</div>
			</Card.Content>
		</Card.Root>

		<div class="flex items-center gap-3">
			<Button type="submit">
				{saved ? '保存しました ✓' : '保存する'}
			</Button>
			<Button type="button" variant="outline" onclick={handleReset}>
				デフォルトに戻す
			</Button>
		</div>
	</form>
</div>
