import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function GET() {
    try {
        await connectDB();

        // Fetch all risks
        const risks = await Risk.find({}).lean();

        // Convert to CSV format
        const headers = [
            'Project Code',
            'Title',
            'Description',
            'Risk Status',
            'Probability',
            'Impact Rating (0.05-0.8)',
            'Impact Value ($)',
            'Budget Contingency',
            'Owner',
            'Due Date',
            'Mitigation Plan',
            'Contingency Plan'
        ].join(',');

        const rows = risks.map(risk => [
            risk['Project Code'] || '',
            `"${(risk.Title || '').replace(/"/g, '""')}"`,
            `"${(risk.Description || '').replace(/"/g, '""')}"`,
            risk['Risk Status'] || '',
            risk.Probability || '',
            risk['Impact Rating (0.05-0.8)'] || '',
            risk['Impact Value ($)'] || '',
            risk['Budget Contingency'] || '',
            risk.Owner || '',
            risk.DueDate || '',
            `"${(risk.MitigationPlan || '').replace(/"/g, '""')}"`,
            `"${(risk.ContingencyPlan || '').replace(/"/g, '""')}"`,
        ].join(','));

        const csv = [headers, ...rows].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="risks_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Error exporting risks:', error);
        return NextResponse.json(
            { error: 'Failed to export risks' },
            { status: 500 }
        );
    }
}
