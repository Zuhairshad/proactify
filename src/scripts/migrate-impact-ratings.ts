import connectDB from '../lib/mongodb';
import Risk from '../models/Risk';

async function migrateImpactRatings() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();

        console.log('Fetching all risks...');
        const risks = await Risk.find({}).lean();

        console.log(`Found ${risks.length} risks`);

        let updated = 0;
        let skipped = 0;

        for (const risk of risks) {
            // Check all possible field name variations
            const impactRating =
                risk['Impact Rating (0.05-0.8)'] ||
                risk['ImpactRating'] ||
                risk['Impact_Rating'] ||
                risk['impactRating'] ||
                null;

            console.log(`\nRisk: ${risk.Title}`);
            console.log('Available fields:', Object.keys(risk));
            console.log('Impact Rating value found:', impactRating);

            if (impactRating !== null && impactRating !== undefined) {
                // Update the risk to have the backup field
                await Risk.updateOne(
                    { _id: risk._id },
                    {
                        $set: {
                            ImpactRating: impactRating,
                            'Impact Rating (0.05-0.8)': impactRating
                        }
                    }
                );
                updated++;
                console.log(`✓ Updated with ImpactRating: ${impactRating}`);
            } else {
                skipped++;
                console.log(`✗ No Impact Rating found - skipped`);
            }
        }

        console.log(`\n=== Migration Complete ===`);
        console.log(`Updated: ${updated} risks`);
        console.log(`Skipped: ${skipped} risks`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateImpactRatings();
