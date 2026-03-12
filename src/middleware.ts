export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};
