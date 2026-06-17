import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const signInPage = "/dashboard/login";
const ALLOWED_DASHBOARD_EMAIL = "asmir.alams.com@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: signInPage,
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      const email = typeof profile?.email === "string" ? profile.email.toLowerCase() : "";
      const emailVerified = "email_verified" in (profile ?? {}) && Boolean(profile?.email_verified);

      return emailVerified && email === ALLOWED_DASHBOARD_EMAIL;
    },
    async jwt({ token, profile }) {
      if (typeof profile?.email === "string") {
        token.email = profile.email.toLowerCase();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.email === "string") {
        session.user.email = token.email;
      }

      return session;
    },
  },
});
