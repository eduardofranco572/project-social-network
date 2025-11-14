"use client";

import {
  ImageIcon,
  MessageCircle,
  PlusSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CreatePostButton() {
  return (
    <div className="px-4 pb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full justify-center text-base h-10 gap-1.5">
            <PlusSquare />
            Criar
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-56" 
          align="start" 
          side="top" 
          sideOffset={8}
        >
          <DropdownMenuItem className="cursor-pointer">
            <ImageIcon className="mr-2" />
            <span>Novo Post</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <MessageCircle className="mr-2" />
            <span>Novo Status</span>
          </DropdownMenuItem>
        </DropdownMenuContent>

      </DropdownMenu>
    </div>
  );
}