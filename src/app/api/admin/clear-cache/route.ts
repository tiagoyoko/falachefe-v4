import { NextRequest, NextResponse } from 'next/server';
import { classificationCache } from '@/lib/orchestrator/classification-cache';

export async function POST(_request: NextRequest) {
  try {
    classificationCache.clear();
    return NextResponse.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
