<script lang="ts">
    import MenuIcon from '@lucide/svelte/icons/menu';
    import { Button } from '$lib/components/ui/button';
    import Sidebar from '$lib/components/layout/Sidebar.svelte';

    let { children } = $props();
    let isSidebarOpen = $state(false);

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }
</script>

<div class="flex min-h-screen bg-background">
    <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

    <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-16 items-center border-b border-border px-4 lg:hidden">
            <Button variant="ghost" size="icon" onclick={toggleSidebar}>
                <MenuIcon class="h-5 w-5" />
            </Button>
        </header>

        <main class="flex-1 overflow-auto">
            {@render children()}
        </main>
    </div>
</div>