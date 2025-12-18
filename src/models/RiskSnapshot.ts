import mongoose, { Schema, model, models } from 'mongoose';

export interface IRiskSnapshot {
    riskId: string;              // FK to RiskMaster
    snapshotDate: Date;          // Actual snapshot date
    month: string;               // "2024-12" for monthly aggregation
    biWeekPeriod: string;        // "2024-12-W1" or "2024-12-W2" 

    // Risk data snapshot
    status: string;
    probability?: number;
    impactRating?: number;        // Impact Rating (0.05-0.8)
    impactValue?: number;         // Impact Value ($)
    emv?: number;                 // Calculated: probability * impactValue
    budgetContingency?: number;
    riskScore?: number;           // Calculated: probability * impactRating

    // Additional tracking
    owner?: string;
    dueDate?: Date;
    mitigationPlan?: string;
    contingencyPlan?: string;

    // Change tracking
    changedFields?: string[];
    previousSnapshotId?: mongoose.Types.ObjectId;

    // Metadata
    capturedBy?: string;          // Auto or Manual
    notes?: string;
}

const RiskSnapshotSchema = new Schema<IRiskSnapshot>({
    riskId: {
        type: String,
        required: true,
        index: true
    },
    snapshotDate: {
        type: Date,
        required: true,
        index: true
    },
    month: {
        type: String,
        required: true,
        index: true
    },
    biWeekPeriod: {
        type: String,
        required: true,
        index: true
    },

    // Data fields
    status: { type: String },
    probability: { type: Number },
    impactRating: { type: Number },
    impactValue: { type: Number },
    emv: { type: Number },
    budgetContingency: { type: Number },
    riskScore: { type: Number },

    owner: { type: String },
    dueDate: { type: Date },
    mitigationPlan: { type: String },
    contingencyPlan: { type: String },

    changedFields: [{ type: String }],
    previousSnapshotId: { type: Schema.Types.ObjectId },

    capturedBy: { type: String, default: 'Auto' },
    notes: { type: String },
}, {
    timestamps: true,
    collection: 'risk_snapshots'
});

// Compound indexes for efficient querying
RiskSnapshotSchema.index({ riskId: 1, snapshotDate: -1 });
RiskSnapshotSchema.index({ month: 1, riskId: 1 });
RiskSnapshotSchema.index({ biWeekPeriod: 1 });

const RiskSnapshot = models.RiskSnapshot || model<IRiskSnapshot>('RiskSnapshot', RiskSnapshotSchema);

export default RiskSnapshot;
