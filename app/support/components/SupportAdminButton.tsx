"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

type AccessResponse = {
  success: boolean;
  isAdmin: boolean;
};

export default function SupportAdminButton() {
  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const controller =
      new AbortController();

    async function checkAccess() {
      try {
        const response =
          await fetch(
            "/api/support/admin/access",
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        const data =
          (await response.json()) as AccessResponse;

        setIsAdmin(
          response.ok &&
            data.success &&
            data.isAdmin
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setIsAdmin(false);
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    checkAccess();

    return () =>
      controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-500">
        <LoaderCircle
          size={16}
          className="animate-spin"
        />

        Checking access
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/support/admin"
      className="inline-flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-400/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-400/15 hover:text-white"
    >
      <ShieldCheck
        size={18}
        aria-hidden="true"
      />

      Support Administrator
    </Link>
  );
}