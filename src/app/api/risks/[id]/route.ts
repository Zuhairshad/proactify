import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const risk = await Risk.findById(params.id).lean();

        if (!risk) {
            return NextResponse.json(
                { error: 'Risk not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...risk,
            id: risk._id.toString(),
            _id: risk._id.toString(),
        });
    } catch (error: any) {
        console.error('Error fetching risk:', error);
        return NextResponse.json(
            { error: 'Failed to fetch risk', message: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const body = await request.json();

        const risk = await Risk.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!risk) {
            return NextResponse.json(
                { error: 'Risk not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...risk.toObject(),
            id: risk._id.toString(),
            _id: risk._id.toString(),
        });
    } catch (error: any) {
        console.error('Error updating risk:', error);
        return NextResponse.json(
            { error: 'Failed to update risk', message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const risk = await Risk.findByIdAndDelete(params.id);

        if (!risk) {
            return NextResponse.json(
                { error: 'Risk not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Risk deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting risk:', error);
        return NextResponse.json(
            { error: 'Failed to delete risk', message: error.message },
            { status: 500 }
        );
    }
}
