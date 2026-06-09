<script lang="ts">
	import type { InvoicePreviewData } from '$lib/mock/invoice-utils';
	import {
		buildInvoiceLineRows,
		INVOICE_PREVIEW_PAGE_HEIGHT_PX,
		INVOICE_PREVIEW_PAGE_WIDTH_PX,
		resolveDueDate
	} from '$lib/mock/invoice-utils';
	import { parseDateOnly, today } from '$lib/utils';

	let {
		invoice,
		ref = $bindable<HTMLElement | null>(null)
	}: {
		invoice: InvoicePreviewData;
		ref?: HTMLElement | null;
	} = $props();

	const lineRows = $derived(buildInvoiceLineRows(invoice));

	const pageW = `${INVOICE_PREVIEW_PAGE_WIDTH_PX}px`;
	const border = '1px solid #000';
	const headBg = '#bdd7ee';
	const stripeBg = '#f0f7ff';

	const rootStyle = [
		`width:${pageW}`,
		`min-height:${INVOICE_PREVIEW_PAGE_HEIGHT_PX}px`,
		`padding:28px 36px 36px`,
		'background:#fff',
		"font-family:'Noto Sans JP','Hiragino Sans','Meiryo',sans-serif",
		'font-size:15px',
		'color:#000',
		'box-sizing:border-box',
		'line-height:1.55'
	].join(';');

	function fmtYen(n?: number | null): string {
		return `¥${(n ?? 0).toLocaleString()}`;
	}

	function fmtGridAmount(value: string): string {
		if (!value.trim()) return '';
		const n = Number(value);
		if (Number.isNaN(n)) return value;
		return n.toLocaleString();
	}

	function formatJapaneseDate(value?: string | null): string {
		if (!value) return '';
		const d = parseDateOnly(value);
		return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
	}

	const issueDateStr = $derived(
		formatJapaneseDate(invoice.issue_date ?? invoice.created_at ?? today())
	);
	const dueDateStr = $derived(formatJapaneseDate(resolveDueDate(invoice)));

	const thStyle = `border:${border};padding:4px 6px;text-align:center;font-weight:700;background:${headBg};font-size:13px;`;
	const tdStyle = `border:${border};padding:5px 8px;font-size:13px;height:27px;vertical-align:middle;`;
</script>

<div bind:this={ref} style={rootStyle}>
	<!-- ヘッダー上段: 左=グレー帯+タイトル / 右=日付・請求No・登録番号 -->
	<div style="display:flex;justify-content:space-between;align-items:flex-start;">
		<div style="width:50%;">
			<div style="background:{headBg};width:280px;height:24px;margin-bottom:4px;"></div>
			<h1 style="font-size:26px;font-weight:700;letter-spacing:0.3em;text-align:center;width:280px;">
				請求書
			</h1>
			<div style="border-bottom:2px solid #000;width:280px;"></div>
		</div>

		<div style="width:46%;font-size:13px;line-height:2;">
			<table style="margin-left:auto;border-collapse:collapse;">
				<tbody>
					<tr>
						<td style="padding:0 8px 0 0;white-space:nowrap;">日付：</td>
						<td style="padding:0;text-align:right;">{issueDateStr}</td>
					</tr>
					<tr>
						<td style="padding:0 8px 0 0;white-space:nowrap;">請求No</td>
						<td style="padding:0;text-align:right;">{invoice.invoice_number ?? ''}</td>
					</tr>
					<tr>
						<td style="padding:0 8px 0 0;white-space:nowrap;">登録番号</td>
						<td style="padding:0;text-align:right;">{invoice.company.registration_number}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<!-- ヘッダー下段: 左=請求先+挨拶 / 右=発行元 -->
	<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
		<div style="width:50%;padding-top:24px;display:flex;flex-direction:column;">
			<div
				style="border-bottom:1px solid #000;min-height:20px;padding-bottom:3px;font-size:20px;font-weight:700;text-align:center;"
			>
				{invoice.client_name}
				{#if invoice.client_name}
					<span style="font-size:25px;">　御中</span>
				{/if}
			</div>
			<p style="margin:0 0 0 30px;padding-top:55px;width:100%;font-size:13px;text-align:center;">
				平素は格別のご高配を賜り、誠にありがとうございます。<br />
				下記の通りご請求申し上げます。
			</p>
		</div>

		<div style="margin-left:auto;margin-right:20px;padding-top:40px;font-weight:700;font-size:13px;line-height:2;text-align:left;">
			<p style="margin:0;font-size:15px;">{invoice.company.company_name}</p>
			<p style="margin:0;">〒{invoice.company.postal_code}</p>
			<p style="margin:0;">{invoice.company.address}</p>
			{#if invoice.company.building}
				<p style="margin:0;">{invoice.company.building}</p>
			{/if}
		</div>
	</div>

	<!-- 合計金額 -->
	<p style="margin:0 0 20px;font-size:20px;display:flex;align-items:baseline;">
		<span style="display:inline-block;width:60%;border-bottom:1px solid #000;padding-bottom:2px;">
			<span style="margin-left:70px;font-weight:700;">合計金額：</span>
			<span style="font-size:24px;font-weight:700;margin:0 0 0 80px;">{fmtYen(invoice.total_amount)}</span>
		</span>
		<span style="margin-left:14px;font-size:14px;">(税込)</span>
	</p>

	<!-- 明細テーブル -->
	<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:0;">
		<colgroup>
			<col style="width:60%;" />
			<col style="width:10%;" />
			<col style="width:15%;" />
			<col style="width:15%;" />
		</colgroup>
		<thead>
			<tr>
				<th style={thStyle}>品番・品名</th>
				<th style={thStyle}>数量</th>
				<th style={thStyle}>単価</th>
				<th style={thStyle}>金額</th>
			</tr>
		</thead>
		<tbody>
			{#each lineRows as row, idx (idx)}
				<tr style="background:{idx % 2 === 0 ? '#fff' : stripeBg};">
					<td style="{tdStyle}">{row.description}</td>
					<td style="{tdStyle};text-align:right;">{row.quantity}</td>
					<td style="{tdStyle};text-align:right;">{fmtGridAmount(row.unitPrice)}</td>
					<td style="{tdStyle};text-align:right;">{fmtGridAmount(row.amount)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- お支払期限（左） + 小計〜交通費（右）：同じ高さに横並び -->
	<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:6px;font-size:20px;">
		<p style="margin:0;padding-top:30px;">
			<span style="">お支払期限：</span>
			<span style="display:inline-block;min-width:180px;">
				{dueDateStr}{#if dueDateStr}（45日サイト）{/if}
			</span>
		</p>

		<div style="width:210px;font-size:13px;font-weight:700;">
			<div style="display:flex;justify-content:space-between;padding:3px 4px;">
				<span>小計</span>
				<span>{fmtYen(invoice.amount)}</span>
			</div>
			<div style="display:flex;justify-content:space-between;padding:3px 4px;border-bottom:1px solid #000;">
				<span>消費税({invoice.tax_rate}%)</span>
				<span>{fmtYen(invoice.tax_amount)}</span>
			</div>
			<div style="display:flex;justify-content:space-between;padding:3px 4px;">
				<span>交通費・宿泊費</span>
				<span>{fmtYen(invoice.travel_expenses)}</span>
			</div>
			<div style="display:flex;justify-content:space-between;padding:3px 4px;">
				<span>合計金額</span>
				<span>{fmtYen(invoice.total_amount)}</span>
			</div>
		</div>
	</div>

	<!-- お振込先 table の上線と結合 -->
	<div style="display:flex;justify-content:space-between;padding:0 4px;border-top:1px solid #000;font-size:11px;font-weight:700;">
	</div>

	<!-- お振込先（上線と下線と結合） -->
	<table style="border-collapse:collapse;width:60%;font-weight:700;margin-top:0;">
		<tbody>
			<tr>
				<td
					style="border:{border};border-top:none;background:{stripeBg};padding:10px 18px;font-weight:700;text-align:center;vertical-align:middle;width:200px;"
				>
					お振込先
				</td>
				<td style="border:{border};border-top:none;padding:5px;line-height:1.5;">
					<p style="margin:0;">{invoice.company.bank_name} {invoice.company.bank_branch}{invoice.company.bank_branch_code ? `(${invoice.company.bank_branch_code})` : ''}</p>
					<p style="margin:0;">{invoice.company.bank_account_type}　{invoice.company.bank_account_name}</p>
					<p style="margin:0;">口座：{invoice.company.bank_account_number}</p>
				</td>
			</tr>
		</tbody>
	</table>

	{#if invoice.notes}
		<p style="margin:14px 0 0;font-size:10px;white-space:pre-wrap;">{invoice.notes}</p>
	{/if}
</div>
