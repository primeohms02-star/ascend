import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { NotificationProvider } from "@/app/context/NotificationContext";

import "./globals.css";

export const metadata: Metadata = {
  title: "ASCEND",
  description: "Discover your next direction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}