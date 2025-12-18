import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ensureEmbeddingsForType, findSimilarItems } from '@/services/embedding-service';
import { EmbeddingItemType } from '@/models/Embedding';
import { generateEmbedding } from '@/lib/embeddings';
import Risk from '@/models/Risk';
import Issue from '@/models/Issue';

const MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';

async function generateAnswer(question: string, context: string[]): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set.');
    }

    const prompt = `
You are an analyst. Answer ONLY with information from the provided data chunks.
If the data does not contain an answer, reply exactly: "No matching information found."

User question: ${question}

Data:
${context.map((c, i) => `[${i + 1}] ${c}`).join('\n')}
    `.trim();

    const response = await fetch(`${MODEL_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate answer: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return text.trim();
}

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
        const question: string = body?.question;
        const type: EmbeddingItemType = body?.type === 'Issue' ? 'Issue' : 'Risk';

        if (!question || !question.trim()) {
            return NextResponse.json({ success: false, message: 'Question is required.' }, { status: 400 });
        }

        await ensureEmbeddingsForType(type);
        const matches = await findSimilarItems({ itemType: type, text: question, limit: 8, minScore: 0.35 });

        if (!matches.length) {
            return NextResponse.json({
                success: true,
                analysis: 'No matching information found.',
                tableData: [],
                chartData: null,
            });
        }

        // Build context from matched docs
        const contextStrings = matches.map((m) => {
            const doc = m.doc;
            const base =
                type === 'Risk'
                    ? `Title: ${doc.Title}\nDescription: ${doc.Description}\nStatus: ${doc['Risk Status']}\nProject: ${doc['Project Code']}`
                    : `Title: ${doc.Title}\nDiscussion: ${doc.Discussion}\nStatus: ${doc.Status}\nProject: ${doc.ProjectName}`;
            return `${base}\nSimilarity: ${m.score.toFixed(2)}`;
        });

        const analysis = await generateAnswer(question, contextStrings);

        const tableData =
            type === 'Risk'
                ? matches.map((m) => ({
                      id: m.id,
                      Title: m.doc.Title,
                      Description: m.doc.Description,
                      Status: m.doc['Risk Status'],
                      Project: m.doc['Project Code'],
                      Score: m.score,
                  }))
                : matches.map((m) => ({
                      id: m.id,
                      Title: m.doc.Title,
                      Discussion: m.doc.Discussion,
                      Status: m.doc.Status,
                      Project: m.doc.ProjectName,
                      Score: m.score,
                  }));

        return NextResponse.json({
            success: true,
            analysis,
            tableData,
            chartData: null,
        });
    } catch (error: any) {
        console.error('AI assistant error:', error?.message || error);
        const message = error?.message || 'Unexpected error';
        const status = message?.includes('UNAUTHORIZED') ? 401 : 500;
        return NextResponse.json({ success: false, message }, { status });
    }
}

