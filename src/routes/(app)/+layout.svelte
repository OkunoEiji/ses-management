<script lang="ts">
    import MenuIcon from '@lucide/svelte/icons/menu';
    import { Button } from '$lib/components/ui/button';
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import { companySettings } from '$lib/stores/company-settings.svelte';

    let { children, data } = $props();
    let isSidebarOpen = $state(false);

    $effect(() => {
        if (data.companySettings) {
            companySettings.set(data.companySettings);
        }
    });

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }
</script>

<div class="flex h-dvh overflow-hidden bg-background">
    <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <header class="flex h-16 shrink-0 items-center border-b border-border px-4 lg:hidden">
            <Button variant="ghost" size="icon" onclick={toggleSidebar}>
                <MenuIcon class="h-5 w-5" />
            </Button>
        </header>

        <main class="app-main min-h-0 flex-1 overflow-auto">
            {@render children()}
        </main>
    </div>
</div>