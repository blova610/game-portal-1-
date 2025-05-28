import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Redirect from /games/[slug] to /game/[slug]
  if (pathname.startsWith("/games/") && !pathname.startsWith("/games/page")) {
    const newPath = pathname.replace("/games/", "/game/")
    url.pathname = newPath
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/games/:path*"],
}
