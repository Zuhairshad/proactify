import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';

export async function GET() {
    try {
        await connectDB();
        const issues = await Issue.find({}).sort({ createdAt: -1 }).lean();

        // Convert MongoDB _id to id for consistency
        const formattedIssues = issues.map(issue => ({
            ...issue,
            id: issue._id.toString(),
            _id: issue._id.toString(),
        }));

        return NextResponse.json(formattedIssues);
    } catch (error: any) {
        console.error('Error fetching issues:', error);
        return NextResponse.json(
            { error: 'Failed to fetch issues', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const issue = await Issue.create(body);

        return NextResponse.json({
            ...issue.toObject(),
            id: issue._id.toString(),
            _id: issue._id.toString(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating issue:', error);
        return NextResponse.json(
            { error: 'Failed to create issue', message: error.message },
            { status: 500 }
        );
    }
}
