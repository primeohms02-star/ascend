export default function Footer() {
  return (
    <footer className="border-t mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-xl font-bold">
          ASCEND
        </h2>

        <p className="text-gray-500 text-sm">
          © 2026 ASCEND. All rights reserved.
        </p>

        <div className="flex gap-6 text-gray-500">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}