import { NextRequest, NextResponse } from 'next/server';
import { getProjectIssueTrends } from '@/services/issue-trend-service';

/**
 * GET /api/trends/issues?months=7
 * Get monthly trends for all issue metrics
 */
export async function GET(request: NextRequest) {
    try {
        const monthsBack = parseInt(request.nextUrl.searchParams.get('months') || '7');

        const trends = await getProjectIssueTrends(monthsBack);

        return NextResponse.json({
            success: true,
            data: trends,
        });

    } catch (error) {
        console.error('Issue trend API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch issue trends',
            },
            { status: 500 }
        );
    }
}
