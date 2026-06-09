import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

async function hashPassword(password: string): Promise<string> {
    const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password)
    );
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export const actions: Actions = {
    default: async ({ request, cookies, platform }) => {
        const form = await request.formData();
        const id = form.get('id') as string;
        const password = form.get('password') as string;

        const adminId = (platform?.env as unknown as Record<string, string>)?.ADMIN_ID
            ?? import.meta.env.VITE_ADMIN_ID;
        const adminHash = (platform?.env as unknown as Record<string, string>)?.ADMIN_PASSWORD_HASHORD_HASH
            ?? import.meta.env.VITE_ADMIN_PASSWORD_HASH;

        const inputHash = await hashPassword(password);

        if (!id || !password || id !== adminId || inputHash !== adminHash) {
            return fail(400, { error: 'IDまたはパスワードが違います' });
        }

        cookies.set('session', crypto.randomUUID(), {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 8
        });

        redirect(302, '/dashboard');
    }
};