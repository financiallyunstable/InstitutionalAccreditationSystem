import { Head, Link, router } from '@inertiajs/react';
import { createColumnHelper, type SortingState } from '@tanstack/react-table';
import { Layers3, PencilLine, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import Heading from '@/components/heading';
import { ComboBox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

type Area = {
    id: number;
    accreditation_id: number;
    accreditation_name: string | null;
    name: string;
    description: string | null;
    video: string | null;
    video_url: string | null;
};

type Props = {
    canCreate: boolean;
    accreditations: Array<{
        id: number;
        name: string;
        status: 'disabled' | 'active' | 'default';
    }>;
    defaultAccreditationId: number | null;
};

const columnHelper = createColumnHelper<Area>();

const columns = [
    columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('accreditation_name', {
        header: 'Accreditation',
        cell: (info) => info.getValue() ?? '-',
    }),
    columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => info.getValue() ?? '-',
    }),
    columnHelper.accessor('video', {
        header: 'Video',
        cell: (info) =>
            info.row.original.video_url ? (
                <a className="text-[#003399] underline" href={info.row.original.video_url} target="_blank" rel="noreferrer">
                    View
                </a>
            ) : (
                '-'
            ),
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            <div className="flex justify-center gap-2">
                <Button asChild size="sm" variant="outline">
                    <Link href={`/areas/${row.original.id}/edit`}>
                        <PencilLine className="h-4 w-4" />
                        Edit
                    </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                    <Link href={`/indicators?accreditation_id=${row.original.accreditation_id}&area_id=${row.original.id}`}>
                        <Layers3 className="h-4 w-4" />
                        Indicators
                    </Link>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        if (confirm('Delete this area?')) {
                            router.delete(`/areas/${row.original.id}`, {
                                preserveScroll: true,
                                onSuccess: async () => {
                                    await Swal.fire({
                                        icon: 'success',
                                        title: 'Area deleted',
                                        timer: 1500,
                                        showConfirmButton: false,
                                    });
                                },
                                onError: async () => {
                                    await Swal.fire({
                                        icon: 'error',
                                        title: 'Delete failed',
                                        text: 'Please try again.',
                                    });
                                },
                            });
                        }
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </div>
        ),
    }),
];

export default function Index({ canCreate, accreditations, defaultAccreditationId }: Props) {
    const [accreditationId, setAccreditationId] = useState<string>(
        defaultAccreditationId ? String(defaultAccreditationId) : '',
    );

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
        if (accreditationId) {
            params.set('accreditation_id', accreditationId);
        }

        const response = await fetch(`/areas/data?${params.toString()}`, {
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load areas');
        }

        return (await response.json()) as {
            rows: Area[];
            pageCount: number;
        };
    };

    return (
        <>
            <Head title="Areas" />
            <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                        <Heading title="Areas" description="Create and manage areas" />
                    </div>
                    <Button
                        className="bg-[#003399] text-white hover:bg-[#002266]"
                        onClick={async () => {
                            if (!canCreate) {
                                await Swal.fire({
                                    icon: 'warning',
                                    title: 'No accreditation found',
                                    text: 'Create an accreditation first before adding areas.',
                                });
                                return;
                            }

                            router.visit('/areas/create');
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Add area
                        </Button>
                    </div>

                <div className="w-full rounded-2xl border border-[#003399] bg-[#003399] p-4 shadow-sm">
                    <div className="w-full md:w-1/3 grid gap-2">
                        <Label htmlFor="accreditation-filter" className="text-white">
                            Accreditation Filter
                        </Label>
                        <ComboBox
                            id="accreditation-filter"
                            value={accreditationId}
                            onChange={setAccreditationId}
                            placeholder="Select accreditation"
                            className="w-full"
                            options={accreditations.map((accreditation) => ({
                                value: String(accreditation.id),
                                label: `${accreditation.name}${accreditation.status === 'default' ? ' (Default)' : ''}`,
                            }))}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-[#003399]/10 bg-white p-6 shadow-sm">
                    <DataTable columns={columns} fetchData={fetchData} />
                </div>
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Areas',
        href: '/areas',
    },
];

Index.layout = {
    breadcrumbs,
};
