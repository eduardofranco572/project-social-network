"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from './PostCard';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { PostSkeleton } from './PostSkeleton';
import { PostWithAuthor } from './types';
import { PostDetailModal } from './PostDetailModal';
import { Button } from '@/components/ui/button';
import { Compass, ArrowUpCircle } from 'lucide-react'; 
import { useSocket } from '@/src/hooks/useSocket'; 

import { usePostFeedSocket } from '../hooks/usePostFeedSocket';

export const PostFeed: React.FC = () => {
    const { user: loggedInUser } = useCurrentUser();
    const { socket } = useSocket(loggedInUser?.id);
    
    const { posts: fetchedPosts, isLoading, hasMore, lastPostElementRef } = usePosts();
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [pendingPosts, setPendingPosts] = useState<PostWithAuthor[]>([]); 
    const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
    const [followingIds, setFollowingIds] = useState<number[]>([]); 

    useEffect(() => {
        setPosts(fetchedPosts);
    }, [fetchedPosts]);

    useEffect(() => {
        if (!loggedInUser) return;
        fetch('/api/users/me/following')
            .then(res => res.json())
            .then(ids => setFollowingIds(ids))
            .catch(err => console.error("Erro ao buscar followingIds", err));
    }, [loggedInUser]);

    usePostFeedSocket(
        socket, 
        setPosts, 
        setPendingPosts, 
        followingIds, 
        loggedInUser?.id, 
        selectedPost, 
        setSelectedPost
    );

    const handleShowNewPosts = () => {
        setPosts(prev => [...pendingPosts, ...prev]);
        setPendingPosts([]);
        
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
        <div className="w-full py-6 relative">
            {pendingPosts.length > 0 && (
                <div className="sticky top-4 z-30 flex justify-center mb-4 animate-in slide-in-from-top-2 duration-300">
                    <button 
                        onClick={handleShowNewPosts}
                        className="bg-[#1c1c1c] hover:bg-[#262626] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105 border border-zinc-800"
                    >
                        <ArrowUpCircle size={18} />
                        Novas publicações ({pendingPosts.length})
                    </button>
                </div>
            )}

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