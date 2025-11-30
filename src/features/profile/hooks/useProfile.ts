import { useState, useEffect, useCallback, useRef } from 'react';
import { PostWithAuthor } from '@/src/features/post/components/types';
import { StatusUserData } from '@/src/features/status/components/types';
import { useSocket } from '@/src/hooks/useSocket';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';

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
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver | null>(null);

    const { user: loggedInUser } = useCurrentUser();
    const { socket } = useSocket(loggedInUser?.id);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/users/${profileId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Erro ao buscar perfil", error);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [profileId]);

    useEffect(() => {
        if (!socket) return;
        const handleUserUpdate = (updatedData: any) => {
            if (String(updatedData.id) === String(profileId)) {
                setProfile((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        nome: updatedData.nome || prev.nome,
                        foto: updatedData.foto || prev.foto,
                        banner: updatedData.banner || prev.banner
                    };
                });
            }
        };
        socket.on('user_updated', handleUserUpdate);
        return () => {
            socket.off('user_updated', handleUserUpdate);
        };
    }, [socket, profileId]);

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
        fetchPosts(page);
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