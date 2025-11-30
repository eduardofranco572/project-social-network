"use client";

import { useState, useEffect } from 'react';

export const useSave = (postId: string, initialSavedBy: number[] = [], currentUserId?: number) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUserId) {
            const isSavedInitial = initialSavedBy.some(id => Number(id) === Number(currentUserId));
            setIsSaved(isSavedInitial);
        }

    }, [postId, currentUserId]); 

    const toggleSave = async () => {
        if (!currentUserId || isLoading) return;

        const previousState = isSaved;
        
        setIsSaved(!previousState);
        setIsLoading(true);

        try {
            const res = await fetch(`/api/post/${postId}/save`, { method: 'POST' });
            
            if (!res.ok) {
                setIsSaved(previousState);
            }
        } catch (error) {
            console.error(error);
            setIsSaved(previousState);
        } finally {
            setIsLoading(false);
        }
    };

    return { isSaved, toggleSave };
};