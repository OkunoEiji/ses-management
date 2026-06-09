export const NOTES_DEFAULT = `※支払日が金融機関の休日にあたる場合は、翌営業日となります。（振込み手数料は差し引いてお支払い致します。）
※機密保護の漏洩保護に関して注意を怠り事故を起こした場合、ペナルティー等の処分を受入れるものとします。
※受注側の過失により（勤怠不良、勤務態度不良、成果物の不良）途中終了する場合がございます。
　（別途協議させて頂きます。）`;

export const DEFAULT_SENDER = {
	sender_company: '株式会社ネクストメイク',
	sender_registration_number: 'T1120101057629',
	sender_address: '〒550-0011 大阪府大阪市西区阿波座2丁目2-18 NANKAI西本町ビル 7F',
	sender_signature: ''
};

export function generateOrderNumber(type: '注文書' | '注文請書', _existingCount: number): string {
	const y = new Date().getFullYear();
	const r = String(Math.floor(Math.random() * 9000) + 1000);
	return type === '注文書' ? `${y}-${r}M` : `${y}-${r}`;
}

export function calcRates(unitPriceMan: number, hMin: number, hMax: number) {
	const yen = unitPriceMan * 10_000;
	return {
		deduction: hMin > 0 ? Math.floor(yen / hMin / 10) * 10 : 0,
		overtime: hMax > 0 ? Math.floor(yen / hMax / 10) * 10 : 0
	};
}

export function calcOrderAmounts(unitPrice: number, months: number, taxRate = 10) {
	const amount_subtotal = Math.round(unitPrice * 10_000 * months);
	const tax_amount = Math.round(amount_subtotal * (taxRate / 100));
	return { amount_subtotal, tax_amount, order_amount: amount_subtotal + tax_amount };
}
