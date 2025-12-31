
"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserButton } from "@clerk/nextjs";

function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 bg-background/95">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(var(--grid-color)_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="glow-1 absolute -z-10" />
        <div className="glow-2 absolute -z-10" />
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
          {mounted && <UserButton afterSignOutUrl="/sign-in" />}
        </header>
        <main className="flex-1 px-2 py-4 sm:px-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}


export default MainLayout;
