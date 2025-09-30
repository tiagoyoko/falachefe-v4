/**
 * Declarações mínimas para permitir que o TypeScript reconheça o módulo `vitest`
 * mesmo quando a dependência não está instalada no ambiente local. Isso evita
 * erros de compilação em ambientes que utilizam apenas typecheck.
 */

declare module "vitest" {
  export const describe: (...args: any[]) => void;
  export const it: (...args: any[]) => void;
  export const test: (...args: any[]) => void;
  export const expect: any;
  export const beforeEach: (...args: any[]) => void;
  export const afterEach: (...args: any[]) => void;
  export const beforeAll: (...args: any[]) => void;
  export const afterAll: (...args: any[]) => void;
  export const vi: any;
}

declare module "vitest/config" {
  const defineConfig: (...args: any[]) => any;
  export { defineConfig };
}

