import { createAuthClient } from "better-auth/react";

function resolveBaseURL(): string {
  // Em runtime no browser, usa o domínio atual se não houver NEXT_PUBLIC_APP_URL
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Em SSR/build, mantém a env ou fallback local (não afeta browser)
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  verifyEmail,
  forgetPassword,
  resetPassword,
} = authClient;
