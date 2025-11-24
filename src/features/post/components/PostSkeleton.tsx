import React from 'react';

export const PostSkeleton: React.FC = () => {
    return (
        <div className="w-full bg-background border border-border rounded-lg mb-6 animate-pulse">
            <div className="flex items-center p-3">
                <div className="w-8 h-8 rounded-full bg-secondary" />
                <div className="ml-3 h-4 w-24 rounded bg-secondary" />
                <div className="ml-auto h-8 w-8 rounded-full bg-secondary" />
            </div>

            <div className="w-full bg-secondary aspect-[4/5]" />

            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                    <div className="h-6 w-6 rounded bg-secondary" />
                    <div className="h-6 w-6 rounded bg-secondary" />
                    <div className="h-6 w-6 rounded bg-secondary" />
                </div>
                <div className="flex items-center">
                    <div className="h-6 w-6 rounded bg-secondary" />
                </div>
            </div>

            <div className="px-3 pb-3 space-y-2">
                <div className="h-4 w-1/3 rounded bg-secondary" />
                <div className="h-3 w-3/4 rounded bg-secondary" />
            </div>
        </div>
    );
};