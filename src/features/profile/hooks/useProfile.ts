import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { PostWithAuthor } from '@/src/features/post/components/types';
import { StatusUserData } from '@/src/features/status/components/types';
import { useSocket } from '@/src/hooks/useSocket';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { fetcher } from '@/src/lib/fetcher'; 

export interface UserProfile {
    id: number;
    nome: string;
    foto: string;
    banner?: string;
    stats: {
        posts: number;
        followers: number;
        following: number;
    }
    status?: StatusUserData | null;
}

export const useProfile = (profileId: number) => {
    const { data: profile, isLoading: loadingProfile, mutate } = useSWR<UserProfile>(
        profileId ? `/api/users/${profileId}` : null,
        fetcher,
        {
            revalidateOnFocus: false, 
            shouldRetryOnError: false
        }
    );

    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver | null>(null);

    const { user: loggedInUser } = useCurrentUser();
    const { socket } = useSocket(loggedInUser?.id);

    useEffect(() => {
        if (!socket) return;

        const handleUserUpdate = (updatedData: any) => {
            if (String(updatedData.id) === String(profileId)) {
                mutate((currentProfile) => {
                    if (!currentProfile) return undefined;
                    return {
                        ...currentProfile,
                        nome: updatedData.nome || currentProfile.nome,
                        foto: updatedData.foto || currentProfile.foto,
                        banner: updatedData.banner || currentProfile.banner
                    };
                }, false);
            }
        };

        socket.on('user_updated', handleUserUpdate);
        
        return () => {
            socket.off('user_updated', handleUserUpdate);
        };
    }, [socket, profileId, mutate]);

    const fetchPosts = useCallback(async (pageNum: number) => {
        if (loadingPosts) return;

        setLoadingPosts(true);

        try {
            const res = await fetch(`/api/post?userId=${profileId}&page=${pageNum}&limit=9`);
            const data = await res.json();
            
            if (pageNum === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => {
                    const newPosts = data.posts.filter((p: PostWithAuthor) => 
                        !prev.some(existing => existing._id === p._id)
                    );
                    return [...prev, ...newPosts];
                });
            }

            setHasMore(data.hasMore);
        } catch (error) {
            console.error("Erro ao buscar posts", error);
        } finally {
            setLoadingPosts(false);
        }
    }, [profileId]);

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        fetchPosts(1);
    }, [profileId]); 

    useEffect(() => {
        if (page > 1) {
            fetchPosts(page);
        }
    }, [page, fetchPosts]);

    // Observer para Scroll Infinito
    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingPosts) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loadingPosts, hasMore]);

    return {
        profile,
        posts,
        loadingProfile,
        loadingPosts,
        hasMore,
        lastPostElementRef 
    };
};