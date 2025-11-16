"use client";

import { Settings, LogOut } from "lucide-react"; //
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const UserAvatar = ({ src }: { src?: string | null }) => (
  <div className="size-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
    {src ? (
      <img
        src={src}
        alt="Foto do Perfil"
        className="w-full h-full object-cover"
      />
    ) : (
      <img
        src="/img/iconePadrao.svg"
        alt="Foto Padrão"
        className="w-full h-full object-cover p-1"
      />
    )}
  </div>
);


export function ProfileFooter() {
  const { user: usuario, isLoading } = useCurrentUser();
  const router = useRouter();

  const handleLogout = async () => {
     const response = await fetch('/api/auth/logout', { method: 'POST' });

     if (response.ok) {
        await Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Deslogado com sucesso!',
            showConfirmButton: false,
            timer: 2000,
            background: '#1c1c1c',
            color: '#ffffff',
        });
        router.push('/login');
        router.refresh();
     }
  };


  if (isLoading) {
    return (
      <footer className="mt-auto p-4 border-t animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-secondary" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-24 bg-secondary rounded" />
              <div className="h-3 w-16 bg-secondary rounded" />
            </div>
          </div>
          <div className="size-8 w-8 bg-secondary rounded-md" />
        </div>
      </footer>
    );
  }

  if (!usuario) {
    return null;
  }


  return (
    <footer className="mt-auto p-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar src={usuario.foto} />

          <div className="flex flex-col">
            <span className="font-medium text-sm">{usuario.nome}</span>
            <span className="text-xs text-muted-foreground">
              Online
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={() => console.log('Abrir Configurações')} title="Configurações">
          <Settings className="size-5" />
        </Button>

      </div>
    </footer>
  );
}