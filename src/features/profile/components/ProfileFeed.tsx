import React from 'react';
import { Grid3X3, Camera, Loader2 } from 'lucide-react';
import { PostWithAuthor } from '@/src/features/post/components/types';

interface ProfileFeedProps {
    posts: PostWithAuthor[];
    hasMore: boolean;
    loadingPosts: boolean;
    onPostClick: (post: PostWithAuthor) => void;
    lastPostElementRef: (node: HTMLDivElement | null) => void;
}

export const ProfileFeed: React.FC<ProfileFeedProps> = ({ 
    posts, 
    hasMore, 
    loadingPosts, 
    onPostClick,
    lastPostElementRef 
}) => {
    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 pb-10">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
                <Grid3X3 size={16} /> Publicações
            </div>

            {posts.length === 0 && !loadingPosts ? (
                <div className="py-20 text-center text-zinc-500">
                    <Camera size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhuma publicação ainda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {posts.map((post, index) => {
                        const isLast = posts.length === index + 1;
                        return (
                            <div 
                                key={post._id} 
                                ref={isLast ? lastPostElementRef : null}
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
                        );
                    })}
                </div>
            )}

            {loadingPosts && (
                <div className="flex justify-center mt-10 p-4">
                    <Loader2 className="animate-spin text-white" />
                </div>
            )}
            
            {!loadingPosts && !hasMore && posts.length > 0 && (
                 <div className="py-8 text-center text-zinc-600 text-sm">
                    Isso é tudo!
                 </div>
            )}
        </div>
    );
};