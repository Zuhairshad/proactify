import mongoose, { Schema, model, models } from 'mongoose';

export type EmbeddingItemType = 'Risk' | 'Issue';

export interface IEmbedding {
    itemId: string;
    itemType: EmbeddingItemType;
    text: string;
    embedding: number[];
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

const EmbeddingSchema = new Schema<IEmbedding>(
    {
        itemId: { type: String, required: true, index: true },
        itemType: { type: String, enum: ['Risk', 'Issue'], required: true, index: true },
        text: { type: String, required: true },
        embedding: { type: [Number], required: true },
        metadata: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true,
        collection: 'embeddings',
    }
);

EmbeddingSchema.index({ itemId: 1, itemType: 1 }, { unique: true });

const Embedding = models.Embedding || model<IEmbedding>('Embedding', EmbeddingSchema);

export default Embedding;

