import React from 'react';
import { Grid3X3, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostWithAuthor } from '@/src/features/post/components/types';

interface ProfileFeedProps {
    posts: PostWithAuthor[];
    hasMore: boolean;
    loadingPosts: boolean;
    onLoadMore: () => void;
    onPostClick: (post: PostWithAuthor) => void;
}

export const ProfileFeed: React.FC<ProfileFeedProps> = ({ posts, hasMore, loadingPosts, onLoadMore, onPostClick }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 pb-10">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
                <Grid3X3 size={16} /> Publicações
            </div>

            {posts.length === 0 ? (
                <div className="py-20 text-center text-zinc-500">
                    <Camera size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhuma publicação ainda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {posts.map((post) => (
                        <div 
                            key={post._id} 
                            className="aspect-[3/4] relative group cursor-pointer bg-zinc-900 overflow-hidden rounded-sm md:rounded-md"
                            onClick={() => onPostClick(post)}
                        >
                            {post.media[0].type.startsWith('video/') ? (
                                <video src={post.media[0].url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={post.media[0].url} alt="Post" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            )}
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="flex justify-center mt-10">
                    <Button variant="ghost" onClick={onLoadMore} disabled={loadingPosts} className="min-w-[150px]">
                        {loadingPosts ? <Loader2 className="animate-spin" /> : 'Carregar Mais'}
                    </Button>
                </div>
            )}
        </div>
    );
};