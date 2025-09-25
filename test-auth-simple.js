// Teste simples do Better Auth sem banco
const { betterAuth } = require("better-auth");

console.log("Testing Better Auth without database...");

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

  // Testar se as rotas estão sendo registradas
  console.log("Auth routes:", auth.routes);
} catch (error) {
  console.error("Error initializing Better Auth:", error);
}
