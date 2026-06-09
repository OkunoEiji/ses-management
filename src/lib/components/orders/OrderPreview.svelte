<script lang="ts">
	import type { Order } from '$lib/mock/orders';
	import { parseDateOnly } from '$lib/utils';
	import { companySettings } from '$lib/stores/company-settings.svelte';

	type DisplayMode = 'estimate' | 'order';

	type OrderWithCost = Order & {
		cost_deduction_rate?: number | null;
		cost_overtime_rate?: number | null;
	};

	let {
		order,
		displayMode = 'order',
		ref = $bindable<HTMLElement | null>(null)
	}: {
		order: Order;
		displayMode?: DisplayMode;
		ref?: HTMLElement | null;
	} = $props();

	const o = $derived(order as OrderWithCost);
	const isEstimate = $derived(displayMode === 'estimate');
	const isUkesho = $derived(!isEstimate && o.order_type === '注文請書');
	const docTitle = $derived(isEstimate ? '見積書' : (o.order_type ?? '注文書'));

	const recipientCompany = $derived(
		isEstimate
			? (o.client_company || '')
			: (o.engineer_affiliation_company || o.client_company || '')
	);

	const displayUnitPrice = $derived.by(() => {
		if (isEstimate) return (o.unit_price ?? 0) * 10_000;
		return ((o.cost_unit_price ?? o.unit_price) ?? 0) * 10_000;
	});

	const displayOvertimeRate = $derived(
		isEstimate ? (o.overtime_rate ?? 0) : (o.cost_overtime_rate ?? o.overtime_rate ?? 0)
	);

	const displayDeductionRate = $derived(
		isEstimate ? (o.deduction_rate ?? 0) : (o.cost_deduction_rate ?? o.deduction_rate ?? 0)
	);

	const months = $derived(o.months ?? 1);
	const subtotal = $derived(Math.round(displayUnitPrice * months));
	const taxAmount = $derived(Math.round(subtotal * 0.1));
	const totalAmount = $derived(subtotal + taxAmount);

	const issueDateStr = $derived(formatJapaneseDate(o.issue_date));
	const cs = $derived(companySettings.value);

	const periodStr = $derived.by(() => {
		if (!o.period_start && !o.period_end) return '';
		const s = o.period_start ? formatJapaneseDate(o.period_start) : '';
		const e = o.period_end ? formatJapaneseDate(o.period_end) : '';
		return `${s}-${e}`;
	});

	const rootStyle =
		"width:794px;min-height:1123px;padding:36px 48px;background:#ffffff;font-family:'Noto Sans JP','Inter Variable',sans-serif;font-size:13px;color:#1a1a1a;box-sizing:border-box;";

	function fmtNum(n?: number | null): string {
		return (n ?? 0).toLocaleString();
	}

	function formatJapaneseDate(value?: string | null): string {
		if (!value) return '';
		const d = parseDateOnly(value);
		return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
	}

	const th = 'border:1px solid;padding:5px 8px;font-size:16px;text-align:center;font-weight:700;';
	const td = 'border:1px solid;padding:5px 8px;font-size:14px;';
	const tdR = td + 'text-align:right;';
	// 納入日・検収日行（下線をdashed）
	const tdD  = td  + 'border-bottom:1px dashed;';
	const tdDR = tdD + 'text-align:right;';
	// 検収日・支払日行（上線なし＝dashed境界線を上段から引き継ぐ）
	const tdN  = 'border:1px solid;border-top:none;padding:5px 8px;font-size:14px;';
	const tdNR = tdN + 'text-align:right;';
	const tdND  = tdN  + 'border-bottom:1px dashed;';
	const tdNDR = tdND + 'text-align:right;';

	// 納入日・検収日・支払日の左3列（ラベル + 毎月末日 + 数量まで）用 → 3px solid
	const tdBold = 'border:2px solid;padding:5px 8px;font-size:14px;';
	// 納入日行の左3列（下線 2px dashed）
	const tdBoldD  = tdBold + 'border-bottom:2px dashed;';
	const tdBoldDC = tdBoldD + 'text-align:center;';
	// 検収日・支払日行の左3列（上線なし、下線 2px dashed）
	const tdBoldN   = 'border:2px solid;border-top:none;padding:5px 8px;font-size:14px;';
	const tdBoldNC  = tdBoldN + 'text-align:center;';
	const tdBoldND  = tdBoldN + 'border-bottom:2px dashed;';
	const tdBoldNDC = tdBoldND + 'text-align:center;';
</script>

<div bind:this={ref} style={rootStyle}>
	<!-- 右上: 発行日・番号・登録番号 -->
	<div style="display:flex;justify-content:flex-end;margin-bottom:4px;">
		<table style="margin-left:auto;border-collapse:collapse;">
            <tbody>
                <tr>
                    <td style="padding:0 12px 0 0;white-space:nowrap;">発行日：</td>
                    <td style="padding:0;text-align:right;">{issueDateStr}</td>
                </tr>
                <tr>
                    <td style="padding:0 12px 0 0;white-space:nowrap;">
                        {isUkesho ? '注文請書番号：' : isEstimate ? '見積書番号：' : '注文書番号：'}
                    </td>
                    <td style="padding:0;text-align:right;">{o.order_number ?? '-'}</td>
                </tr>
                <tr>
                    <td style="padding:0 12px 0 0;white-space:nowrap;">登録番号：</td>
                    <td style="padding:0;text-align:right;">{cs.registration_number}</td>
                </tr>
            </tbody>
        </table>
	</div>

	<!-- タイトル -->
	<div style="text-align:center;margin:0 0 40px;">
		<h1
			style="font-size:36px;font-weight:700;letter-spacing:6px;margin:0;display:inline-block;padding-bottom:4px;"
		>
			{docTitle}
		</h1>
	</div>

	<!-- 宛先・発行元 -->
	<div style="display:flex;justify-content:space-between;align-items:flex-start;">
		<div style="flex:1;max-width:400px;">
			<div
				style="display:flex;justify-content:center;align-items:baseline;border-bottom:2px solid #333;font-size:22px;font-weight:700;margin-bottom:20px;"
			>
				<span>{recipientCompany}</span>
				<span>　御中</span>
			</div>
			{#if isEstimate}
				<p style="margin:4px 0 2px;font-size:12px;">いつもご利用いただき有難うございます。</p>
				<p style="margin:2px 0;font-size:12px;">下記の通りお見積り申し上げます。</p>
			{:else}
				<p style="margin:4px 0 2px;font-size:12px;">いつもご利用いただき有難うございます。</p>
				<p style="margin:2px 0;font-size:12px;">下記の通りご注文いたします。</p>
			{/if}
		</div>

		<div style="margin-left:auto;margin-right:20px;font-weight:700;font-size:13px;line-height:2;text-align:left;">
			<p style="margin:0;font-size:15px;">{cs.company_name}</p>
			<p style="margin:0;">〒{cs.postal_code}</p>
			<p style="margin:0;">{cs.address}</p>
			{#if cs.building}<p style="margin:0;">{cs.building}</p>{/if}
		</div>
	</div>

	<!-- 発注金額 -->
	<div style="display:flex;padding-left:10px;justify-content:space-between;align-items:baseline;border-bottom:1px solid #1a1a1a;margin-bottom:10px;width:60%;">
		<span style="font-size:18px;font-weight:800;">発注金額</span>
		<span style="font-size:20px;">￥ {fmtNum(totalAmount)} -</span>
	</div>

	<!-- 明細表（5列: 納入日ラベル12% / 内容43% / 数量10% / 単価15% / 金額20%） -->
	<table style="width:100%;border-collapse:collapse;margin-bottom:0;">
		<colgroup>
			<col style="width:18%;" />
			<col style="width:42%;" />
			<col style="width:8%;" />
			<col style="width:16%;" />
			<col style="width:16%;" />
		</colgroup>
		<thead>
			<tr style="background:#d0d8e8;">
				<th colspan="2" style={th}>品番・品名</th>
				<th style={th}>数量</th>
				<th style={th}>単価</th>
				<th style={th}>金額</th>
			</tr>
		</thead>
		<tbody>
			<!-- 案件名 -->
			<tr>
				<td colspan="2" style={td + 'font-weight:700;'}>{o.project_name || 'SES業務委託費'}</td>
				<td style={td}></td><td style={td}></td><td style={td}></td>
			</tr>
			<!-- 期間（数量・単価・金額を表示） -->
			{#if periodStr}
				<tr>
					<td colspan="2" style={td}>期間：{periodStr}</td>
					<td style={tdR}>{months}</td>
					<td style={tdR}>{fmtNum(displayUnitPrice)}</td>
					<td style={tdR + 'font-weight:500;'}>{fmtNum(subtotal)}</td>
				</tr>
			{/if}
			<!-- 基本時間幅 -->
			{#if o.standard_hours_min || o.standard_hours_max}
				<tr>
					<td colspan="2" style={td}>基本時間幅：{o.standard_hours_min}h-{o.standard_hours_max}h</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 超過単価 -->
			{#if displayOvertimeRate > 0}
				<tr>
					<td colspan="2" style={td}>超過単価：{fmtNum(displayOvertimeRate)}円（10円未満切捨）</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 控除単価 -->
			{#if displayDeductionRate > 0}
				<tr>
					<td colspan="2" style={td}>控除単価：{fmtNum(displayDeductionRate)}円（10円未満切捨）</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 契約形態 -->
			{#if o.contract_type}
				<tr>
					<td colspan="2" style={td}>契約形態：{o.contract_type}</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 清算単位 -->
			{#if o.settlement_unit}
				<tr>
					<td colspan="2" style={td}>清算単位：{o.settlement_unit}</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 交通費 -->
			{#if o.transportation}
				<tr>
					<td colspan="2" style={td}>※交通費は{o.transportation}</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 納品物 -->
			{#if o.deliverable}
				<tr>
					<td colspan="2" style={td}>※納品物：{o.deliverable}</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 作業対応 -->
			{#if o.engineer_name}
				<tr>
					<td colspan="2" style={td}>※作業対応：{o.engineer_name}</td>
					<td style={td}></td><td style={td}></td><td style={td}></td>
				</tr>
			{/if}
			<!-- 空行 -->
			<tr style="height:27px;">
				<td colspan="2" style={td}>&nbsp;</td>
				<td style={td}></td><td style={td}></td><td style={td}></td>
			</tr>

			<!-- 納入日（下線 dashed） -->
			<tr>
				<td style="{tdBoldDC}background:#e8e8e8;">納入日</td>
				<td colspan="2" style="{tdBoldD}background:#e8e8e8;">毎月末日</td>
				<td style={tdD}>小計</td>
				<td style={tdDR}>{fmtNum(subtotal)}</td>
			</tr>
			<!-- 検収日（上線なし・下線 dashed） -->
			<tr>
				<td style="{tdBoldNDC}background:#e8e8e8;">検収日</td>
				<td colspan="2" style="{tdBoldND}background:#e8e8e8;">毎月末日</td>
				<td style={tdND}>消費税（10%）</td>
				<td style={tdNDR}>{fmtNum(taxAmount)}</td>
			</tr>
			<!-- 支払日（上線なし・太字） -->
			<tr>
				<td style="{tdBoldNC}font-weight:500;background:#e8e8e8;">支払日</td>
				<td colspan="2" style="{tdBoldN}font-weight:700;">検収月の翌々月15日（45日サイト）</td>
				<td style={tdN + 'font-weight:500;'}>合計金額</td>
				<td style={tdNR + 'font-weight:500;'}>{fmtNum(totalAmount)}</td>
			</tr>
		</tbody>
	</table>

	<!-- 特記事項 -->
	<div style="margin-top:20px;">
		<p style="font-weight:500;font-size:14px;border-bottom:1px solid;padding-bottom:1px;padding-top:40px;">特記事項</p>
		<table style="width:100%;border-collapse:collapse;">
			<tbody>
				<tr>
					<td style="border:1px solid;border-top:none;padding-top:10px;font-size:12px;">
						※支払日が金融機関の休日にあたる場合は、翌営業日となります。（振込み手数料は差し引いてお支払い致します。）
					</td>
				</tr>
				<tr>
					<td style="border:1px solid;border-top:none;padding-top:10px;font-size:12px;">
						※機密保護の漏洩保護に関して注意を怠り事故を起こした場合、ペナルティー等の処分を受入れるものとします。
					</td>
				</tr>
				<tr>
					<td style="border:1px solid;border-top:none;padding-top:10px;font-size:12px;">
						※受注側の過失により（勤怠不良、勤務態度不良、成果物の不良）途中終了する場合がございます。
					</td>
				</tr>
				<tr>
					<td style="border:1px solid;border-top:none;padding-left:12px;font-size:12px;">
						（別途協議させて頂きます。）
					</td>
				</tr>
				{#if o.notes}
					<tr>
						<td style="border:1px solid;border-top:none;padding-top:10px;padding-left:12px;font-size:12px;">
							{o.notes}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>