import React from 'react';
import { UserProfile } from '../hooks/useProfile';
import { useFollow } from '@/src/hooks/useFollow';

export const ProfileStats: React.FC<{ stats: UserProfile['stats'], userId: number }> = ({ stats, userId }) => {
    const { followersCount, followingCount, isLoading } = useFollow(userId);

    return (
        <div className="max-w-4xl mx-auto px-6 mt-13 mb-8">
            <div className="flex gap-8 py-4 border-b border-zinc-800 text-sm md:text-base">
                <div className="flex flex-col items-center md:flex-row md:gap-2">
                    <span className="font-bold text-white">{stats.posts}</span>
                    <span className="text-zinc-400">Publicações</span>
                </div>

                <div className="flex flex-col items-center md:flex-row md:gap-2">
                    <span className="font-bold text-white">
                        {isLoading ? '-' : followersCount}
                    </span>

                    <span className="text-zinc-400">Seguidores</span>
                </div>

                <div className="flex flex-col items-center md:flex-row md:gap-2">
                    <span className="font-bold text-white">
                        {isLoading ? '-' : followingCount}
                    </span>
                    
                    <span className="text-zinc-400">Seguindo</span>
                </div>
            </div>
        </div>
    );
};