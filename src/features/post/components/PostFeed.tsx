"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from './PostCard';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { PostSkeleton } from './PostSkeleton';
import { PostWithAuthor } from './types';
import { PostDetailModal } from './PostDetailModal';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

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

    if (isLoading && posts.length === 0) {
        return (
            <div className="w-full py-6 space-y-6">
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </div>
        );
    }

    if (!isLoading && posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative w-64 h-64 mb-6 opacity-80 hover:scale-105 transition-transform duration-500">
                    <img 
                        src="/img/empty.svg" 
                        alt="Nenhuma publicação encontrada"
                        className="w-full h-full object-contain"
                    />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                    Está meio quieto por aqui...
                </h3>
                
                <p className="text-zinc-400 mb-8 max-w-xs text-sm leading-relaxed">
                    Você ainda não segue ninguém ou não há publicações novas. Que tal explorar e encontrar novas conexões?
                </p>

                <Button asChild size="lg" className="bg-white text-black hover:bg-zinc-200 font-semibold">
                    <Link href="/explorar">
                        <Compass className="mr-2 h-5 w-5" />
                        Explorar Comunidade
                    </Link>
                </Button>
            </div>
        );
    }

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
                <div className='mt-4'>
                    <PostSkeleton />
                </div>
            )}

            {!isLoading && !hasMore && posts.length > 0 && (
                <p className="text-center text-muted-foreground my-8 text-sm">
                    Isso é tudo por enquanto! 
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