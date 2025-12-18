import { NextRequest, NextResponse } from 'next/server';
import { captureBiWeeklySnapshots } from '@/services/migration-service';

/**
 * POST /api/snapshots/capture
 * Manually trigger bi-weekly snapshot capture
 */
export async function POST(request: NextRequest) {
    try {
        console.log('Capturing bi-weekly snapshots...');

        const results = await captureBiWeeklySnapshots();

        return NextResponse.json({
            success: true,
            message: 'Snapshots captured',
            results,
        });

    } catch (error) {
        console.error('Snapshot capture error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Capture failed',
            },
            { status: 500 }
        );
    }
}
