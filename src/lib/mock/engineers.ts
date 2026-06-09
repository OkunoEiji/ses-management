export type Engineer = {
    id: string;
    name: string;
    name_kana?: string;
    age?: number;
    gender?: '男性' | '女性' | 'その他';
    nearest_station?: string;
    experience_years?: number;
    skills: string[];
    skill_summary?: string;
    desired_unit_price?: number;
    min_unit_price?: number;
    status: '待機中' | '商談中' | '稼働中' | '退場予定';
    availability_date?: string;
    project_id?: string;
    current_project?: string;
    contract_end_date?: string;
    engineer_type: '自社' | 'BP' | 'フリーランス';
    affiliation_company?: string;
    parent_company?: string;
    billing_unit_price?: number;
    standard_hours_min?: number;
    standard_hours_max?: number;
    hourly_deduction_rate?: number;
    hourly_overtime_rate?: number;
    cost_unit_price?: number;
    cost_deduction_rate?: number;
    cost_overtime_rate?: number;
    remarks?: string;
};

export const engineers: Engineer[] = [
    {
        id: '1',
		name: '山田太郎',
		name_kana: 'やまだたろう',
		age: 32,
		gender: '男性',
		nearest_station: '渋谷駅',
		experience_years: 8,
		skills: ['Java', 'Spring', 'AWS'],
		skill_summary: '金融系SIのバックエンド開発が中心。設計〜実装まで対応可能。',
		desired_unit_price: 70,
		min_unit_price: 65,
		status: '待機中',
		availability_date: '2026-06-01',
		engineer_type: 'フリーランス',
		remarks: 'リモート希望。週4日も相談可。'
    },
    {
        id: '2',
		name: '佐藤花子',
		name_kana: 'さとうはなこ',
		age: 28,
		gender: '女性',
		nearest_station: '品川駅',
		experience_years: 5,
		skills: ['React', 'TypeScript', 'Next.js'],
		skill_summary: 'フロントエンドエンジニア。SPA/SSRいずれも経験あり。',
		desired_unit_price: 65,
		min_unit_price: 60,
		status: '稼働中',
		project_id: 'p1',
		current_project: '基幹システム保守開発',
		contract_end_date: '2026-09-30',
		engineer_type: '自社',
		billing_unit_price: 68,
		standard_hours_min: 140,
		standard_hours_max: 180,
		hourly_deduction_rate: 5000,
		hourly_overtime_rate: 5000,
		cost_unit_price: 55,
		remarks: '週5日・常駐可'
    },
    {
		id: '3',
		name: '鈴木一郎',
		name_kana: 'すずきいちろう',
		age: 38,
		gender: '男性',
		nearest_station: '新宿駅',
		experience_years: 12,
		skills: ['Go', 'AWS', 'Terraform'],
		skill_summary: 'インフラ〜バックエンド。クラウド移行案件のリード経験あり。',
		desired_unit_price: 80,
		min_unit_price: 75,
		status: '退場予定',
		project_id: 'p3',
		current_project: 'データ基盤整備',
		contract_end_date: '2026-07-31',
		availability_date: '2026-08-01',
		engineer_type: 'BP',
		affiliation_company: '株式会社テックパートナー',
		parent_company: '株式会社クライアントA',
		billing_unit_price: 82,
		standard_hours_min: 140,
		standard_hours_max: 180,
		hourly_deduction_rate: 6000,
		hourly_overtime_rate: 6000,
		cost_unit_price: 70,
		cost_deduction_rate: 5000,
		cost_overtime_rate: 5000
	},
	{
		id: '4',
		name: '田中次郎',
		name_kana: 'たなかじろう',
		age: 35,
		gender: '男性',
		nearest_station: '池袋駅',
		experience_years: 10,
		skills: ['Python', 'Django', 'PostgreSQL'],
		skill_summary: 'Pythonバックエンド。API設計・DB設計が得意。',
		desired_unit_price: 75,
		min_unit_price: 70,
		status: '商談中',
		engineer_type: 'フリーランス',
		availability_date: '2026-05-15',
		remarks: '面談調整中'
	},
	{
		id: '5',
		name: '高橋美咲',
		name_kana: 'たかはしみさき',
		age: 26,
		gender: '女性',
		nearest_station: '横浜駅',
		experience_years: 3,
		skills: ['Vue.js', 'Nuxt', 'Figma'],
		skill_summary: 'フロントエンド＋簡易デザイン対応。',
		desired_unit_price: 55,
		status: '待機中',
		availability_date: '2026-05-20',
		engineer_type: '自社',
		remarks: '未経験領域は要相談'
	}
];

export function findEngineer(id: string): Engineer | undefined {
	return engineers.find((e) => e.id === id);
}

export function findEngineersByProjectId(projectId: string): Engineer[] {
	return engineers.filter((e) => e.project_id === projectId);
}