"use client";

import type { ReactNode } from "react";

import AppNavigation from "./AppNavigation";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <AppNavigation />

      <div className="min-h-screen pb-[calc(6.6rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-64">
        {children}
      </div>
    </div>
  );
}
