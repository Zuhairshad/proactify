import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';

export async function GET() {
    try {
        await connectDB();

        // Fetch all issues
        const issues = await Issue.find({}).lean();

        // Convert to CSV format
        const headers = [
            'Project Name',
            'Title',
            'Discussion',
            'Category',
            'Sub Category',
            'Status',
            'Priority',
            'Impact',
            'Impact ($)',
            'Response',
            'Owner',
            'Due Date',
            'Resolution'
        ].join(',');

        const rows = issues.map(issue => [
            issue.ProjectName || '',
            `"${(issue.Title || '').replace(/"/g, '""')}"`,
            `"${(issue.Discussion || '').replace(/"/g, '""')}"`,
            issue.Category || '',
            issue.SubCategory || '',
            issue.Status || '',
            issue.Priority || '',
            issue.Impact || '',
            issue['Impact ($)'] || '',
            issue.Response || '',
            issue.Owner || '',
            issue['Due Date'] || '',
            `"${(issue.Resolution || '').replace(/"/g, '""')}"`,
        ].join(','));

        const csv = [headers, ...rows].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="issues_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Error exporting issues:', error);
        return NextResponse.json(
            { error: 'Failed to export issues' },
            { status: 500 }
        );
    }
}
