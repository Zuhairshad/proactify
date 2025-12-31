import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function GET() {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            return NextResponse.json({
                error: 'MONGODB_URI not configured',
                hasEnvVar: false
            }, { status: 500 });
        }

        await connectDB();

        const count = await Risk.countDocuments();
        const sample = await Risk.findOne().lean();

        return NextResponse.json({
            status: 'connected',
            database: mongoUri.includes('@') ? mongoUri.split('@')[1].split('/')[0] : 'local',
            riskCount: count,
            sampleRisk: sample ? {
                title: sample.Title,
                hasProjectCode: !!sample.ProjectCode,
                hasRiskStatus: !!sample.RiskStatus,
                fields: Object.keys(sample)
            } : null
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
