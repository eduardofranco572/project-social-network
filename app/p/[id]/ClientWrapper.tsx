"use client";

import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { PostDetailModal } from "@/src/features/post/components/PostDetailModal";
import { useRouter } from "next/navigation";
import { PostWithAuthor } from "@/src/features/post/components/types";

export default function ClientPostPageWrapper({ post }: { post: PostWithAuthor }) {
    const { user } = useCurrentUser();
    const router = useRouter();

    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
            <PostDetailModal 
                post={post} 
                loggedInUser={user} 
                onClose={() => router.push('/')} 
                isPage={true} 
            />
        </div>
    );
}