import { Head, Link } from '@inertiajs/react';
import { createColumnHelper, type SortingState } from '@tanstack/react-table';
import { PencilLine, Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { type BreadcrumbItem } from '@/types';

type Accreditation = {
    id: number;
    name: string;
    year: number;
    status: 'disabled' | 'active' | 'default';
};

const statusStyles: Record<Accreditation['status'], string> = {
    active: 'bg-emerald-500/10 text-emerald-700',
    disabled: 'bg-red-500/10 text-red-700',
    default: 'bg-[#003399]/10 text-[#003399]',
};

const columnHelper = createColumnHelper<Accreditation>();

const columns = [
    columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('year', {
        header: 'Year',
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
            <div className="flex justify-center">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[info.getValue()]}`}>
                    {info.getValue()}
                </span>
            </div>
        ),
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            <div className="flex justify-center gap-2">
                <Button asChild size="sm" variant="outline">
                    <Link href={`/accreditations/${row.original.id}/edit`}>
                        <PencilLine className="h-4 w-4" />
                        Edit
                    </Link>
                </Button>
            </div>
        ),
    }),
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accreditations',
        href: '/accreditations',
    },
];

export default function Index() {
    const fetchData = async ({
        pageIndex,
        pageSize,
        sorting,
        globalFilter,
    }: {
        pageIndex: number;
        pageSize: number;
        sorting: SortingState;
        globalFilter: string;
    }) => {
        const params = new URLSearchParams();
        params.set('pageIndex', String(pageIndex));
        params.set('pageSize', String(pageSize));
        params.set('search', globalFilter);
        params.set('sorting', JSON.stringify(sorting));

        const response = await fetch(`/accreditations/data?${params.toString()}`, {
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load accreditations');
        }

        const all = (await response.json()) as {
            rows: Accreditation[];
            pageCount: number;
        };

        return all;
    };

    return (
        <>
            <Head title="Accreditations" />

            <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Accreditations"
                        description="Create and manage accreditation records"
                    />

                    <Button asChild className="bg-[#003399] text-white hover:bg-[#002266]">
                        <Link href="/accreditations/create">
                            <Plus className="h-4 w-4" />
                            Add accreditation
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-[#003399]/10 bg-white p-6 shadow-sm">
                    <DataTable
                        columns={columns}
                        fetchData={fetchData}
                    />
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs,
};
