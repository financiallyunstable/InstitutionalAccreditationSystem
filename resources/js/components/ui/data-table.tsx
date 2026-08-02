import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PencilLine, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type DataTableProps<TData> = {
    columns: ColumnDef<TData, any>[];
    fetchData: (params: {
        pageIndex: number;
        pageSize: number;
        sorting: SortingState;
        globalFilter: string;
    }) => Promise<{
        rows: TData[];
        pageCount: number;
    }>;
    toolbarExtras?: ReactNode;
    onCreate?: CreateAction[];
    reloadTrigger?: number;
};

export type CreateActionBase = {
    label: string;
    className?: string;
    icon?: ReactNode;
    disabled?: boolean;
};

type ModalSpec = {
    title?: string;
    description?: string;
    className?: string;
    render: (helpers: { close: () => void }) => ReactNode;
};

export type CreateAction =
    | (CreateActionBase & { href: string })
    | (CreateActionBase & { onClick: () => void })
    | (CreateActionBase & { modal: ModalSpec });

export function DataTable<TData>({
    columns,
    fetchData,
    onCreate,
    toolbarExtras,
    reloadTrigger = 0,
}: DataTableProps<TData>) {
    const [data, setData] = useState<TData[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const mergedActions = onCreate ?? [];

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination,
            sorting,
            globalFilter,
        },
        onPaginationChange: setPagination,
        onSortingChange: (updater) => {
            const next = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(next);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        },
        onGlobalFilterChange: (value) => {
            setGlobalFilter(value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const result = await fetchData({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                sorting,
                globalFilter,
            });
            setData(result.rows);
            setPageCount(result.pageCount);
            setLoading(false);
        };

        void load();
    }, [pagination, sorting, globalFilter, fetchData, reloadTrigger]);

    return (
        <div className="overflow-x-auto">
            <div className="mb-4 flex w-full flex-wrap items-center gap-3">
                <input
                    value={globalFilter}
                    onChange={(e) => {
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                        setGlobalFilter(e.target.value);
                    }}
                    placeholder="Search"
                    className="h-11 w-full max-w-md rounded-xl border border-slate-200 px-4 text-sm shadow-sm"
                />
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:flex-nowrap">
                    {toolbarExtras ? <div className="flex items-center gap-2">{toolbarExtras}</div> : null}
                    {mergedActions.length > 0 &&
                        mergedActions.map((a, i) => {
                            const Inner = (
                                <>
                                    {a.icon ? <span className="inline-flex">{a.icon}</span> : null}
                                    {a.label}
                                </>
                            );

                            if ('modal' in a) {
                                const isOpen = openIdx === i;
                                const close = () => setOpenIdx(null);
                                return (
                                    <Dialog key={a.label + i} open={isOpen} onOpenChange={(o) => setOpenIdx(o ? i : null)}>
                                        <DialogTrigger asChild>
                                            <Button
                                                onClick={() => setOpenIdx(i)}
                                                disabled={a.disabled}
                                                className={a.className ?? 'h-11 items-center gap-2 rounded-xl px-4 primary'}
                                            >
                                                {Inner}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent
                                            className={cn('max-w-4xl', a.modal.className)}
                                            onPointerDownOutside={(e) => e.preventDefault()}
                                            onInteractOutside={(e) => e.preventDefault()}
                                            onEscapeKeyDown={(e) => e.preventDefault()}
                                        >
                                            {(a.modal.title || a.modal.description) && (
                                                <DialogHeader>
                                                    {a.modal.title && <DialogTitle>{a.modal.title}</DialogTitle>}
                                                    {a.modal.description && <DialogDescription>{a.modal.description}</DialogDescription>}
                                                </DialogHeader>
                                            )}
                                            {a.modal.render({ close })}
                                        </DialogContent>
                                    </Dialog>
                                );
                            }

                            if ('href' in a) {
                                return (
                                    <Button key={a.label + i} asChild className={a.className ?? 'h-11 rounded-xl px-4'}>
                                        <a href={a.href}>{Inner}</a>
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={a.label + i}
                                    onClick={a.onClick}
                                    disabled={a.disabled}
                                    className={a.className ?? 'h-11 rounded-xl px-4'}
                                >
                                    {Inner}
                                </Button>
                            );
                        })}
                </div>
            </div>

            <div className="relative w-full">
                <div ref={scrollRef} className="overflow-x-auto">
                    <table className="min-w-full border-t border-slate-200 text-sm text-slate-800">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="whitespace-normal break-words border-l border-border px-3 py-2 font-semibold first:border-l-0"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="cursor-pointer select-none"
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={Math.max(columns.length, 1)} className="h-24 px-3 py-6 text-center text-slate-500">
                                        Retrieving data...
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="group hover:bg-slate-50">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="border-l border-border px-3 py-3 align-middle first:border-l-0">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={Math.max(columns.length, 1)} className="px-3 py-6 text-center text-slate-500">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-500">
                    Page {pagination.pageIndex + 1} of {Math.max(pageCount, 1)}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
