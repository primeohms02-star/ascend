export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          ASCEND
        </h1>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-gray-600 hover:text-black transition">
            Features
          </a>

          <a href="#how-it-works" className="text-gray-600 hover:text-black transition">
            How It Works
          </a>

          <a href="#contact" className="text-gray-600 hover:text-black transition">
            Contact
          </a>
        </div>

        <button className="rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800">
          Get Started
        </button>
      </nav>
    </header>
  );
}