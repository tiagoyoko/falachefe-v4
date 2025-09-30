import { NextRequest, NextResponse } from 'next/server';
import { classificationMetrics } from '@/lib/orchestrator/classification-metrics';

export async function GET(_request: NextRequest) {
  try {
    const metrics = await classificationMetrics.getMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching classification metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classification metrics' },
      { status: 500 }
    );
  }
}
