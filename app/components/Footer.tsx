"use client";

import { useState } from "react";
import Link from "next/link";
import AboutModal from "@/app/components/AboutModal";

export default function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <footer
        id="contact"
        className="border-t border-white/10 bg-[#05070B] px-6 py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}

          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white">
              ASCEND
            </h2>

            <p className="mt-6 max-w-md leading-8 text-slate-400">
              Helping people discover their direction and continually
              ascend toward their highest potential.
            </p>
          </div>

          {/* Product */}

          <div>
            <h3 className="mb-6 font-semibold text-white">
              Product
            </h3>

            <ul className="space-y-4 text-slate-400">
              <li><span>Atlas</span></li>
              <li><span>Cortex</span></li>
              <li><span>Navigator</span></li>
              <li><span>Momentum</span></li>
              <li><span>Opportunities</span></li>
            </ul>
          </div>

          {/* Company */}

          <div>
            <h3 className="mb-6 font-semibold text-white">
              Company
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li>
                <button
                  onClick={() => setAboutOpen(true)}
                  className="transition hover:text-white"
                >
                  About
                </button>
              </li>

              <li>
                <Link
                  href="/#how-it-works"
                  className="transition hover:text-white"
                >
                  Roadmap
                </Link>
              </li>

            </ul>
          </div>

          {/* Connect */}

          <div>
            <h3 className="mb-6 font-semibold text-white">
              Connect
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li>
                <a
                  href="https://x.com/Ascendai_space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  X
                </a>
              </li>

              <li>
                <span className="text-slate-500">
                  Support (Coming Soon)
                </span>
              </li>

            </ul>
          </div>

        </div>

        <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8">
          <p className="text-center text-sm text-slate-500">
            © 2026 ASCEND. Built for Human Potential.
          </p>
        </div>
      </footer>

      <AboutModal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </>
  );
}