import { NextRequest, NextResponse } from 'next/server';
import { getProjectTrends } from '@/services/trend-service';

/**
 * GET /api/trends/project?months=7
 * Get monthly trends for all project metrics
 */
export async function GET(request: NextRequest) {
    try {
        const monthsBack = parseInt(request.nextUrl.searchParams.get('months') || '7');

        const trends = await getProjectTrends(monthsBack);

        return NextResponse.json({
            success: true,
            data: trends,
        });

    } catch (error) {
        console.error('Trend API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch trends',
            },
            { status: 500 }
        );
    }
}
