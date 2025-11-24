import StatusCarousel from "@/src/features/status/components/StatusCarousel";
import { PostFeed } from "@/src/features/post/components/PostFeed";

export default function HomePage() {
  return (
    <div className="w-full max-w-[1000px] ml-auto pt-8 px-4 flex justify-center lg:justify-start gap-16">
      <div className="w-full max-w-[470px] flex flex-col gap-6">
        <StatusCarousel />
        <PostFeed />
      </div>

    </div>
  );
}