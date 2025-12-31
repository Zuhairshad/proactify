import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function DELETE() {
    try {
        await connectDB();

        // Delete all test risks
        const result = await Risk.deleteMany({
            Title: {
                $in: [
                    "Schema Test Risk",
                    "FINAL Test - Simple Fields",
                    "Schema Test Risk  - Simple Fields"
                ]
            }
        });

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} test risks`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
