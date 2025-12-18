import mongoose, { Schema, model, models } from 'mongoose';

export interface IRiskMaster {
    riskId: string;              // Format: "{ProjectCode}-R{number}" e.g., "PROJ001-R001"
    projectCode: string;
    title: string;
    description?: string;
    type: 'Risk' | 'Issue';
    createdAt: Date;
    createdBy?: string;
    isActive: boolean;

    // Current state (denormalized for quick access)
    currentStatus: string;
    currentEMV?: number;
    currentRiskScore?: number;
    currentProbability?: number;
    currentImpactValue?: number;
}

const RiskMasterSchema = new Schema<IRiskMaster>({
    riskId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        // Format: ProjectCode-R### (e.g., "PROJ001-R001")
    },
    projectCode: {
        type: String,
        required: true,
        index: true
    },
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['Risk', 'Issue'],
        default: 'Risk',
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String },
    isActive: { type: Boolean, default: true },

    // Current state
    currentStatus: { type: String },
    currentEMV: { type: Number },
    currentRiskScore: { type: Number },
    currentProbability: { type: Number },
    currentImpactValue: { type: Number },
}, {
    timestamps: true,
    collection: 'risk_masters'
});

// Index for efficient project queries
RiskMasterSchema.index({ projectCode: 1, isActive: 1 });

const RiskMaster = models.RiskMaster || model<IRiskMaster>('RiskMaster', RiskMasterSchema);

export default RiskMaster;
