'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

export type ComboBoxOption = {
    label: string;
    value: string;
};

type ComboBoxProps = {
    id?: string;
    options: ComboBoxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
};

export function ComboBox({
    id,
    options,
    value = '',
    onChange,
    placeholder = 'Select...',
    className,
    disabled = false,
}: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const rootRef = React.useRef<HTMLDivElement>(null);
    const selectedLabel = options.find((opt) => opt.value === value)?.label;
    const filtered = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));

    React.useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, []);

    return (
        <div ref={rootRef} className="relative" id={id}>
            <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                onClick={() => setOpen((next) => !next)}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                    'text-left font-normal shadow-none hover:bg-background',
                    'focus-visible:border-[#0b66e4] focus-visible:ring-1 focus-visible:ring-[#0b66e4] focus-visible:ring-offset-0',
                    'data-[state=open]:border-[#0b66e4] data-[state=open]:ring-1 data-[state=open]:ring-[#0b66e4]',
                    className,
                    disabled && 'pointer-events-none opacity-50',
                )}
                disabled={disabled}
            >
                <span
                    className={cn(
                        'flex-1 block w-0 overflow-hidden text-left truncate text-ellipsis whitespace-nowrap',
                        !value && 'text-muted-foreground',
                    )}
                >
                    {value ? selectedLabel : placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open ? (
                <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-md">
                    <div className="border-b px-3 py-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filtered.length ? (
                            filtered.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    {option.label}
                                    {value === option.value ? <Check className="ml-auto h-4 w-4 opacity-100" /> : null}
                                </button>
                            ))
                        ) : (
                            <div className="py-6 text-center text-sm text-slate-500">No results found.</div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
