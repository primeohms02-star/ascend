"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function WorkNavigationLink({
  href,
  children,
  className,
  replace = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
}) {
  const router = useRouter();
  useEffect(() => { router.prefetch(href); }, [href, router]);
  const warm = () => router.prefetch(href);
  return <Link href={href} replace={replace} prefetch onMouseEnter={warm} onFocus={warm} onPointerDown={warm} className={className}>{children}</Link>;
}
