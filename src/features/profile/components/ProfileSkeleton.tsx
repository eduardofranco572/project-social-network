import React from 'react';

export const ProfileSkeleton: React.FC = () => {
    return (
        <div className="w-full min-h-full bg-background animate-pulse">
            <div className="relative mb-8">
                <div className="h-48 w-full bg-neutral-800" />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-20 md:-mt-28"> 
                        <div className="relative flex-shrink-0 md:translate-y-4">
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-background bg-neutral-800" />
                        </div>

                        <div className="flex-1 mb-2 flex flex-col gap-4 w-full md:pb-4">
                            <div className="h-8 w-48 bg-neutral-800 rounded" />

                            <div className="flex gap-3">
                                <div className="h-9 w-32 bg-neutral-800 rounded" />
                                <div className="h-9 w-32 bg-neutral-800 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-13 mb-8">
                <div className="flex gap-8 py-4 border-b border-zinc-800">
                    <div className="h-5 w-24 bg-neutral-800 rounded" />
                    <div className="h-5 w-24 bg-neutral-800 rounded" />
                    <div className="h-5 w-24 bg-neutral-800 rounded" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 pb-10">
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-neutral-800 rounded-sm md:rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    );
};