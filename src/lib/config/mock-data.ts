/** 書類確認などローカル開発向けにモックデータを使うか */
export function isMockDataEnabled(): boolean {
	return import.meta.env.VITE_USE_MOCK_DATA === 'true';
}
