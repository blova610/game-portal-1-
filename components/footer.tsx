import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#0f0f23] border-t border-slate-800 mt-auto pl-14 md:pl-16">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">GamePortal</h3>
            <p className="text-sm text-slate-400">Play the best online games for free on our modern web game portal.</p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-400 transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-slate-400 transition-colors hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/popular" className="text-slate-400 transition-colors hover:text-white">
                  Popular Games
                </Link>
              </li>
              <li>
                <Link href="/new" className="text-slate-400 transition-colors hover:text-white">
                  New Games
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-slate-400 transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 transition-colors hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contact@gameportal.com" className="text-slate-400 transition-colors hover:text-white">
                  contact@gameportal.com
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 transition-colors hover:text-white">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} GamePortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
