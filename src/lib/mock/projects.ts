export type ProjectStatus = '商談中' | '稼働中' | '終了';

export type Project = {
    id: string;
    name: string;
    client_company?: string | null;
    client_address?: string | null;
	client_contact_name?: string | null;
	client_contact_email?: string | null;
	client_contact_tel?: string | null;
	agency_company?: string | null;
	agency_address?: string | null;
	agency_contact_name?: string | null;
	agency_contact_email?: string | null;
	status?: ProjectStatus; // 未指定なら '商談中'
	start_date?: string | null; // YYYY-MM-DD
	end_date?: string | null;
	work_location?: string | null;
	remarks?: string | null;
};

export const projects: Project[] = [
	{
		id: 'p1',
		name: '基幹システム保守開発',
		client_company: '株式会社クライアントA',
		client_contact_name: '山田 次郎',
		client_contact_email: 'taro.yamada@example.com',
		agency_company: '株式会社エージェントX',
		agency_contact_name: '佐藤 花子',
		status: '稼働中',
		start_date: '2026-06-01',
		end_date: '2026-09-30',
		work_location: '東京都内（リモート可）',
		remarks: '体制増員検討中'
	},
	{
		id: 'p2',
		name: 'ECサイト機能追加',
		client_company: '株式会社クライアントB',
		agency_company: null,
		status: '商談中',
		start_date: '2026-07-01',
		work_location: '大阪市内',
		remarks: null
	},
	{
		id: 'p3',
		name: 'データ基盤整備',
		client_company: '株式会社クライアントC',
		agency_company: '株式会社パートナーY',
		status: '終了',
		start_date: '2025-10-01',
		end_date: '2026-03-31',
		work_location: null,
		remarks: '次フェーズ検討中'
	}
];

export function findProject(id: string): Project | undefined {
	return projects.find((p) => p.id === id);
}