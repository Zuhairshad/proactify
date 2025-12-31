import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Read file content
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return NextResponse.json(
                { error: 'File is empty or invalid' },
                { status: 400 }
            );
        }

        // Parse CSV
        const headers = lines[0].split(',');
        const risks = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const cleanValues = values.map(v => v.replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));

                const risk = {
                    'Project Code': cleanValues[0]?.trim(),
                    Title: cleanValues[1]?.trim(),
                    Description: cleanValues[2]?.trim(),
                    'Risk Status': cleanValues[3]?.trim() || 'Open',
                    Probability: parseFloat(cleanValues[4]) || 0,
                    'Impact Rating (0.05-0.8)': parseFloat(cleanValues[5]) || 0,
                    'Impact Value ($)': parseFloat(cleanValues[6]) || 0,
                    'Budget Contingency': parseFloat(cleanValues[7]) || 0,
                    Owner: cleanValues[8]?.trim(),
                    DueDate: cleanValues[9]?.trim(),
                    MitigationPlan: cleanValues[10]?.trim(),
                    ContingencyPlan: cleanValues[11]?.trim(),
                    Month: new Date().toISOString().slice(0, 7),
                    createdAt: new Date(),
                };

                // Basic validation
                if (!risk.Title) {
                    errors.push(`Row ${i + 1}: Title is required`);
                    continue;
                }

                risks.push(risk);
            } catch (error) {
                errors.push(`Row ${i + 1}: ${error}`);
            }
        }

        // Insert valid risks
        let inserted = 0;
        if (risks.length > 0) {
            const result = await Risk.insertMany(risks, { ordered: false });
            inserted = result.length;
        }

        return NextResponse.json({
            success: true,
            imported: inserted,
            errors: errors.length > 0 ? errors : undefined,
            message: `Successfully imported ${inserted} risk(s)${errors.length > 0 ? ` with ${errors.length} error(s)` : ''}`
        });

    } catch (error) {
        console.error('Error importing risks:', error);
        return NextResponse.json(
            { error: 'Failed to import risks' },
            { status: 500 }
        );
    }
}
