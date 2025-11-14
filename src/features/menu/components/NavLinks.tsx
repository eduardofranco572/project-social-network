"use client";

import Link from "next/link";
import { Bell, Compass, Home, Search, MessageCircle, SquarePlay } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavLinks() {
  return (
    <nav className="flex flex-col gap-4 py-6 px-4">
      <Button
        variant="ghost"
        className="w-full justify-start text-base h-10"
        asChild
      >
        <Link href="/">
          <Home className="mr-3" />
          Home
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start text-base h-10"
        asChild
      >
        <Link href="/explorar">
          <Compass className="mr-3" />
          Explorar
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
          <Search className="mr-3" />
          Pesquisar
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