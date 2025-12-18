import Embedding, { EmbeddingItemType } from '@/models/Embedding';
import Risk from '@/models/Risk';
import Issue from '@/models/Issue';
import { ensureDb, generateEmbedding, cosineSimilarity } from '@/lib/embeddings';

type BaseDoc = Record<string, any> & { _id: any; Description?: string; Discussion?: string; Title?: string };

async function upsertEmbeddingForDoc(doc: BaseDoc, itemType: EmbeddingItemType) {
    const text =
        doc.Description ||
        doc.Discussion ||
        doc.Title ||
        '';

    if (!text) return;

    const embedding = await generateEmbedding(`${doc.Title ?? ''}\n${text}`);

    await Embedding.findOneAndUpdate(
        { itemId: doc._id.toString(), itemType },
        {
            itemId: doc._id.toString(),
            itemType,
            text,
            embedding,
            metadata: {
                title: doc.Title,
                project: doc['Project Code'] || doc.ProjectName,
                status: doc['Risk Status'] || doc.Status,
            },
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
}

export async function ensureEmbeddingsForType(itemType: EmbeddingItemType) {
    await ensureDb();
    const Model = itemType === 'Risk' ? Risk : Issue;
    const docs = await Model.find({}).lean();
    const existing = await Embedding.find({ itemType }).lean();
    const existingIds = new Set(existing.map((e) => e.itemId));

    const toSync = docs.filter((d) => !existingIds.has(d._id.toString()));
    for (const doc of toSync) {
        await upsertEmbeddingForDoc(doc, itemType);
    }
}

export async function upsertEmbeddingForRisk(risk: BaseDoc) {
    await ensureDb();
    await upsertEmbeddingForDoc(risk, 'Risk');
}

export async function upsertEmbeddingForIssue(issue: BaseDoc) {
    await ensureDb();
    await upsertEmbeddingForDoc(issue, 'Issue');
}

export type SimilarMatch = {
    id: string;
    score: number;
    doc: BaseDoc;
};

export async function findSimilarItems(params: {
    itemType: EmbeddingItemType;
    text: string;
    limit?: number;
    minScore?: number;
}): Promise<SimilarMatch[]> {
    const { itemType, text, limit = 5, minScore = 0.5 } = params;
    await ensureDb();
    const [embeddingDocs, queryEmbedding] = await Promise.all([
        Embedding.find({ itemType }).lean(),
        generateEmbedding(text),
    ]);

    const scores = embeddingDocs
        .map((emb) => ({
            id: emb.itemId,
            score: cosineSimilarity(queryEmbedding, emb.embedding),
        }))
        .filter((s) => s.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    if (!scores.length) return [];

    const ids = scores.map((s) => s.id);
    const Model = itemType === 'Risk' ? Risk : Issue;
    const docs = await Model.find({ _id: { $in: ids } }).lean();
    const docMap = new Map(docs.map((d) => [d._id.toString(), d]));

    return scores
        .map((s) => {
            const doc = docMap.get(s.id);
            if (!doc) return null;
            return { id: s.id, score: s.score, doc };
        })
        .filter(Boolean) as SimilarMatch[];
}

