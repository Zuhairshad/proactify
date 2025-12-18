import { NextRequest, NextResponse } from 'next/server';
import { getRiskTrend } from '@/services/trend-service';

/**
 * GET /api/trends/risk/[riskId]?field=emv
 * Get historical trend for a specific risk
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { riskId: string } }
) {
    try {
        const riskId = params.riskId;
        const field = request.nextUrl.searchParams.get('field') || 'emv';

        const trend = await getRiskTrend(riskId, field);

        return NextResponse.json({
            success: true,
            data: trend,
        });

    } catch (error) {
        console.error('Risk trend API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch risk trend',
            },
            { status: 500 }
        );
    }
}
