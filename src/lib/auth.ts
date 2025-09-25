import { betterAuth } from "better-auth";
import { emailService } from "./email-service";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://falachefe-v4.vercel.app",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({
      email,
      token,
      user,
    }: {
      email: string;
      token: string;
      user: { name: string };
    }) {
      const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;
      await emailService.sendMagicLinkEmail(email, magicLink, user.name);
    },
    async sendPasswordResetEmail({
      email,
      token,
      user,
    }: {
      email: string;
      token: string;
      user: { name: string };
    }) {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;
      await emailService.sendEmail({
        to: email,
        subject: "🔒 Redefinir senha - FalaChefe",
        html: `
          <h2>Redefinir senha</h2>
          <p>Olá ${user.name},</p>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="${resetLink}">Redefinir senha</a>
          <p>Este link expira em 1 hora.</p>
        `,
      });
    },
    async sendWelcomeEmail({
      email,
      user,
    }: {
      email: string;
      user: { name: string };
    }) {
      await emailService.sendWelcomeEmail(email, user.name);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
