import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  displayNameForSignIn,
  isAdminEmail,
  isApproverEmail,
  isFinanceEmail,
  isAllowedSignInEmail,
} from "./app/data/team-emails";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
      // Derive email from profile (initial sign-in) or from the persisted token.email
      // (token refreshes). This ensures isAdmin/isApprover/isFinance are always set,
      // even for sessions created before these fields were introduced.
      const email = (
        profile?.email ?? (token.email as string | undefined) ?? ""
      ).toLowerCase();
      if (email) {
        token.memberName  = displayNameForSignIn(email, profile?.name ?? (token.name as string | undefined));
        token.memberEmail = email;
        token.isAdmin     = isAdminEmail(email);
        token.isApprover  = isApproverEmail(email);
        token.isFinance   = isFinanceEmail(email);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.memberName) {
        session.user.name = token.memberName as string;
      }
      session.user.isAdmin    = (token.isAdmin    as boolean | undefined) ?? false;
      session.user.isApprover = (token.isApprover as boolean | undefined) ?? false;
      session.user.isFinance  = (token.isFinance  as boolean | undefined) ?? false;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
