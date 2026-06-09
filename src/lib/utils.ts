import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// 共通ユーティリティ（TODO：utils/date.ts に移行）
export function today(): string {
	return new Date().toISOString().slice(0, 10);
}
// TODO：utils/date.ts に移行
export function parseDateOnly(s: string): Date {
	const [y, m, d] = s.split('-').map(Number);
	return new Date(y, m - 1, d);
}
// TODO：utils/date.ts に移行
export function daysUntil(dueDate: string): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = parseDateOnly(dueDate);
	return Math.round((due.getTime() - today.getTime()) / 86400000);
}
// TODO：utils/currency.ts に移行
export function formatYen(n?: number | null): string {
	return n != null ? `¥${n.toLocaleString()}` : '-';
}