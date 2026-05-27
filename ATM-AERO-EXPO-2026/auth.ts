import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  displayNameForSignIn,
  isAllowedSignInEmail,
} from "./app/data/team-emails";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email ?? "";
      return isAllowedSignInEmail(email);
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        const email = profile.email.toLowerCase();
        token.memberName = displayNameForSignIn(email, profile.name);
        token.memberEmail = email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.memberName) {
        session.user.name = token.memberName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
