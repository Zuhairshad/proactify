
'use server';

import connectDB from '@/lib/mongodb';
import Risk from '@/models/Risk';
import Issue from '@/models/Issue';
import Product from '@/models/Product';
import type { RiskIssue, Product as ProductType } from '@/lib/types';
import { isValid, parseISO } from 'date-fns';

// Helper function to safely convert date values to ISO strings
function toSafeISOString(dateValue: any): string | undefined {
    if (!dateValue) {
        return undefined;
    }
    // If it's already a JS Date
    if (dateValue instanceof Date && isValid(dateValue)) {
        return dateValue.toISOString();
    }
    // If it's a string, try to parse it
    if (typeof dateValue === 'string') {
        const parsedDate = parseISO(dateValue);
        if (isValid(parsedDate)) {
            return parsedDate.toISOString();
        }
    }
    // Return undefined for any other invalid type
    return undefined;
}


export async function getProducts(): Promise<ProductType[]> {
    try {
        await connectDB();
        const products = await Product.find({}).lean();
        return products.map(p => ({ ...p, id: p._id.toString(), _id: p._id.toString() } as ProductType));
    } catch (error) {
        console.error("Error fetching 'products' collection:", error);
        return [];
    }
}

export async function getRisksAndIssues(products?: ProductType[]): Promise<RiskIssue[]> {
    const productList = products || await getProducts();

    try {
        await connectDB();

        const [risks, issues] = await Promise.all([
            Risk.find({}).lean(),
            Issue.find({}).lean()
        ]);

        const riskData: RiskIssue[] = risks.map(data => {
            const project = productList.find(p => p.code === data.ProjectCode);

            return {
                ...data,
                id: data._id.toString(),
                _id: data._id.toString(),
                type: 'Risk' as const,
                Title: data.Title || data.Description || 'Untitled Risk',
                Status: data.RiskStatus || 'Open', // Map RiskStatus to Status
                ProjectName: project?.name || data.ProjectCode || 'Unknown',
                ProjectCode: data.ProjectCode,
                DueDate: toSafeISOString(data.DueDate),
            } as unknown as RiskIssue;
        });

        const issueData: RiskIssue[] = issues.map(data => {
            const product = productList.find(p => p.name === data.ProjectName);
            return {
                ...data,
                id: data._id.toString(),
                _id: data._id.toString(),
                type: 'Issue',
                Title: data.Title || 'Untitled Issue',
                // Issues already use 'Status', so this is fine
                Status: data.Status || 'Open',
                ProjectName: data.ProjectName || 'Unknown',
                ProjectCode: product?.code || null,
                DueDate: toSafeISOString(data["Due Date"]),
            } as unknown as RiskIssue;
        });

        const combinedData = [...riskData, ...issueData].sort((a, b) => {
            const dateA = a.DueDate ? new Date(a.DueDate).getTime() : 0;
            const dateB = b.DueDate ? new Date(b.DueDate).getTime() : 0;
            return dateB - dateA; // Sort descending, most recent first
        });

        return combinedData;

    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        // In case of an error (e.g., permissions, connection issues), return an empty array to prevent app crash
        return [];
    }
}
