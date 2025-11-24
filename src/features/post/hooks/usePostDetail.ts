"use client";

import { useState, useEffect, useCallback } from 'react';
import { LoggedInUser } from '../components/types';

export interface Comment {
    _id: string;
    text: string;
    user: {
        id: number;
        nome: string;
        foto: string;
    };
    createdAt: string;
}

export const usePostDetail = (
    postId: string, 
    loggedInUser: LoggedInUser | null,
    isPage: boolean = false 
) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        if (isPage) return; 

        const originalUrl = window.location.href;
        window.history.pushState({}, '', `/p/${postId}`);

        return () => {
            const cleanUrl = originalUrl.includes('/p/') ? '/' : originalUrl;
            window.history.pushState({}, '', cleanUrl);
        };
    }, [postId, isPage]);

    const fetchComments = useCallback(async (pageNum: number) => {
        setIsLoadingComments(true);
        try {
            const res = await fetch(`/api/comments?postId=${postId}&page=${pageNum}`);
            const data = await res.json();
            
            if (pageNum === 1) {
                setComments(data.comments);
            } else {
                setComments(prev => [...prev, ...data.comments]);
            }
            setHasMore(data.hasMore);
        } catch (error) {
            console.error("Erro ao buscar comentários", error);
        } finally {
            setIsLoadingComments(false);
        }
    }, [postId]);

   useEffect(() => {
        setPage(1);
        fetchComments(1);
    }, [fetchComments]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsPosting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, text: newComment })
            });

            if (res.ok) {
                const savedComment = await res.json();
                const commentWithUser: Comment = {
                    ...savedComment,
                    user: {
                        id: loggedInUser?.id || 0,
                        nome: loggedInUser?.nome || 'Eu',
                        foto: loggedInUser?.foto || '/img/iconePadrao.svg'
                    }
                };
                setComments(prev => [commentWithUser, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error("Erro ao comentar:", error);
        } finally {
            setIsPosting(false);
        }
    };

    return {
        comments,
        newComment,
        setNewComment,
        hasMore,
        isLoadingComments,
        isPosting,
        handleLoadMore,
        handlePostComment
    };
};