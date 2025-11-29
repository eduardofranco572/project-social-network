"use client";

import { useState, useEffect, useCallback } from 'react';
import { LoggedInUser } from '../components/types';
import { useSocket } from '@/src/hooks/useSocket'; 

export interface Comment {
    _id: string;
    text: string;
    parentId?: string | null; 
    postId?: string;
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
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const { socket } = useSocket(loggedInUser?.id);

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

    useEffect(() => {
        if (!socket) return;

        const handleNewComment = (newComm: Comment) => {
            if (newComm.postId === postId) {
                setComments(prev => {
                    if (prev.some(c => c._id === newComm._id)) return prev;
                    return [newComm, ...prev];
                });
            }
        };

        const handleDeleteComment = ({ commentId, postId: deletedPostId }: { commentId: string, postId: string }) => {
            if (deletedPostId === postId) {
                setComments(prev => prev.filter(c => c._id !== commentId && c.parentId !== commentId));
            }
        };

        socket.on('new_comment', handleNewComment);
        socket.on('delete_comment', handleDeleteComment);

        return () => {
            socket.off('new_comment', handleNewComment);
            socket.off('delete_comment', handleDeleteComment);
        };
    }, [socket, postId]);

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
                body: JSON.stringify({ 
                    postId, 
                    text: newComment,
                    parentId: replyingTo ? replyingTo._id : null
                })
            });

            if (res.ok) {
                setNewComment('');
                setReplyingTo(null); 
            }
        } catch (error) {
            console.error("Erro ao comentar:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await fetch('/api/comments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId })
            });

            setComments(prev => prev.filter(c => c._id !== commentId && c.parentId !== commentId));
        } catch (error) {
            console.error("Erro ao excluir comentário:", error);
        }
    };

    return {
        comments,
        newComment,
        setNewComment,
        replyingTo,     
        setReplyingTo,  
        hasMore,
        isLoadingComments,
        isPosting,
        handleLoadMore,
        handlePostComment,
        handleDeleteComment
    };
};