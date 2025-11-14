"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserAvatar = ({ src }: { src?: string | null }) => (
  <div className="size-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
    {src ? (
      <img
        src={src}
        alt="Foto do Perfil"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-muted" />
    )}
  </div>
);


export function ProfileFooter() {
  const usuario = {
    nome: "Eduardo Franco",
    foto: null, 
    status: "Online",
  };

  return (
    <footer className="mt-auto p-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar src={usuario.foto} />

          <div className="flex flex-col">
            <span className="font-medium text-sm">{usuario.nome}</span>
            <span className="text-xs text-muted-foreground">
              {usuario.status}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon">
          <Settings className="size-5" />
        </Button>
      </div>
    </footer>
  );
}