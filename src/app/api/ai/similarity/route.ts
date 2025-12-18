import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ensureEmbeddingsForType, findSimilarItems } from '@/services/embedding-service';
import { EmbeddingItemType } from '@/models/Embedding';

export async function POST(req: Request) {
    try {
        // Middleware already protects this route, but verify auth
        const userId = await requireAuth();
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'UNAUTHORIZED: You must be signed in to use AI features.' },
                { status: 401 }
            );
        }
        
        const body = await req.json();
        const description: string = body?.description;
        const type: EmbeddingItemType = body?.type === 'Issue' ? 'Issue' : 'Risk';

        if (!description || description.trim().length < 8) {
            return NextResponse.json({ success: false, message: 'Description is required.' }, { status: 400 });
        }

        await ensureEmbeddingsForType(type);
        const matches = await findSimilarItems({
            itemType: type,
            text: description,
            limit: 5,
            minScore: 0.3,
        });

        if (!matches.length) {
            return NextResponse.json({
                success: true,
                message: 'No matching information found.',
                similar: [],
            });
        }

        const similar = matches.map((m) => ({
            id: m.id,
            score: m.score,
            item:
                type === 'Risk'
                    ? {
                          title: m.doc.Title,
                          description: m.doc.Description,
                          mitigationPlan: m.doc.MitigationPlan,
                          contingencyPlan: m.doc.ContingencyPlan,
                          probability: m.doc.Probability,
                          impactRating: m.doc['Impact Rating (0.05-0.8)'],
                          project: m.doc['Project Code'],
                          status: m.doc['Risk Status'],
                      }
                    : {
                          title: m.doc.Title,
                          discussion: m.doc.Discussion,
                          resolution: m.doc.Resolution,
                          project: m.doc.ProjectName,
                          status: m.doc.Status,
                          priority: m.doc.Priority,
                      },
        }));

        return NextResponse.json({ success: true, similar });
    } catch (error: any) {
        console.error('Similarity route error:', error?.message || error);
        const message = error?.message || 'Unexpected error';
        const status = message?.includes('UNAUTHORIZED') ? 401 : 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}

