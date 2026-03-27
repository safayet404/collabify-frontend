'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className }) {
    return (
        <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)} />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-9 w-9 rounded-lg" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <BoardCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function BoardCardSkeleton() {
    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <Skeleton className="h-24 rounded-none" />
            <div className="p-3 bg-white dark:bg-gray-900 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    );
}

export function BoardSkeleton() {
    return (
        <div className="flex gap-3 p-4 overflow-x-auto h-full">
            {[...Array(4)].map((_, colIndex) => (
                <div key={colIndex} className="shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-5 w-8 rounded-full" />
                    </div>
                    {[...Array(colIndex === 0 ? 3 : colIndex === 1 ? 4 : colIndex === 2 ? 2 : 1)].map((_, cardIndex) => (
                        <CardSkeleton key={cardIndex} />
                    ))}
                    <Skeleton className="h-9 w-full" />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 space-y-2.5 border border-gray-200 dark:border-gray-600">
            <div className="flex gap-1">
                <Skeleton className="h-2 w-8 rounded-full" />
                <Skeleton className="h-2 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <div className="flex -space-x-1.5">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function WorkspaceSkeleton() {
    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex gap-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-0">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-none rounded-t-lg" />
                ))}
            </div>
            {/* Boards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(4)].map((_, i) => <BoardCardSkeleton key={i} />)}
            </div>
        </div>
    );
}

export function NotificationsSkeleton() {
    return (
        <div className="p-6 max-w-3xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-20 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardDetailSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start gap-3">
                <Skeleton className="w-5 h-5 rounded mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>
            <div className="flex gap-6">
                <div className="flex-1 space-y-5">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-2.5">
                                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-44 space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SidebarBoardsSkeleton() {
    return (
        <div className="space-y-1 ml-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="w-3 h-3 rounded-sm shrink-0" />
                    <Skeleton className="h-3 flex-1" />
                </div>
            ))}
        </div>
    );
}

export function PageLoader({ text = 'Loading...' }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 rounded-full" />
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
        </div>
    );
}

export function Spinner({ size = 'md', className }) {
    const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-4' };
    return (
        <div className={cn(
            'border-indigo-600 border-t-transparent rounded-full animate-spin',
            sizes[size], className
        )} />
    );
}