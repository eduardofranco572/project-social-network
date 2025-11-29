import { useState, useEffect, useCallback } from 'react';
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
        setLoadingPosts(true);

        try {
            const res = await fetch(`/api/post?userId=${profileId}&page=${pageNum}&limit=9`);
            const data = await res.json();
            
            if (pageNum === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }

            setHasMore(data.hasMore);
        } catch (error) {
            console.error("Erro ao buscar posts", error);
            
        } finally {
            setLoadingPosts(false);
        }
    }, [profileId]);

    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    const loadMorePosts = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
    };

    return {
        profile,
        posts,
        loadingProfile,
        loadingPosts,
        hasMore,
        loadMorePosts
    };
};