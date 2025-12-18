import mongoose, { Schema, model, models } from 'mongoose';

export interface IIssue {
    Title: string;
    Discussion?: string;
    Month?: string;
    Category?: string;
    SubCategory?: string;
    Portfolio?: string;
    Resolution?: string;
    'Due Date'?: Date;
    Owner?: string;
    Response?: 'Under Review' | 'In Progress' | 'Closed' | null;
    Impact?: 'Low' | 'Medium' | 'High' | null;
    'Impact ($)'?: number | null;
    Priority: 'Low' | 'Medium' | 'High' | 'Critical' | '(1) High';
    ProjectName: string;
    Status: 'Open' | 'Resolved' | 'Escalated' | 'Closed';
    createdAt?: Date;
    updatedAt?: Date;
}

const IssueSchema = new Schema<IIssue>(
    {
        Title: { type: String, required: true },
        Discussion: { type: String },
        Month: { type: String },
        Category: { type: String },
        SubCategory: { type: String },
        Portfolio: { type: String },
        Resolution: { type: String },
        'Due Date': { type: Date },
        Owner: { type: String },
        Response: {
            type: String,
            enum: ['Under Review', 'In Progress', 'Closed', null],
        },
        Impact: {
            type: String,
            enum: ['Low', 'Medium', 'High', null],
        },
        'Impact ($)': { type: Number },
        Priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical', '(1) High'],
            required: true,
        },
        ProjectName: { type: String, required: true },
        Status: {
            type: String,
            enum: ['Open', 'Resolved', 'Escalated', 'Closed'],
            default: 'Open',
        },
    },
    {
        timestamps: true,
        collection: 'issues',
    }
);

// Prevent model recompilation in development
const Issue = models.Issue || model<IIssue>('Issue', IssueSchema);

export default Issue;
