import StatusCarousel from "@/src/features/status/components/StatusCarousel";
import { PostFeed } from "@/src/features/post/components/PostFeed";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-lg">
        <StatusCarousel />

        <PostFeed />
      </div>

    </div>
  );
}