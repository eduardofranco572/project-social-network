import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { PostWithAuthor } from '../components/types';

export const usePostFeedSocket = (
    socket: Socket | undefined,
    setPosts: React.Dispatch<React.SetStateAction<PostWithAuthor[]>>,
    selectedPost: PostWithAuthor | null,
    setSelectedPost: React.Dispatch<React.SetStateAction<PostWithAuthor | null>>
) => {
    useEffect(() => {
        if (!socket) return;
        
        const handleNewPost = (newPost: PostWithAuthor) => {
            console.log("Novo post via socket:", newPost);
            setPosts((prevPosts) => {
                if (prevPosts.some(p => p._id === newPost._id)) return prevPosts;
                return [newPost, ...prevPosts];
            });
        };

        const handleDeleteEvent = ({ postId }: { postId: string }) => {
            setPosts((prevPosts) => prevPosts.filter(p => p._id !== postId));
            if (selectedPost?._id === postId) {
                setSelectedPost(null);
            }
        };

        const handleLikeUpdate = ({ postId, likes }: { postId: string, likes: number[] }) => {
            setPosts((currentPosts) => currentPosts.map(post => {
                if (post._id === postId) {
                    return { ...post, likes };
                }
                return post;
            }));

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
    }, [socket, setPosts, selectedPost, setSelectedPost]);
};