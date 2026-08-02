import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#f4f8ff] p-6 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,51,153,0.16),_transparent_42%),linear-gradient(180deg,_#f8fbff_0%,_#eaf1ff_100%)]" />
            <div className="relative w-full max-w-md">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-[#003399]">
                        {title}
                    </h1>
                    <p className="text-center text-sm leading-6 text-slate-600">
                        {description}
                    </p>
                </div>

                <div className="mt-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
