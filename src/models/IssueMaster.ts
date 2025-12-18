import mongoose, { Schema, model, models } from 'mongoose';

export interface IIssueMaster {
    issueId: string;             // Format: "{ProjectCode}-I{number}" e.g., "PROJ001-I001"
    projectCode: string;
    title: string;
    discussion?: string;
    type: 'Issue';
    category?: string;
    subCategory?: string;
    createdAt: Date;
    createdBy?: string;
    isActive: boolean;

    // Current state (denormalized for quick access)
    currentStatus: string;
    currentPriority: string;
    currentImpact?: string;
    currentImpactValue?: number;
    currentResponse?: string;
}

const IssueMasterSchema = new Schema<IIssueMaster>({
    issueId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        // Format: ProjectCode-I### (e.g., "PROJ001-I001")
    },
    projectCode: {
        type: String,
        required: true,
        index: true
    },
    title: { type: String, required: true },
    discussion: { type: String },
    type: {
        type: String,
        default: 'Issue',
        required: true
    },
    category: { type: String },
    subCategory: { type: String },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String },
    isActive: { type: Boolean, default: true },

    // Current state
    currentStatus: { type: String },
    currentPriority: { type: String },
    currentImpact: { type: String },
    currentImpactValue: { type: Number },
    currentResponse: { type: String },
}, {
    timestamps: true,
    collection: 'issue_masters'
});

// Index for efficient project queries
IssueMasterSchema.index({ projectCode: 1, isActive: 1 });

const IssueMaster = models.IssueMaster || model<IIssueMaster>('IssueMaster', IssueMasterSchema);

export default IssueMaster;
