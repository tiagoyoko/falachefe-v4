import { NextRequest, NextResponse } from 'next/server';
import { classificationMetrics } from '@/lib/orchestrator/classification-metrics';

export async function GET(_request: NextRequest) {
  try {
    const metrics = await classificationMetrics.getMetrics();
    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('[classification-metrics] erro ao buscar métricas:', error);
    return NextResponse.json(
      { message: 'Não foi possível buscar as métricas de classificação' },
      { status: 500 }
    );
  }
}

