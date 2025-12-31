import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const risks = await request.json();

        if (!Array.isArray(risks)) {
            return NextResponse.json(
                { error: 'Request body must be an array of risks' },
                { status: 400 }
            );
        }

        // Insert all risks
        const result = await Risk.insertMany(risks);

        return NextResponse.json({
            success: true,
            imported: result.length,
            message: `Successfully imported ${result.length} risk(s)`
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error bulk importing risks:', error);
        return NextResponse.json(
            { error: 'Failed to bulk import risks', message: error.message },
            { status: 500 }
        );
    }
}
