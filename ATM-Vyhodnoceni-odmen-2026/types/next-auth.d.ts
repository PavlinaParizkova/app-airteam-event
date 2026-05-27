import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
      isApprover: boolean;
      isFinance: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    isApprover?: boolean;
    isFinance?: boolean;
    memberName?: string;
    memberEmail?: string;
  }
}
