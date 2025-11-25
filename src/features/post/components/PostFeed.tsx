"use client";

import React, { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from './PostCard';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { PostSkeleton } from './PostSkeleton';
import { PostWithAuthor } from './types';
import { PostDetailModal } from './PostDetailModal';

export const PostFeed: React.FC = () => {
   const { user: loggedInUser } = useCurrentUser();
    const { posts: fetchedPosts, isLoading, hasMore, lastPostElementRef } = usePosts();
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    
    const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);

    React.useEffect(() => {
        setPosts(fetchedPosts);
    }, [fetchedPosts]);

    const handleDeleteSuccess = (postId: string) => {
        setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
        if (selectedPost?._id === postId) setSelectedPost(null); 
    };

    return (
        <div className="w-full py-6">
            {posts.map((post, index) => {
                const isLast = posts.length === index + 1;
                return (
                    <div ref={isLast ? lastPostElementRef : null} key={post._id}>
                       <PostCard 
                            post={post} 
                            loggedInUser={loggedInUser} 
                            onDeleteSuccess={() => handleDeleteSuccess(post._id)}
                            onCommentClick={(p) => setSelectedPost(p)}
                            isModalOpen={!!selectedPost} 
                        />
                    </div>
                );
            })}

            {isLoading && (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            )}

            {!isLoading && !hasMore && posts.length > 0 && (
                <p className="text-center text-muted-foreground my-8">
                    Você chegou ao fim.
                </p>
            )}

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