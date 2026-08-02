import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { type FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { ComboBox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Area = {
    id: number;
    name: string;
};

type Indicator = {
    id: number;
    parent_id: number | null;
    title: string;
};

type Props = {
    area: Area;
    indicator: Indicator | null;
    indicators: Array<{
        id: number;
        title: string;
        parent_id: number | null;
    }>;
    defaultParentId?: number | null;
};

export default function FormPage({ area, indicator, indicators, defaultParentId }: Props) {
    const isEditing = Boolean(indicator);
    const form = useForm({
        parent_id: indicator?.parent_id ? String(indicator.parent_id) : defaultParentId ? String(defaultParentId) : '',
        title: indicator?.title ?? '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const url = indicator ? `/areas/${area.id}/indicators/${indicator.id}` : `/areas/${area.id}/indicators`;

        form.submit(isEditing ? 'put' : 'post', url, {
            preserveScroll: true,
            onSuccess: async () => {
                await Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Indicator updated' : 'Indicator created',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        });
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Indicator' : 'Create Indicator'} />
            <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
                <Heading title={isEditing ? 'Edit Indicator' : 'Create Indicator'} description={`Manage indicators for ${area.name}`} />

                <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[#003399]/10 bg-white p-6 shadow-sm">
                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">Parent Indicator</Label>
                        <ComboBox
                            value={form.data.parent_id}
                            onChange={(value) => form.setData('parent_id', value)}
                            className="w-full"
                            placeholder="Root indicator"
                            options={[
                                { value: '', label: 'Root indicator' },
                                ...indicators.map((item) => ({
                                    value: String(item.id),
                                    label: `${item.code ? `${item.code}. ` : ''}${item.title}`,
                                })),
                            ]}
                        />
                        <InputError message={form.errors.parent_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <textarea
                            id="title"
                            name="title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            placeholder="Indicator title"
                            required
                            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] focus-visible:ring-offset-2"
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing} className="bg-[#003399] text-white hover:bg-[#002266]">
                            {isEditing ? 'Update indicator' : 'Create indicator'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={`/areas/${area.id}/indicators`}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
