"use client";

import React, { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from './PostCard';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { PostSkeleton } from './PostSkeleton';
import { PostWithAuthor } from './types';

export const PostFeed: React.FC = () => {
    const { user: loggedInUser } = useCurrentUser();

    const { posts: fetchedPosts, isLoading, hasMore, lastPostElementRef } = usePosts();

    const [posts, setPosts] = useState<PostWithAuthor[]>([]);

    React.useEffect(() => {
        setPosts(fetchedPosts);
    }, [fetchedPosts]);

    const handleDeleteSuccess = (postId: string) => {
        setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
    };

    return (
        <div className="w-full py-6">
            {posts.map((post, index) => {
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastPostElementRef} key={post._id}>
                            <PostCard 
                                post={post} 
                                loggedInUser={loggedInUser} 
                                onDeleteSuccess={() => handleDeleteSuccess(post._id)} 
                            />
                        </div>
                    );
                }
                return (
                    <PostCard 
                        key={post._id} 
                        post={post} 
                        loggedInUser={loggedInUser} 
                        onDeleteSuccess={() => handleDeleteSuccess(post._id)} 
                    />
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
        </div>
    );
};