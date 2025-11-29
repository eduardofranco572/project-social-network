"use client";

import { useState } from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import Link from "next/link";
import SettingsModal from '@/src/features/settings/components/SettingsModal';

const UserAvatar = ({ src }: { src?: string | null }) => (
  <div className="size-10 rounded-full bg-secondary overflow-hidden flex-shrink-0 border border-white/10">
    <img
      src={src || "/img/iconePadrao.svg"}
      alt="Foto"
      className="w-full h-full object-cover"
    />
  </div>
);

export function ProfileFooter() {
  const { user: usuario, isLoading } = useCurrentUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (isLoading) {
    return (
      <footer className="mt-auto p-4 border-t border-border">
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 w-full">
            <div className="size-10 rounded-full bg-zinc-800" />

            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-2 w-12 bg-zinc-800 rounded" />
            </div>
          </div>
          
          <div className="size-8 w-8 bg-zinc-800 rounded-md ml-2" />
        </div>
      </footer>
    );
  }

  if (!usuario) return null;

  return (
    <>
      <footer className="mt-auto p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Link 
            href={`/perfil/${usuario.id}`} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer overflow-hidden"
          >
            <UserAvatar src={usuario.foto} />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate max-w-[120px]">
                {usuario.nome}
              </span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSettingsOpen(true)} 
            title="Configurações"
            className="text-zinc-400 hover:text-white"
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </footer>

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
}