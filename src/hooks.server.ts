import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');
    const path = event.url.pathname;

    if (!session && !PUBLIC_ROUTES.some(r => path.startsWith(r))) {
        redirect(302, '/login');
    }

    const response = await resolve(event);

    if (
        event.request.method === 'GET' &&
        response.headers.get('content-type')?.includes('text/html')
    ) {
        response.headers.set('Cache-Control', 'no-cache');
    }

    return response;
};