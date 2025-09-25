// Teste simples do Better Auth
const { betterAuth } = require("better-auth");

console.log("Testing Better Auth...");

try {
  const auth = betterAuth({
    secret: "test-secret",
    baseURL: "http://localhost:3000",
    socialProviders: {
      google: {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
      },
    },
  });

  console.log("Better Auth initialized successfully");
  console.log("Auth object:", typeof auth);
} catch (error) {
  console.error("Error initializing Better Auth:", error);
}
