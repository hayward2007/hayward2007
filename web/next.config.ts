import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Not using `output: "standalone"` — the Docker image ships full node_modules
  // instead, so `prisma migrate deploy` (which needs the `prisma` CLI, a
  // devDependency) works at container start without extra tracing config.
  // "/" -> "/about" is handled in proxy.ts, not here, because it must NOT apply
  // when the Host is a generated-portfolio subdomain (next.config redirects
  // can't easily condition on that the way proxy.ts already does).
};

export default nextConfig;
