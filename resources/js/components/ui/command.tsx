import * as React from 'react';

import { cn } from '@/lib/utils';

type CommandContextValue = {
    search: string;
    setSearch: (value: string) => void;
};

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommandContext() {
    const context = React.useContext(CommandContext);
    if (!context) {
        throw new Error('Command components must be used within <Command>.');
    }

    return context;
}

function Command({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const [search, setSearch] = React.useState('');

    return (
        <CommandContext.Provider value={{ search, setSearch }}>
            <div data-slot="command" className={cn('bg-popover text-popover-foreground flex w-full flex-col overflow-hidden rounded-md', className)} {...props}>
                {children}
            </div>
        </CommandContext.Provider>
    );
}

function CommandInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    const { search, setSearch } = useCommandContext();

    return (
        <div data-slot="command-input-wrapper" className="flex items-center border-b px-3">
            <input
                data-slot="command-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                    'placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                {...props}
            />
        </div>
    );
}

function CommandList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="command-list" className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)} {...props} />;
}

function CommandEmpty({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div data-slot="command-empty" className={cn('py-6 text-center text-sm', className)} {...props}>
            {children}
        </div>
    );
}

function CommandGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="command-group" className={cn('overflow-hidden p-1 text-foreground', className)} {...props} />;
}

function CommandItem({
    className,
    children,
    value,
    onSelect,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string;
    onSelect?: () => void;
}) {
    const { search } = useCommandContext();
    const matches = !value || value.toLowerCase().includes(search.toLowerCase());

    if (!matches) {
        return null;
    }

    return (
        <button
            type="button"
            data-slot="command-item"
            className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            onClick={onSelect}
            {...props}
        >
            {children}
        </button>
    );
}

export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList };
