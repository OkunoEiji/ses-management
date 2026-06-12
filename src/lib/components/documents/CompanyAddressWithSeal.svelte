<script lang="ts">
	import type { CompanySettings } from '$lib/types';
	import companySeal from '$lib/assets/invoices/nextmake-hanko.png?w=200&format=webp';

	const SEAL_SIZE_PX = 96;

	let {
		company,
		containerStyle = ''
	}: {
		company: CompanySettings;
		containerStyle?: string;
	} = $props();
</script>

<div
	style="display:inline-block;font-weight:700;font-size:13px;line-height:2;text-align:left;{containerStyle}"
>
	<div style="position:relative;">
		<p style="margin:0;font-size:15px;">{company.company_name}</p>
		<img
			src={companySeal}
			alt=""
			crossorigin="anonymous"
			width={SEAL_SIZE_PX}
			height={SEAL_SIZE_PX}
			style="display:inline-block;position:absolute;right:-10px;top:0;width:{SEAL_SIZE_PX}px;height:{SEAL_SIZE_PX}px;object-fit:contain;z-index:1;pointer-events:none;"
		/>
	</div>
	<p style="margin:0;">〒{company.postal_code}</p>
	<p style="margin:0;">{company.address}</p>
	{#if company.building}
		<p style="margin:0;">{company.building}</p>
	{/if}
</div>
