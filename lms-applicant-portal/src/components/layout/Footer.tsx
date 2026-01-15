export function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/80">© 2026 SECU</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-white/80 hover:text-white transition"
            >
              Equal Housing Opportunity
            </a>
            <span className="text-white/50">|</span>
            <a
              href="#"
              className="text-sm text-white/80 hover:text-white transition"
            >
              Legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
