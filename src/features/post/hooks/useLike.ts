"use client";

import { useState, useEffect } from 'react';

export const useLike = (postId: string, initialLikes: any[], currentUserId?: number) => {
    const checkIsLiked = () => {
        if (!currentUserId) return false;
        return initialLikes.some(id => Number(id) === Number(currentUserId));
    };

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikes ? initialLikes.length : 0);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        setIsLiked(checkIsLiked());
        setLikesCount(initialLikes ? initialLikes.length : 0);
    }, [initialLikes, currentUserId]);

    const formatLikes = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + ' mi';
        if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + ' mil';

        return count.toString();
    };

    const toggleLike = async () => {
        if (!currentUserId || isLiking) return;

        const previousLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!previousLiked);
        setLikesCount(prev => !previousLiked ? prev + 1 : prev - 1);
        setIsLiking(true);

        try {
            const res = await fetch(`/api/post/${postId}/like`, { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                setLikesCount(data.likesCount);

                if (typeof data.liked === 'boolean') {
                    setIsLiked(data.liked);
                }
            } else {
                setIsLiked(previousLiked);
                setLikesCount(previousCount);
            }
        } catch (error) {
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    };

    return {
        isLiked,
        likesCount,
        formattedLikes: formatLikes(likesCount),
        toggleLike
    };
};