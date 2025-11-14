import React from 'react';
import Sidebar from '@/src/features/menu/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto ml-72">
        {children}
      </main>
    </div>
  );
}