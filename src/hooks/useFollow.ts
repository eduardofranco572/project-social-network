import { useState, useEffect } from 'react';

export const useFollow = (targetUserId: number) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!targetUserId) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/users/${targetUserId}/follow`);

                if (res.ok) {
                    const data = await res.json();
                    setIsFollowing(data.isFollowing);
                    setFollowersCount(data.followersCount);
                    setFollowingCount(data.followingCount);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [targetUserId]);

    const toggleFollow = async () => {
        const previousState = isFollowing;
        setIsFollowing(!previousState);
        setFollowersCount(prev => !previousState ? prev + 1 : prev - 1);

        try {
            const res = await fetch(`/api/users/${targetUserId}/follow`, {
                method: 'POST'
            });
            
            if (!res.ok) {
                setIsFollowing(previousState);
                setFollowersCount(prev => previousState ? prev + 1 : prev - 1);
            }
        } catch (error) {
            setIsFollowing(previousState);
        }
    };

    return {
        isFollowing,
        followersCount,
        followingCount,
        isLoading,
        toggleFollow
    };
};