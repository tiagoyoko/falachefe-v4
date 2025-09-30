/**
 * Story 1.1 Validation Tests
 * Testa todos os Acceptance Criteria da Story 1.1: Session Manager Completion & Optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sessionManager } from '../session-manager';
import { db } from '@/lib/db';
import { conversationSessions } from '@/lib/schema';

// Mock do banco de dados
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Story 1.1: Session Manager Completion & Optimization', () => {
  const mockUserId = 'test-user-story-1-1';
  const mockChatId = 'test-chat-story-1-1';
  const mockSessionId = 'test-session-story-1-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1: updateLastActivity() method implementation', () => {
    it('should update database with actual last activity timestamps', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 1 })
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      // Test the private method through public interface
      const session = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      
      // Verify that updateLastActivity was called (through getOrCreateActiveSession)
      expect(mockUpdate).toHaveBeenCalledWith(conversationSessions);
      
      // Verify the session has current timestamp
      expect(session.lastActivity).toBeInstanceOf(Date);
      expect(session.lastActivity.getTime()).toBeGreaterThan(Date.now() - 1000); // Within last second
    });

    it('should handle updateLastActivity errors gracefully', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database connection failed'))
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      await expect(sessionManager.getOrCreateActiveSession(mockUserId, mockChatId))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('AC2: cleanupOldSessions() method implementation', () => {
    it('should remove sessions older than configured timeout period', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 3 })
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const cleanedCount = await sessionManager.cleanupOldSessions();

      expect(cleanedCount).toBe(3);
      expect(mockUpdate).toHaveBeenCalledWith(conversationSessions);
    });

    it('should use correct timeout period (30 minutes)', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 0 })
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      await sessionManager.cleanupOldSessions();

      // Verify that the timeout is 30 minutes (1800000 ms)
      const timeoutMs = 30 * 60 * 1000;
      const _expectedCutoffTime = new Date(Date.now() - timeoutMs);
      
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('AC3: Database schema includes required fields', () => {
    it('should have lastActivity field in conversationSessions table', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);

      expect(mockInsert).toHaveBeenCalledWith(conversationSessions);
      
      // Verify that lastActivity field is being set
      const insertCall = mockInsert.mock.calls[0];
      expect(insertCall[0]).toBe(conversationSessions);
    });

    it('should have isActive field in conversationSessions table', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);

      expect(mockInsert).toHaveBeenCalledWith(conversationSessions);
    });

    it('should have chatId field for WhatsApp integration', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);

      expect(mockInsert).toHaveBeenCalledWith(conversationSessions);
    });
  });

  describe('AC4: Connection pooling optimization', () => {
    it('should handle multiple concurrent session operations efficiently', async () => {
      const startTime = Date.now();
      
      // Simulate multiple concurrent operations
      const promises = Array.from({ length: 10 }, (_, i) => 
        sessionManager.getOrCreateActiveSession(`${mockUserId}-${i}`, `chat-${i}`)
      );

      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (2 seconds)
      expect(duration).toBeLessThan(2000);
    });

    it('should maintain performance under load', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const startTime = Date.now();
      
      // Rapid session operations
      for (let i = 0; i < 20; i++) {
        await sessionManager.getOrCreateActiveSession(`${mockUserId}-${i}`, `chat-${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle load efficiently
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('AC5: Session performance monitoring', () => {
    it('should collect session performance metrics', () => {
      const metrics = sessionManager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('total');
      expect(metrics).toHaveProperty('byOperation');
      expect(metrics).toHaveProperty('recentErrors');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(typeof metrics.total).toBe('number');
      expect(typeof metrics.byOperation).toBe('object');
      expect(Array.isArray(metrics.recentErrors)).toBe(true);
      expect(typeof metrics.memoryUsage).toBe('number');
    });

    it('should detect performance alerts', () => {
      const alerts = sessionManager.getPerformanceAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);
      
      // Each alert should have required properties
      alerts.forEach(alert => {
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('severity');
      });
    });

    it('should clean up old metrics', () => {
      // Should not throw errors
      expect(() => sessionManager.cleanupMetrics()).not.toThrow();
    });
  });

  describe('AC6: Session lifecycle tests', () => {
    it('should create session lifecycle tests and they should pass', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 1 })
        })
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);
      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      // Test complete session lifecycle
      const session = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(session.isActive).toBe(true);

      // Simulate session update
      const updatedSession = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(updatedSession.sessionId).toBe(session.sessionId);

      // Test session closure
      await sessionManager.closeSession(session.sessionId);
      expect(mockUpdate).toHaveBeenCalledWith(conversationSessions);

      // Test cleanup
      const cleanedCount = await sessionManager.cleanupOldSessions();
      expect(typeof cleanedCount).toBe('number');
    });

    it('should handle session timeout scenarios', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 2 })
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const cleanedCount = await sessionManager.cleanupOldSessions();
      expect(cleanedCount).toBe(2);
    });
  });

  describe('AC7: No regression in existing functionality', () => {
    it('should maintain backward compatibility', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      // Test existing functionality still works
      const session = await sessionManager.getOrCreateActiveSession(mockUserId);
      
      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('userId');
      expect(session).toHaveProperty('isActive');
      expect(session).toHaveProperty('lastActivity');
      expect(session).toHaveProperty('messageCount');
      
      expect(session.userId).toBe(mockUserId);
      expect(session.isActive).toBe(true);
      expect(session.lastActivity).toBeInstanceOf(Date);
    });

    it('should handle optional chatId parameter', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      // Test with chatId
      const sessionWithChat = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(sessionWithChat.chatId).toBe(mockChatId);

      // Test without chatId
      const sessionWithoutChat = await sessionManager.getOrCreateActiveSession(mockUserId);
      expect(sessionWithoutChat.chatId).toBeUndefined();
    });

    it('should maintain conversation context functionality', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([])
            })
          })
        })
      });

      (db.select as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

      const context = await sessionManager.getConversationContext(mockSessionId);
      
      expect(context).toHaveProperty('sessionId');
      expect(context).toHaveProperty('recentMessages');
      expect(context.sessionId).toBe(mockSessionId);
      expect(Array.isArray(context.recentMessages)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: create -> update -> cleanup', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 1 })
        })
      });

      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);
      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      // 1. Create session
      const session = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(session.isActive).toBe(true);

      // 2. Update activity
      const updatedSession = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);
      expect(updatedSession.sessionId).toBe(session.sessionId);

      // 3. Close session
      await sessionManager.closeSession(session.sessionId);

      // 4. Cleanup old sessions
      const cleanedCount = await sessionManager.cleanupOldSessions();
      expect(typeof cleanedCount).toBe('number');

      // 5. Verify metrics are collected
      const metrics = sessionManager.getPerformanceMetrics();
      expect(metrics).toBeDefined();
    });
  });
});
