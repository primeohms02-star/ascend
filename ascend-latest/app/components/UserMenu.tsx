"use client";

import { UserButton } from "@clerk/nextjs";

export default function UserMenu() {
  return (
    <div className="flex items-center gap-4">
      <UserButton />
    </div>
  );
}