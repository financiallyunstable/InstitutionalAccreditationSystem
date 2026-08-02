import { Form, Head, Link } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accreditations',
        href: '/accreditations',
    },
];

export default function FormPage({ accreditation, statuses }: Props) {
    const isEditing = Boolean(accreditation);

    return (
        <>
            <Head title={isEditing ? 'Edit Accreditation' : 'Create Accreditation'} />

            <div className="space-y-6">
                <Heading
                    title={isEditing ? 'Edit Accreditation' : 'Create Accreditation'}
                    description="Manage accreditation name, year, and status"
                />

                <Form
                    action={isEditing ? `/accreditations/${accreditation.id}` : '/accreditations'}
                    method={isEditing ? 'put' : 'post'}
                    options={{ preserveScroll: true }}
                    className="space-y-6 rounded-2xl border border-[#003399]/10 bg-white p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Accreditation name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={accreditation?.name ?? ''}
                                    placeholder="e.g. Program Level IV"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    name="year"
                                    type="number"
                                    defaultValue={accreditation?.year ?? new Date().getFullYear()}
                                    required
                                    min={1900}
                                    max={new Date().getFullYear() + 1}
                                />
                                <InputError message={errors.year} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={accreditation?.status ?? 'default'}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] focus-visible:ring-offset-2"
                                    required
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#003399] text-white hover:bg-[#002266]"
                                >
                                    {isEditing ? 'Update accreditation' : 'Create accreditation'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/accreditations">Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

FormPage.layout = {
    breadcrumbs,
};
