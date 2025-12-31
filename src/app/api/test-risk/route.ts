import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function POST() {
    try {
        await connectDB();

        // Create a test risk using SIMPLE field names only
        const testRiskData = {
            Title: "FINAL Test - Simple Fields",
            Description: "Testing simple field names",
            Month: "January 2025",
            ProjectCode: "TEST-SIMPLE",
            RiskStatus: "Open",
            Probability: 0.9,
            ImpactRating: 0.75,
            ImpactValue: 75000,
            BudgetContingency: 15000,
            Owner: "Simple Field Test",
            MitigationPlan: "Simple mitigation",
            ContingencyPlan: "Simple contingency",
            RiskScore: 0.675, // 0.9 * 0.75
            EMV: 67500, // 0.9 * 75000
        };

        const savedRisk = await Risk.create(testRiskData);
        const fetchedRisk = await Risk.findById(savedRisk._id).lean();

        return NextResponse.json({
            success: true,
            impactRatingWorking: !!(fetchedRisk.ImpactRating),
            savedData: testRiskData,
            fetchedData: {
                Title: fetchedRisk.Title,
                Probability: fetchedRisk.Probability,
                ImpactRating: fetchedRisk.ImpactRating,
                ImpactValue: fetchedRisk.ImpactValue,
                RiskScore: fetchedRisk.RiskScore,
                allFields: Object.keys(fetchedRisk)
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
