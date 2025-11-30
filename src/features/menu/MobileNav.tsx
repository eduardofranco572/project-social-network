"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { CreatePostButton } from "./components/CreatePostButton";

export function MobileNav() {
    const pathname = usePathname();
    const { user } = useCurrentUser();
    
    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-[#171717] border-t border-zinc-800 flex justify-around items-center px-2 md:hidden">
            <Link 
                href="/" 
                className={cn("p-3 rounded-lg transition-colors", isActive('/') ? "text-white" : "text-zinc-500")}
            >
                <Home size={26} strokeWidth={isActive('/') ? 3 : 2} />
            </Link>

            <Link 
                href="/explorar"
                className={cn("p-3 rounded-lg transition-colors", isActive('/explorar') ? "text-white" : "text-zinc-500")}
            >
                <Compass size={26} strokeWidth={isActive('/explorar') ? 3 : 2} />
            </Link>

            <div className="text-white">
                <CreatePostButton isMobile={true} />
            </div>

            <Link 
                href="/pesquisar"
                className={cn("p-3 rounded-lg transition-colors", isActive('/pesquisar') ? "text-white" : "text-zinc-500")}
            >
                <Search size={26} strokeWidth={isActive('/pesquisar') ? 3 : 2} />
            </Link>

            <Link 
                href={user ? `/perfil/${user.id}` : '/login'}
                className={cn("p-3 rounded-lg transition-colors overflow-hidden", isActive(user ? `/perfil/${user.id}` : '#') ? "ring-2 ring-white rounded-full p-0" : "")}
            >
                {user?.foto ? (
                    <img src={user.foto} alt="Perfil" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                    <User size={26} className="text-zinc-500" />
                )}
            </Link>

        </div>
    );
}