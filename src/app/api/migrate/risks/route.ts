import { NextRequest, NextResponse } from 'next/server';
import { migrateExistingRisks } from '@/services/migration-service';

/**
 * POST /api/migrate/risks
 * Migrate existing risks to new temporal schema
 */
export async function POST(request: NextRequest) {
    try {
        console.log('Starting risk migration...');

        const results = await migrateExistingRisks();

        return NextResponse.json({
            success: true,
            message: 'Migration completed',
            results,
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Migration failed',
            },
            { status: 500 }
        );
    }
}
