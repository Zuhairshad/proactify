import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const issue = await Issue.findById(params.id).lean();

        if (!issue) {
            return NextResponse.json(
                { error: 'Issue not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...issue,
            id: issue._id.toString(),
            _id: issue._id.toString(),
        });
    } catch (error: any) {
        console.error('Error fetching issue:', error);
        return NextResponse.json(
            { error: 'Failed to fetch issue', message: error.message },
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

        const issue = await Issue.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!issue) {
            return NextResponse.json(
                { error: 'Issue not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...issue.toObject(),
            id: issue._id.toString(),
            _id: issue._id.toString(),
        });
    } catch (error: any) {
        console.error('Error updating issue:', error);
        return NextResponse.json(
            { error: 'Failed to update issue', message: error.message },
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
        const issue = await Issue.findByIdAndDelete(params.id);

        if (!issue) {
            return NextResponse.json(
                { error: 'Issue not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Issue deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting issue:', error);
        return NextResponse.json(
            { error: 'Failed to delete issue', message: error.message },
            { status: 500 }
        );
    }
}
