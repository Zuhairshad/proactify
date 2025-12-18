import connectDB from '@/lib/mongodb';
import fetch from 'node-fetch';

const GEMINI_EMBEDDING_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set. Please add it to your environment.');
    }

    const clean = text.trim();
    if (!clean) {
        return [];
    }

    const response = await fetch(`${GEMINI_EMBEDDING_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: {
                parts: [{ text: clean }],
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate embedding: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data?.embedding?.values || [];
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Ensure MongoDB is connected before any embedding operations
export async function ensureDb() {
    await connectDB();
}

