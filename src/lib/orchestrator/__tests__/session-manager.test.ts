/**
 * Unit Tests for Session Manager
 * Testa funcionalidades básicas do gerenciador de sessões
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

describe('SessionManager', () => {
  const mockUserId = 'test-user-123';
  const mockChatId = 'test-chat-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getOrCreateActiveSession', () => {
    it('should create a new session when no active session exists', async () => {
      // Mock: no active session found
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([])
            })
          })
        })
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({})
      });

      (db.select as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);
      (db.insert as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockInsert);

      const result = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);

      expect(result).toEqual({
        sessionId: expect.stringContaining(mockUserId),
        userId: mockUserId,
        chatId: mockChatId,
        agentId: 'max',
        isActive: true,
        lastActivity: expect.any(Date),
        messageCount: 0
      });

      expect(mockInsert).toHaveBeenCalledWith(conversationSessions);
    });

    it('should return existing active session when found', async () => {
      const mockSession = {
        id: 'existing-session-123',
        userId: mockUserId,
        agent: 'max',
        chatId: mockChatId,
        lastActivity: new Date(),
        isActive: true,
        createdAt: new Date()
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSession])
            })
          })
        })
      });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      });

      (db.select as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);
      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const result = await sessionManager.getOrCreateActiveSession(mockUserId, mockChatId);

      expect(result.sessionId).toBe('existing-session-123');
      expect(mockUpdate).toHaveBeenCalled(); // Should update lastActivity
    });
  });

  describe('cleanupOldSessions', () => {
    it('should mark old sessions as inactive', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 5 })
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      const result = await sessionManager.cleanupOldSessions();

      expect(result).toBe(5);
      expect(mockUpdate).toHaveBeenCalledWith(conversationSessions);
    });

    it('should handle errors during cleanup', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      await expect(sessionManager.cleanupOldSessions()).rejects.toThrow('Database error');
    });
  });

  describe('closeSession', () => {
    it('should mark session as inactive', async () => {
      const sessionId = 'test-session-123';
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({})
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      await sessionManager.closeSession(sessionId);

      expect(mockUpdate).toHaveBeenCalledWith(conversationSessions);
    });

    it('should handle errors during session closure', async () => {
      const sessionId = 'test-session-123';
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      (db.update as unknown as ReturnType<typeof vi.fn>).mockImplementation(mockUpdate);

      await expect(sessionManager.closeSession(sessionId)).rejects.toThrow('Database error');
    });
  });

  describe('Performance Metrics', () => {
    it('should collect performance metrics', () => {
      const metrics = sessionManager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('total');
      expect(metrics).toHaveProperty('byOperation');
      expect(metrics).toHaveProperty('recentErrors');
      expect(metrics).toHaveProperty('memoryUsage');
    });

    it('should detect performance alerts', () => {
      const alerts = sessionManager.getPerformanceAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);
    });
  });
});
