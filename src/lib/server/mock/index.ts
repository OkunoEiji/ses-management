import { engineers as mockEngineers } from '$lib/mock/engineers';
import { findInvoice, invoices as mockInvoices } from '$lib/mock/invoices';
import { findOrderSheet, orderSheets as mockOrders } from '$lib/mock/orders';
import { projects as mockProjects } from '$lib/mock/projects';
import type { CompanySettings, Engineer, Invoice, Order, Project } from '$lib/types';
import { DEFAULT_COMPANY_SETTINGS } from '$lib/utils/invoice-utils';

export function mockGetCompanySettings(): CompanySettings {
	return { ...DEFAULT_COMPANY_SETTINGS };
}

export function mockListInvoices(): Invoice[] {
	return mockInvoices;
}

export function mockGetInvoice(id: string): Invoice | null {
	return findInvoice(id) ?? null;
}

export function mockListOrders(): Order[] {
	return mockOrders;
}

export function mockGetOrder(id: string): Order | null {
	return findOrderSheet(id) ?? null;
}

export function mockListEngineers(): Engineer[] {
	return mockEngineers as Engineer[];
}

export function mockListProjects(): Project[] {
	return mockProjects as Project[];
}

export function mockGetEngineer(id: string): Engineer | null {
	return mockListEngineers().find((e) => e.id === id) ?? null;
}

export function mockGetProject(id: string): Project | null {
	return mockListProjects().find((p) => p.id === id) ?? null;
}
