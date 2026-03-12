import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes per PRD Section 2.2
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = request.nextUrl.pathname === "/login";
      const isOnHome = request.nextUrl.pathname === "/";
      const isOnApi = request.nextUrl.pathname.startsWith("/api");
      const isOnPass = request.nextUrl.pathname.startsWith("/pass/");

      // Public pass links for residents (secure token-based)
      if (isOnPass) return true;

      // API auth routes are public
      if (isOnApi) return true;

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      if (isOnHome) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      // All other routes require authentication
      return isLoggedIn;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const passwordMatch = compareSync(password, user.password);
        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
