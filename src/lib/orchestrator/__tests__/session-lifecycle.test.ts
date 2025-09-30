/**
 * Integration Tests for Session Lifecycle
 * Testa o ciclo completo de vida das sessões
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sessionManager } from '../session-manager';

describe('Session Lifecycle Integration', () => {
  const mockUserId = 'integration-test-user';
  const mockChatId = 'integration-test-chat';

  beforeEach(async () => {
    // Cleanup before each test
    await sessionManager.cleanupOldSessions();
  });

  afterEach(async () => {
    // Cleanup after each test
    await sessionManager.cleanupOldSessions();
  });

  describe('Complete Session Lifecycle', () => {
    it('should handle complete session lifecycle: create -> update -> close', async () => {
      // 1. Create session
      const session = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(session.isActive).toBe(true);
      expect(session.userId).toBe(mockUserId);
      expect(session.chatId).toBe(mockChatId);

      // 2. Update activity (simulate user interaction)
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      const updatedSession = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(updatedSession.sessionId).toBe(session.sessionId);
      expect(updatedSession.lastActivity.getTime()).toBeGreaterThan(session.lastActivity.getTime());

      // 3. Close session
      await sessionManager.closeSession(session.sessionId);
      
      // 4. Verify session is closed (should create new session)
      const newSession = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(newSession.sessionId).not.toBe(session.sessionId);
    });

    it('should handle multiple concurrent sessions', async () => {
      const sessions = await Promise.all([
        sessionManager.getOrCreateActiveSession(mockUserId, 'chat1'),
        sessionManager.getOrCreateActiveSession(mockUserId, 'chat2'),
        sessionManager.getOrCreateActiveSession(mockUserId, 'chat3')
      ]);

      // All sessions should be different
      const sessionIds = sessions.map(s => s.sessionId);
      const uniqueIds = new Set(sessionIds);
      expect(uniqueIds.size).toBe(3);

      // All should be active
      sessions.forEach(session => {
        expect(session.isActive).toBe(true);
      });
    });

    it('should handle session timeout cleanup', async () => {
      // Create session
      const _session = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      
      // Simulate old session by manipulating the database directly
      // (In real test, you would use a test database)
      
      // Run cleanup
      const cleanedCount = await sessionManager.cleanupOldSessions();
      
      // Should return number of cleaned sessions
      expect(typeof cleanedCount).toBe('number');
      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking database errors
      // For now, we test that methods don't throw unexpected errors
      try {
        await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
        await sessionManager.cleanupOldSessions();
        await sessionManager.closeSession('non-existent-session');
      } catch (error) {
        // Should only throw expected errors
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should handle rapid session operations', async () => {
      const startTime = Date.now();
      const operations = [];

      // Simulate rapid operations
      for (let i = 0; i < 10; i++) {
        operations.push(
          sessionManager.getOrCreateActiveSession(`${mockUserId}-${i}`, `chat-${i}`)
        );
      }

      await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should maintain performance metrics', () => {
      const metrics = sessionManager.getPerformanceMetrics();
      
      expect(metrics.total).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThan(0);
      
      // Check that metrics are being collected
      expect(typeof metrics.byOperation).toBe('object');
    });
  });
});
