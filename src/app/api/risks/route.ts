import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function GET() {
    try {
        await connectDB();
        const risks = await Risk.find({}).sort({ createdAt: -1 }).lean();

        // Convert MongoDB _id to id for consistency
        const formattedRisks = risks.map(risk => ({
            ...risk,
            id: risk._id.toString(),
            _id: risk._id.toString(),
        }));

        return NextResponse.json(formattedRisks);
    } catch (error: any) {
        console.error('Error fetching risks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch risks', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const risk = await Risk.create(body);

        return NextResponse.json({
            ...risk.toObject(),
            id: risk._id.toString(),
            _id: risk._id.toString(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating risk:', error);
        return NextResponse.json(
            { error: 'Failed to create risk', message: error.message },
            { status: 500 }
        );
    }
}
