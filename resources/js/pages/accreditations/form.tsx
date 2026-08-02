import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { type FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

type Accreditation = {
    id: number;
    name: string;
    year: number;
    status: 'disabled' | 'active' | 'default';
};

type Props = {
    accreditation: Accreditation | null;
    statuses: Array<Accreditation['status']>;
};

const statusLabels: Record<Accreditation['status'], string> = {
    disabled: 'Disabled',
    active: 'Active',
    default: 'Default',
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accreditations',
        href: '/accreditations',
    },
];

export default function FormPage({ accreditation, statuses }: Props) {
    const isEditing = Boolean(accreditation);
    const form = useForm({
        name: accreditation?.name ?? '',
        year: String(accreditation?.year ?? new Date().getFullYear()),
        status: accreditation?.status ?? 'default',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const editUrl = accreditation ? `/accreditations/${accreditation.id}` : '/accreditations';

        form.submit(isEditing ? 'put' : 'post', editUrl, {
            preserveScroll: true,
            onSuccess: async () => {
                await Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Accreditation updated' : 'Accreditation created',
                    text: isEditing
                        ? 'The accreditation has been updated.'
                        : 'The accreditation has been created.',
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
            <Head title={isEditing ? 'Edit Accreditation' : 'Create Accreditation'} />

            <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
                <Heading
                    title={isEditing ? 'Edit Accreditation' : 'Create Accreditation'}
                    description="Manage accreditation name, year, and status"
                />

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-2xl border border-[#003399]/10 bg-white p-6 shadow-sm"
                >
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Accreditation name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="e.g. Program Level IV"
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                name="year"
                                type="number"
                                value={form.data.year}
                                onChange={(e) => form.setData('year', e.target.value)}
                                required
                                min={1900}
                                max={new Date().getFullYear() + 1}
                            />
                            <InputError message={form.errors.year} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                name="status"
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value as Accreditation['status'])}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] focus-visible:ring-offset-2"
                                required
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {statusLabels[status]}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.status} />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-[#003399] text-white hover:bg-[#002266]"
                            >
                                {isEditing ? 'Update accreditation' : 'Create accreditation'}
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/accreditations">Cancel</Link>
                            </Button>
                        </div>
                    </>
                </form>
            </div>
        </>
    );
}

FormPage.layout = {
    breadcrumbs,
};
