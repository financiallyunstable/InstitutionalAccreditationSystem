import { Head, router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight, GripVertical, PencilLine, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect, useState, type DragEvent, type FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { ComboBox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

type Area = {
    id: number;
    name: string;
    accreditation_id?: number;
};

type Accreditation = {
    id: number;
    name: string;
    status: 'disabled' | 'active' | 'default';
};

type Indicator = {
    id: number;
    parent_id: number | null;
    sort_order: number;
    title: string;
};

type Props = {
    area: Area | null;
    indicators?: Indicator[];
    moduleMode?: boolean;
    accreditations?: Accreditation[];
    areas?: Area[];
    selectedAccreditationId?: number | null;
    selectedAreaId?: number | null;
};

type IndicatorNode = Indicator & {
    children: IndicatorNode[];
};

function buildTree(indicators: Indicator[]): IndicatorNode[] {
    const nodes = new Map<number, IndicatorNode>();
    const roots: IndicatorNode[] = [];

    for (const indicator of indicators) {
        nodes.set(indicator.id, { ...indicator, children: [] });
    }

    for (const indicator of indicators) {
        const node = nodes.get(indicator.id);
        if (!node) continue;

        if (indicator.parent_id === null) {
            roots.push(node);
        } else {
            const parent = nodes.get(indicator.parent_id);
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        }
    }

    return roots;
}

function cloneTree(nodes: IndicatorNode[]): IndicatorNode[] {
    return nodes.map((node) => ({
        ...node,
        children: cloneTree(node.children),
    }));
}

function findNode(nodes: IndicatorNode[], id: number): IndicatorNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        const child = findNode(node.children, id);
        if (child) return child;
    }

    return null;
}

function findParentList(nodes: IndicatorNode[], parentId: number | null): IndicatorNode[] | null {
    if (parentId === null) return nodes;

    const parent = findNode(nodes, parentId);
    return parent ? parent.children : null;
}

function reorderSiblingList(nodes: IndicatorNode[], draggedId: number, targetId: number, parentId: number | null): IndicatorNode[] {
    const next = cloneTree(nodes);
    const siblings = findParentList(next, parentId);
    if (!siblings) return next;

    const fromIndex = siblings.findIndex((node) => node.id === draggedId);
    const toIndex = siblings.findIndex((node) => node.id === targetId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return next;

    const [moved] = siblings.splice(fromIndex, 1);
    siblings.splice(toIndex, 0, moved);

    return next;
}

function getSiblingOrder(nodes: IndicatorNode[], parentId: number | null): number[] {
    const siblings = findParentList(nodes, parentId);
    return siblings ? siblings.map((node) => node.id) : [];
}

function InlineCreate({
    area,
    parentId,
    onDone,
}: {
    area: Area;
    parentId: number | null;
    onDone: () => void;
}) {
    const form = useForm({
        parent_id: parentId ? String(parentId) : '',
        title: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post(`/areas/${area.id}/indicators`, {
            preserveScroll: true,
            onSuccess: async () => {
                await Swal.fire({
                    icon: 'success',
                    title: 'Indicator created',
                    timer: 1200,
                    showConfirmButton: false,
                });
                onDone();
                router.reload({ preserveScroll: true });
            },
        });
    };

    return (
        <form onSubmit={submit} className="ml-6 rounded border border-dashed border-slate-300 bg-white px-3 py-3">
            <div className="grid gap-1">
                <Label className="text-xs" htmlFor={`title-${parentId ?? 'root'}`}>
                    Title
                </Label>
                <textarea
                    id={`title-${parentId ?? 'root'}`}
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    placeholder="Indicator title"
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <InputError message={form.errors.title} />
            </div>
            <div className="mt-3 flex items-center gap-2">
                <Button type="submit" size="sm" className="bg-[#003399] text-white hover:bg-[#002266]">
                    Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={onDone}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function InlineEdit({
    area,
    indicator,
    onDone,
}: {
    area: Area;
    indicator: IndicatorNode;
    onDone: () => void;
}) {
    const form = useForm({
        title: indicator.title,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.put(`/areas/${area.id}/indicators/${indicator.id}`, {
            preserveScroll: true,
            onSuccess: async () => {
                await Swal.fire({
                    icon: 'success',
                    title: 'Indicator updated',
                    timer: 1200,
                    showConfirmButton: false,
                });
                onDone();
                router.reload({ preserveScroll: true });
            },
        });
    };

    return (
        <form onSubmit={submit} className="ml-6 rounded border border-dashed border-slate-300 bg-white px-3 py-3">
            <div className="grid gap-1">
                <Label className="text-xs" htmlFor={`edit-title-${indicator.id}`}>
                    Title
                </Label>
                <textarea
                    id={`edit-title-${indicator.id}`}
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <InputError message={form.errors.title} />
            </div>
            <div className="mt-3 flex items-center gap-2">
                <Button type="submit" size="sm" className="bg-[#003399] text-white hover:bg-[#002266]">
                    Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={onDone}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function IndicatorRow({
    area,
    indicator,
    level,
    onReorder,
}: {
    area: Area;
    indicator: IndicatorNode;
    level: number;
    onReorder: (draggedId: number, targetId: number, parentId: number | null) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const [showInlineCreate, setShowInlineCreate] = useState(false);
    const [showInlineEdit, setShowInlineEdit] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const hasChildren = indicator.children.length > 0;

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOver(false);
        const draggedId = Number(event.dataTransfer.getData('text/plain'));
        if (!draggedId || draggedId === indicator.id) return;
        onReorder(draggedId, indicator.id, indicator.parent_id);
    };

    return (
        <div style={{ marginLeft: `${level * 24}px` }} className="space-y-2">
            <div
                draggable
                onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(indicator.id));
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded border bg-slate-50 px-3 py-2 shadow-sm transition-shadow hover:shadow-md ${
                    dragOver ? 'border-[#003399] ring-1 ring-[#003399]' : 'border-slate-200'
                }`}
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-slate-400">
                        <GripVertical className="h-4 w-4 cursor-grab" />
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => setExpanded((next) => !next)}
                                className="rounded p-0.5 hover:bg-slate-200"
                                aria-label={expanded ? 'Collapse indicator' : 'Expand indicator'}
                            >
                                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                        ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center" />
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-normal leading-snug text-slate-900">{indicator.title}</div>
                        </div>
                    </div>

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-10 px-4"
                            onClick={() => setShowInlineCreate((next) => !next)}
                        >
                            <Plus className="h-4 w-4" />
                            Add
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-10 px-4"
                            onClick={() => {
                                setShowInlineEdit((next) => !next);
                                setShowInlineCreate(false);
                            }}
                        >
                            <PencilLine className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-10 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={async () => {
                                const result = await Swal.fire({
                                    icon: 'warning',
                                    title: 'Delete indicator?',
                                    text: 'This will delete the indicator and all of its children.',
                                    showCancelButton: true,
                                    confirmButtonText: 'Delete',
                                    cancelButtonText: 'Cancel',
                                    confirmButtonColor: '#dc2626',
                                });

                                if (!result.isConfirmed) return;

                                router.delete(`/areas/${area.id}/indicators/${indicator.id}`, {
                                    preserveScroll: true,
                                    onSuccess: async () => {
                                        await Swal.fire({
                                            icon: 'success',
                                            title: 'Indicator deleted',
                                            timer: 1500,
                                            showConfirmButton: false,
                                        });
                                    },
                                });
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {showInlineCreate ? <InlineCreate area={area} parentId={indicator.id} onDone={() => setShowInlineCreate(false)} /> : null}
            {showInlineEdit ? <InlineEdit area={area} indicator={indicator} onDone={() => setShowInlineEdit(false)} /> : null}

            {expanded && hasChildren ? (
                <div className="mt-2 space-y-2">
                    {indicator.children.map((child) => (
                        <IndicatorRow key={child.id} area={area} indicator={child} level={level + 1} onReorder={onReorder} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export default function Index({
    area,
    indicators = [],
    moduleMode = false,
    accreditations = [],
    areas = [],
    selectedAccreditationId = null,
    selectedAreaId = null,
}: Props) {
    const [showRootCreate, setShowRootCreate] = useState(false);
    const [tree, setTree] = useState<IndicatorNode[]>(() => buildTree(indicators));

    useEffect(() => {
        setTree(buildTree(indicators));
    }, [indicators]);

    const handleReorder = (draggedId: number, targetId: number, parentId: number | null) => {
        setTree((current) => {
            const dragged = findNode(current, draggedId);
            const target = findNode(current, targetId);
            if (!dragged || !target) return current;

            if (dragged.parent_id !== target.parent_id) return current;

            const next = reorderSiblingList(current, draggedId, targetId, parentId);
            const orderedIds = getSiblingOrder(next, parentId);

            router.post(`/areas/${area.id}/indicators/reorder`, {
                parent_id: parentId,
                ordered_ids: orderedIds,
            });

            return next;
        });
    };

    const goToModule = (nextAccreditationId: string, nextAreaId: string) => {
        const params = new URLSearchParams();
        if (nextAccreditationId) params.set('accreditation_id', nextAccreditationId);
        if (nextAreaId) params.set('area_id', nextAreaId);

        router.visit(`/indicators${params.toString() ? `?${params.toString()}` : ''}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <>
            <Head title={`Indicators${area ? ` - ${area.name}` : ''}`} />
            <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                        <Heading title="Indicators" description={`Manage indicators for ${area?.name ?? 'your selected area'}`} />
                    </div>

                    <Button
                        className="bg-[#003399] text-white hover:bg-[#002266]"
                        onClick={() => setShowRootCreate((next) => !next)}
                        disabled={!area}
                    >
                        <Plus className="h-4 w-4" />
                        Add indicator
                    </Button>
                </div>

                {moduleMode ? (
                    <div className="w-full rounded-2xl border border-[#003399] bg-[#003399] p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label className="text-white">Accreditation</Label>
                                <ComboBox
                                    value={selectedAccreditationId ? String(selectedAccreditationId) : ''}
                                    onChange={(value) => {
                                        const nextAccreditation = accreditations.find((item) => String(item.id) === value);
                                        const nextAreas = nextAccreditation
                                            ? areas.filter((item) => item.accreditation_id === nextAccreditation.id)
                                            : [];
                                        goToModule(value, nextAreas[0] ? String(nextAreas[0].id) : '');
                                    }}
                                    placeholder="Select accreditation"
                                    className="w-full"
                                    options={accreditations.map((accreditation) => ({
                                        value: String(accreditation.id),
                                        label: `${accreditation.name}${accreditation.status === 'default' ? ' (Default)' : ''}`,
                                    }))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-white">Area</Label>
                                <ComboBox
                                    value={selectedAreaId ? String(selectedAreaId) : ''}
                                    onChange={(value) => goToModule(selectedAccreditationId ? String(selectedAccreditationId) : '', value)}
                                    placeholder="Select area"
                                    className="w-full"
                                    disabled={!areas.length}
                                    options={areas.map((item) => ({
                                        value: String(item.id),
                                        label: item.name,
                                    }))}
                                />
                            </div>

                            <div aria-hidden="true" />
                        </div>
                    </div>
                ) : null}

                <div className="rounded-2xl border border-[#003399]/10 bg-white p-6 shadow-sm">
                    {showRootCreate && area ? <InlineCreate area={area} parentId={null} onDone={() => setShowRootCreate(false)} /> : null}

                    {area && tree.length ? (
                        <div className="space-y-3">
                            {tree.map((indicator) => (
                                <IndicatorRow key={indicator.id} area={area} indicator={indicator} level={0} onReorder={handleReorder} />
                            ))}
                        </div>
                    ) : area ? (
                        <div className="py-12 text-center text-sm text-slate-500">No indicators yet.</div>
                    ) : (
                        <div className="py-12 text-center text-sm text-slate-500">Select an accreditation and area to view indicators.</div>
                    )}
                </div>
            </div>
        </>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Indicators',
        href: '/indicators',
    },
];

Index.layout = {
    breadcrumbs,
};
