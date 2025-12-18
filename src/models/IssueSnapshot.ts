import mongoose, { Schema, model, models } from 'mongoose';

export interface IIssueSnapshot {
    issueId: string;             // FK to IssueMaster
    snapshotDate: Date;          // Actual snapshot date
    month: string;               // "2024-12" for monthly aggregation
    biWeekPeriod: string;        // "2024-12-W1" or "2024-12-W2"

    // Issue data snapshot
    status: string;
    priority: string;
    impact?: string;
    impactValue?: number;
    response?: string;
    category?: string;
    subCategory?: string;

    // Tracking
    owner?: string;
    dueDate?: Date;
    resolution?: string;

    // Age tracking
    daysOpen?: number;           // Days between creation and this snapshot

    // Change tracking
    changedFields?: string[];
    previousSnapshotId?: mongoose.Types.ObjectId;

    // Metadata
    capturedBy?: string;         // Auto or Manual
    notes?: string;
}

const IssueSnapshotSchema = new Schema<IIssueSnapshot>({
    issueId: {
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
    priority: { type: String },
    impact: { type: String },
    impactValue: { type: Number },
    response: { type: String },
    category: { type: String },
    subCategory: { type: String },

    owner: { type: String },
    dueDate: { type: Date },
    resolution: { type: String },

    daysOpen: { type: Number },

    changedFields: [{ type: String }],
    previousSnapshotId: { type: Schema.Types.ObjectId },

    capturedBy: { type: String, default: 'Auto' },
    notes: { type: String },
}, {
    timestamps: true,
    collection: 'issue_snapshots'
});

// Compound indexes for efficient querying
IssueSnapshotSchema.index({ issueId: 1, snapshotDate: -1 });
IssueSnapshotSchema.index({ month: 1, issueId: 1 });
IssueSnapshotSchema.index({ biWeekPeriod: 1 });

const IssueSnapshot = models.IssueSnapshot || model<IIssueSnapshot>('IssueSnapshot', IssueSnapshotSchema);

export default IssueSnapshot;
