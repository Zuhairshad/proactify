import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function POST() {
    try {
        await connectDB();

        const risks = await Risk.find({});

        let updated = 0;
        let skipped = 0;
        const details = [];

        for (const risk of risks) {
            const doc = risk.toObject();

            // Check all possible field name variations
            const impactRating =
                doc['Impact Rating (0.05-0.8)'] ||
                doc['ImpactRating'] ||
                doc['Impact_Rating'] ||
                doc['impactRating'] ||
                null;

            if (impactRating !== null && impactRating !== undefined) {
                // Update to ensure both field names exist
                risk.set('ImpactRating', impactRating);
                risk.set('Impact Rating (0.05-0.8)', impactRating);
                await risk.save();

                updated++;
                details.push({
                    title: risk.Title,
                    impactRating: impactRating,
                    status: 'updated'
                });
            } else {
                skipped++;
                details.push({
                    title: risk.Title,
                    status: 'no_impact_rating'
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration complete: ${updated} updated, ${skipped} skipped`,
            updated,
            skipped,
            details
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
