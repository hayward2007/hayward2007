import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Base domain the site is served from in production, e.g. "hayward.kim".
// Any request whose Host is "<slug>.<BASE_DOMAIN>" is rewritten to /p/<slug>,
// so a generated application portfolio can be shared as a real subdomain
// once a wildcard DNS record (and wildcard TLS) points at this server.
// Until that DNS is set up, the same page is always reachable at /p/<slug>.
const BASE_DOMAIN = process.env.BASE_DOMAIN || "hayward.kim";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (hostname !== BASE_DOMAIN && hostname.endsWith(`.${BASE_DOMAIN}`)) {
    const slug = hostname.slice(0, -1 * (BASE_DOMAIN.length + 1));
    if (slug && slug !== "www" && slug !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/p/${slug}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  const { pathname } = request.nextUrl;

  // Old top-level hubs that got folded into another page — redirect the exact
  // hub URL, but leave sub-pages (e.g. /tools/merge-pdf) alone.
  const LEGACY_REDIRECTS: Record<string, string> = {
    "/": "/about",
    "/activities": "/awards",
    "/tools": "/play",
    "/contact": "/social",
  };
  if (pathname in LEGACY_REDIRECTS) {
    const url = request.nextUrl.clone();
    url.pathname = LEGACY_REDIRECTS[pathname];
    return NextResponse.redirect(url);
  }

  const isProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (isProtectedPage || isProtectedApi) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const valid = await verifySessionToken(token);
    if (!valid) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
