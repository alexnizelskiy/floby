import { NextResponse, type NextRequest } from "next/server";

/**
 * Multi-domain routing:
 * - pets.floby.ru serves the pet-care product from the same app by rewriting
 *   every non-API request to the /pets/* segment.
 * - The main domain (www.floby.ru) is untouched.
 * Shared /api routes stay as-is so auth/session works on both subdomains.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const isPets = host.startsWith("pets.");
  const { pathname } = req.nextUrl;

  if (isPets && !pathname.startsWith("/pets") && !pathname.startsWith("/api")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/pets" : `/pets${pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // run on everything except Next internals and static files (with a dot)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.).*)"],
};
