import '@testing-library/jest-dom'

// Mock global fetch
// @ts-ignore
global.fetch = vi.fn()

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
