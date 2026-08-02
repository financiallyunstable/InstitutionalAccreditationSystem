import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { type FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { ComboBox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

type Area = {
    id: number;
    accreditation_id: number;
    name: string;
    description: string | null;
    video: string | null;
};

type Accreditation = {
    id: number;
    name: string;
    status: 'disabled' | 'active' | 'default';
};

type Props = {
    area: Area | null;
    accreditations: Accreditation[];
    defaultAccreditationId: number | null;
};

export default function FormPage({ area, accreditations, defaultAccreditationId }: Props) {
    const isEditing = Boolean(area);
    const form = useForm({
        accreditation_id: area?.accreditation_id ? String(area.accreditation_id) : defaultAccreditationId ? String(defaultAccreditationId) : '',
        name: area?.name ?? '',
        description: area?.description ?? '',
        video: null as File | null,
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const url = area
            ? `/areas/${area.id}`
            : '/areas';

        form.submit(isEditing ? 'put' : 'post', url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: async () => {
                await Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Area updated' : 'Area created',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
            onError: async () => {
                await Swal.fire({
                    icon: 'error',
                    title: 'Save failed',
                    text: 'Please check the form fields and try again.',
                });
            },
        });
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Area' : 'Create Area'} />
            <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
                <Heading title={isEditing ? 'Edit Area' : 'Create Area'} description="Manage area details" />
                <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[#003399]/10 bg-white p-6 shadow-sm">
                    <div className="grid gap-2">
                        <Label htmlFor="accreditation_id">Accreditation</Label>
                        <ComboBox
                            value={form.data.accreditation_id}
                            onChange={(value) => form.setData('accreditation_id', value)}
                            disabled={isEditing}
                            className="w-full"
                            placeholder="Select accreditation"
                            options={accreditations.map((accreditation) => ({
                                value: String(accreditation.id),
                                label: `${accreditation.name}${accreditation.status === 'default' ? ' (Default)' : ''}`,
                            }))}
                        />
                        <InputError message={form.errors.accreditation_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder="Optional description"
                            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] focus-visible:ring-offset-2"
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="video">Video file</Label>
                        <Input
                            id="video"
                            name="video"
                            type="file"
                            accept="video/*"
                            onChange={(e) => form.setData('video', e.target.files?.[0] ?? null)}
                        />
                        {isEditing && area?.video ? (
                            <p className="text-sm text-muted-foreground">
                                Current file: {area.video}
                            </p>
                        ) : null}
                        <InputError message={form.errors.video} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing} className="bg-[#003399] text-white hover:bg-[#002266]">
                            {isEditing ? 'Update area' : 'Create area'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/areas">Cancel</Link>
                        </Button>
                    </div>
                </form>
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

FormPage.layout = {
    breadcrumbs,
};
