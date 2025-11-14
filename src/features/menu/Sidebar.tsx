import { SidebarHeader } from "./components/Header";
import { NavLinks } from "./components/NavLinks";
import { CreatePostButton } from "./components/CreatePostButton";
import { ProfileFooter } from "./components/ProfileFooter";

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen flex flex-col fixed top-0 left-0 bg-background border-r z-10">
      <SidebarHeader />

      <div className="flex-1 flex flex-col justify-between overflow-y-auto">
        <NavLinks />
        <CreatePostButton />
      </div>

      <ProfileFooter />
    </aside>
  );
}