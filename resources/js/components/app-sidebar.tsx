import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Layers3, ShieldCheck } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Accreditations',
        href: '/accreditations',
        icon: ShieldCheck,
    },
    {
        title: 'Areas',
        href: '/areas',
        icon: Layers3,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { name } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-[#003399] text-white">
            <SidebarHeader className="border-b border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="flex items-center gap-3">
                                    <div className="flex aspect-square size-10 items-center justify-center p-0.5">
                                        <img
                                            src="/images/logo-pnu.png"
                                            alt="PNU logo"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm text-white">
                                        <span className="mb-0.5 truncate leading-tight font-semibold">
                                            {name}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="text-white">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
