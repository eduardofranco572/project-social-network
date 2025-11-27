"use client";

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ProfileFeed } from './ProfileFeed';
import { PostDetailModal } from '@/src/features/post/components/PostDetailModal';
import { PostWithAuthor } from '@/src/features/post/components/types';

interface ProfilePageContentProps {
    profileId: number;
}

export const ProfilePageContent: React.FC<ProfilePageContentProps> = ({ profileId }) => {
    const { user: loggedInUser } = useCurrentUser();
    const { profile, posts, loadingProfile, loadingPosts, hasMore, loadMorePosts } = useProfile(profileId);
    const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);

    if (loadingProfile) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!profile) {
        return <div className="text-center pt-20 text-white">Usuário não encontrado.</div>;
    }

    const isOwnProfile = loggedInUser?.id === profile.id;

    return (
        <div className="w-full min-h-full bg-background">
            <ProfileHeader 
                profile={profile} 
                isOwnProfile={isOwnProfile} 
            />
            
            <ProfileStats 
                stats={profile.stats} 
                userId={profile.id} 
            />

            <ProfileFeed 
                posts={posts} 
                hasMore={hasMore} 
                loadingPosts={loadingPosts} 
                onLoadMore={loadMorePosts}
                onPostClick={setSelectedPost}
            />

            {selectedPost && (
                <PostDetailModal 
                    post={selectedPost}
                    loggedInUser={loggedInUser}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </div>
    );
};