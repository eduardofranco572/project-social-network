import React from 'react';
import Sidebar from '@/src/features/menu/Sidebar';
import { MobileNav } from '@/src/features/menu/MobileNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileNav />

      <main className="flex-1 flex flex-col ml-0 md:ml-72 pb-20 md:pb-0 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}