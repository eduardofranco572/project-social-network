import Link from "next/link";
import { Network } from "lucide-react";

export function SidebarHeader() {
  return (
    <header className="h-16 flex items-center gap-3 px-6 border-b">
      <Network className="size-7 text-primary" />
      <h1 className="text-xl font-bold text-primary">Rede Social</h1>
    </header>
  );
}