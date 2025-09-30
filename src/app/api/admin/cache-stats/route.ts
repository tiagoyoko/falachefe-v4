import { NextRequest, NextResponse } from 'next/server';
import { classificationCache } from '@/lib/orchestrator/classification-cache';

export async function GET(_request: NextRequest) {
  try {
    const stats = classificationCache.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache stats' },
      { status: 500 }
    );
  }
}
