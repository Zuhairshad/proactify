import mongoose, { Schema, model, models } from 'mongoose';

export interface IRisk {
    Title: string;
    Description?: string;
    Month?: string;
}

// Very minimal schema - let MongoDB save everything
const RiskSchema = new Schema(
    {
        Title: { type: String, required: true },
    },
    {
        timestamps: true,
        collection: 'risks',
        strict: false, // Allow ANY field
        strictQuery: false,
    }
);

// Prevent model recompilation
const Risk = models.Risk || model('Risk', RiskSchema);

export default Risk;
