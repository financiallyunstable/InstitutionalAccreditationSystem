import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs,
};
