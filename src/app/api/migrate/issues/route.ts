import { NextRequest, NextResponse } from 'next/server';
import { migrateExistingIssues } from '@/services/migration-service';

/**
 * POST /api/migrate/issues
 * Migrate existing issues to new temporal schema
 */
export async function POST(request: NextRequest) {
    try {
        console.log('Starting issue migration...');

        const results = await migrateExistingIssues();

        return NextResponse.json({
            success: true,
            message: 'Issue migration completed',
            results,
        });

    } catch (error) {
        console.error('Issue migration error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Migration failed',
            },
            { status: 500 }
        );
    }
}
