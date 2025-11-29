import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { PostWithAuthor } from '../components/types';

export const usePostFeedSocket = (
    socket: Socket | undefined,
    setPosts: React.Dispatch<React.SetStateAction<PostWithAuthor[]>>,
    setPendingPosts: React.Dispatch<React.SetStateAction<PostWithAuthor[]>>, 
    followingIds: number[], 
    loggedInUserId: number | undefined,
    selectedPost: PostWithAuthor | null,
    setSelectedPost: React.Dispatch<React.SetStateAction<PostWithAuthor | null>>
) => {
    useEffect(() => {
        if (!socket) return;
        
        const handleNewPost = (newPost: PostWithAuthor) => {
            // Meu post mostra em tempo real.
            if (loggedInUserId && newPost.author.id === loggedInUserId) {
                setPosts((prevPosts) => {
                    if (prevPosts.some(p => p._id === newPost._id)) return prevPosts;
                    return [newPost, ...prevPosts];
                });
                return;
            }

            // Verificar post é de seguidores
            if (followingIds.includes(newPost.author.id)) {
                setPendingPosts((prev) => {
                    if (prev.some(p => p._id === newPost._id)) return prev;
                    return [newPost, ...prev];
                });

                return;
            }
        };

        const handleDeleteEvent = ({ postId }: { postId: string }) => {
            setPosts((prevPosts) => prevPosts.filter(p => p._id !== postId));
            setPendingPosts((prev) => prev.filter(p => p._id !== postId));
            
            if (selectedPost?._id === postId) {
                setSelectedPost(null);
            }
        };

        const handleLikeUpdate = ({ postId, likes }: { postId: string, likes: number[] }) => {
            const updateList = (list: PostWithAuthor[]) => list.map(post => {
                if (post._id === postId) return { ...post, likes };
                return post;
            });

            setPosts(prev => updateList(prev));
            setPendingPosts(prev => updateList(prev));

            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(prev => prev ? { ...prev, likes } : null);
            }
        };

        socket.on('new_post', handleNewPost);
        socket.on('delete_post', handleDeleteEvent);
        socket.on('update_like', handleLikeUpdate); 

        return () => {
            socket.off('new_post', handleNewPost);
            socket.off('delete_post', handleDeleteEvent);
            socket.off('update_like', handleLikeUpdate);
        };
    }, [socket, setPosts, setPendingPosts, followingIds, loggedInUserId, selectedPost, setSelectedPost]);
};