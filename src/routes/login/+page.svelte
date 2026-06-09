<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 class="mb-6 text-center text-2xl font-bold">SES管理システム</h1>
        <form method="POST" use:enhance class="space-y-4">
            <input name="id" placeholder="ユーザーID"
                class="w-full rounded border p-2" />
            <input name="password" type="password" placeholder="パスワード"
                class="w-full rounded border p-2" />
            {#if form?.error}
                <p class="text-sm text-red-600">{form.error}</p>
            {/if}
            <button type="submit"
                class="w-full rounded bg-blue-600 p-2 text-white">
                ログイン
            </button>
        </form>
    </div>
</div>