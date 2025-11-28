"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Home, Search, MessageCircle, SquarePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex flex-col gap-4 py-6 px-4">
      <Button
        variant="ghost"
        className={cn("w-full justify-start text-base h-10", isActive('/') && "bg-accent text-white font-bold")}
        asChild
      >
        <Link href="/">
          <Home className="mr-3" />
          Home
        </Link>
      </Button>

      <Button
        variant="ghost"
        className={cn("w-full justify-start text-base h-10", isActive('/explorar') && "bg-accent text-white font-bold")}
        asChild
      >
        <Link href="/explorar">
          <Compass className="mr-3" />
          Explorar
        </Link>
      </Button>

      <Button
        variant="ghost"
        className={cn("w-full justify-start text-base h-10", isActive('/pesquisar') && "bg-accent text-white font-bold")}
        asChild
      >
        <Link href="/pesquisar">
          <Search className="mr-3" />
          Pesquisar
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start text-base h-10"
        asChild
      >
        <Link href="/notificacoes">
          <Bell className="mr-3" />
          Notificações
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start text-base h-10"
        asChild
      >
        <Link href="#">
          <SquarePlay className="mr-3" />
          Videos
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start text-base h-10"
        asChild
      >
        <Link href="#">
          <MessageCircle className="mr-3" />
          Mensagem
        </Link>
      </Button>
    </nav>
  );
}