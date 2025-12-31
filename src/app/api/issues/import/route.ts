import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';

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
        const issues = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const cleanValues = values.map(v => v.replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));

                const issue = {
                    ProjectName: cleanValues[0]?.trim(),
                    Title: cleanValues[1]?.trim(),
                    Discussion: cleanValues[2]?.trim(),
                    Category: cleanValues[3]?.trim(),
                    SubCategory: cleanValues[4]?.trim(),
                    Status: cleanValues[5]?.trim() || 'Open',
                    Priority: cleanValues[6]?.trim(),
                    Impact: cleanValues[7]?.trim(),
                    'Impact ($)': parseFloat(cleanValues[8]) || 0,
                    Response: cleanValues[9]?.trim(),
                    Owner: cleanValues[10]?.trim(),
                    'Due Date': cleanValues[11]?.trim(),
                    Resolution: cleanValues[12]?.trim(),
                    Month: new Date().toISOString().slice(0, 7),
                    createdAt: new Date(),
                };

                // Basic validation
                if (!issue.Title) {
                    errors.push(`Row ${i + 1}: Title is required`);
                    continue;
                }

                issues.push(issue);
            } catch (error) {
                errors.push(`Row ${i + 1}: ${error}`);
            }
        }

        // Insert valid issues
        let inserted = 0;
        if (issues.length > 0) {
            const result = await Issue.insertMany(issues, { ordered: false });
            inserted = result.length;
        }

        return NextResponse.json({
            success: true,
            imported: inserted,
            errors: errors.length > 0 ? errors : undefined,
            message: `Successfully imported ${inserted} issue(s)${errors.length > 0 ? ` with ${errors.length} error(s)` : ''}`
        });

    } catch (error) {
        console.error('Error importing issues:', error);
        return NextResponse.json(
            { error: 'Failed to import issues' },
            { status: 500 }
        );
    }
}
