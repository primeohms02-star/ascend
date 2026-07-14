"use client";

import Link from "next/link";

export default function Footer() {
  return (
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

            <li>
              <Link href="#" className="hover:text-white transition">
                Atlas
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Cortex
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Navigator
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Momentum
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Opportunities
              </Link>
            </li>

          </ul>

        </div>

        {/* Company */}

        <div>

          <h3 className="mb-6 font-semibold text-white">
            Company
          </h3>

          <ul className="space-y-4 text-slate-400">

            <li>
              <Link href="#" className="hover:text-white transition">
                About
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Roadmap
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Privacy
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Terms
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
              <Link href="#" className="hover:text-white transition">
                X
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                LinkedIn
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                GitHub
              </Link>
            </li>

            <li>
              <Link href="#" className="hover:text-white transition">
                Contact
              </Link>
            </li>

          </ul>

        </div>

      </div>

      {/* Bottom */}

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8">

        <p className="text-center text-sm text-slate-500">
          © 2026 ASCEND. Built for Human Potential.
        </p>

      </div>

    </footer>
  );
}