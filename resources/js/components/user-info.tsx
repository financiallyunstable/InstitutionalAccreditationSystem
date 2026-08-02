import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    className,
    containerClassName,
    textClassName = 'text-white',
}: {
    user: User;
    showEmail?: boolean;
    className?: string;
    containerClassName?: string;
    textClassName?: string;
}) {
    const getInitials = useInitials();

    return (
        <div className={`flex items-center gap-2 ${containerClassName || ''}`}>
            <Avatar className={`h-8 w-8 overflow-hidden rounded-full ${className || ''}`}>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className={`flex flex-1 flex-col justify-center text-left text-sm leading-tight ${textClassName}`}>
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-white/70">
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
}
