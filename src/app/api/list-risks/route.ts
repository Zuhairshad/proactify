import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function GET() {
    try {
        await connectDB();

        const allRisks = await Risk.find({}).lean();

        return NextResponse.json({
            success: true,
            count: allRisks.length,
            risks: allRisks.map(risk => ({
                _id: risk._id,
                Title: risk.Title,
                Description: risk.Description,
                ProjectCode: risk.ProjectCode || risk['Project Code'],
                Probability: risk.Probability,
                ImpactRating: risk.ImpactRating || risk['Impact Rating (0.05-0.8)'],
                createdAt: risk.createdAt
            }))
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
