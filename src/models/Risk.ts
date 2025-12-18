import mongoose, { Schema, model, models } from 'mongoose';

export interface IRisk {
    Title: string;
    Description?: string;
    Month?: string;
    'Project Code'?: string;
    'Risk Status': 'Open' | 'Closed' | 'Mitigated' | 'Transferred';
    Probability?: number;
    'Impact Rating (0.05-0.8)'?: number;
    MitigationPlan?: string;
    ContingencyPlan?: string;
    'Impact Value ($)'?: number;
    'Budget Contingency'?: number;
    Owner?: string;
    DueDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const RiskSchema = new Schema<IRisk>(
    {
        Title: { type: String, required: true },
        Description: { type: String },
        Month: { type: String },
        'Project Code': { type: String },
        'Risk Status': {
            type: String,
            enum: ['Open', 'Closed', 'Mitigated', 'Transferred'],
            default: 'Open',
        },
        Probability: { type: Number, min: 0, max: 1 },
        'Impact Rating (0.05-0.8)': { type: Number, min: 0.05, max: 0.8 },
        MitigationPlan: { type: String },
        ContingencyPlan: { type: String },
        'Impact Value ($)': { type: Number },
        'Budget Contingency': { type: Number },
        Owner: { type: String },
        DueDate: { type: Date },
    },
    {
        timestamps: true,
        collection: 'risks',
    }
);

// Prevent model recompilation in development
const Risk = models.Risk || model<IRisk>('Risk', RiskSchema);

export default Risk;
