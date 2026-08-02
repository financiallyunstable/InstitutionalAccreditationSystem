import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/login';

type LoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const form = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    const { data, setData, post, processing, errors, reset } = form;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(store.url(), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <form onSubmit={submit} className="mx-auto w-full max-w-md">
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(0,51,153,0.12)] backdrop-blur">
                    <img
                        src="/images/logo-pnu.png"
                        alt="PNU logo"
                        className="h-32 w-32 object-contain"
                    />

                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-[#003399]">
                            Log in to your account
                        </h1>
                        <p className="text-center text-sm leading-6 text-slate-600">
                            Enter your username and password below to log in
                        </p>
                    </div>

                    <div className="grid w-full gap-6 pt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="admin"
                                className="focus-visible:ring-[#003399]"
                            />
                            <InputError message={errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                className="focus-visible:ring-[#003399]"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full bg-[#003399] text-white hover:bg-[#002266] focus-visible:ring-[#003399]"
                            tabIndex={4}
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Log in
                        </Button>
                    </div>
                </div>
            </form>

            {status && <div className="mt-4 text-center text-sm font-medium text-[#003399]">{status}</div>}
        </>
    );
}
