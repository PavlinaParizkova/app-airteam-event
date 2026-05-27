import { auth } from "@/auth";

const DEV_BYPASS =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_AUTH_BYPASS === "true";

/**
 * Vrací session. V dev módu s DEV_AUTH_BYPASS=true automaticky
 * injectuje admin session bez nutnosti Google OAuth přihlášení.
 */
export async function getAuth() {
  if (DEV_BYPASS) {
    return {
      user: {
        name:        "Pavlína Pařízková",
        email:       "pavlina.parizkova@airteam.eu",
        image:       null as string | null,
        isAdmin:     true  as boolean,
        isApprover:  true  as boolean,
        isFinance:   false as boolean,
      },
      expires: "2099-01-01",
    };
  }
  return auth();
}

/** Platební plán — pouze admin nebo finance (ne schvalovatel, ne běžný uživatel). */
export function canAccessFinancePlan(
  session: Awaited<ReturnType<typeof getAuth>> | null,
): boolean {
  return !!(session?.user?.isAdmin || session?.user?.isFinance);
}
