import OpenAI from 'openai';
import { loadKnowledgeBase, KBChunk } from './loadKB';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

interface EmbeddedChunk extends KBChunk {
    embedding?: number[];
}

let embeddedKB: EmbeddedChunk[] | null = null;

/**
 * Embeds a single text using OpenAI's text-embedding-3-small
 */
async function embedText(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('❌ Embedding error:', error);
        throw error;
    }
}

/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Embeds the entire knowledge base (done once, cached)
 */
async function embedKnowledgeBase(): Promise<EmbeddedChunk[]> {
    if (embeddedKB) {
        return embeddedKB;
    }

    console.log('🔄 Embedding knowledge base...');
    const kb = loadKnowledgeBase();

    const embedded: EmbeddedChunk[] = [];

    // Batch embedding for efficiency
    const batchSize = 10;
    for (let i = 0; i < kb.length; i += batchSize) {
        const batch = kb.slice(i, i + batchSize);
        const embeddings = await Promise.all(
            batch.map((chunk) => embedText(chunk.text))
        );

        batch.forEach((chunk, idx) => {
            embedded.push({
                ...chunk,
                embedding: embeddings[idx],
            });
        });

        console.log(`✅ Embedded ${Math.min(i + batchSize, kb.length)}/${kb.length} chunks`);
    }

    embeddedKB = embedded;
    return embedded;
}

/**
 * Performs vector similarity search to find relevant KB chunks
 * @param query - User's destination/trip query
 * @param topK - Number of top results to return
 * @returns Top K most relevant chunks with similarity scores
 */
export async function vectorSearch(
    query: string,
    topK: number = 3
): Promise<Array<KBChunk & { score: number }>> {
    try {
        // Embed the query
        const queryEmbedding = await embedText(query);

        // Get embedded KB
        const kb = await embedKnowledgeBase();

        // Calculate similarities
        const results = kb
            .map((chunk) => ({
                ...chunk,
                score: chunk.embedding
                    ? cosineSimilarity(queryEmbedding, chunk.embedding)
                    : 0,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        console.log(
            `🔍 Vector search results for "${query}":`,
            results.map((r) => ({ city: r.city, state: r.state, score: r.score.toFixed(3) }))
        );

        return results;
    } catch (error) {
        console.error('❌ Vector search error:', error);
        throw error;
    }
}

/**
 * Formats retrieved chunks into context for RAG prompting
 */
export function formatContextForRAG(chunks: KBChunk[]): string {
    if (chunks.length === 0) {
        return 'No relevant information found in knowledge base.';
    }

    const contextParts = chunks.map((chunk, idx) => {
        return `
=== Destination ${idx + 1}: ${chunk.city}, ${chunk.state} ===

Budget: ${chunk.metadata.budget}
Total Estimated Budget: ${chunk.metadata.total_estimated_budget}
Climate: ${chunk.metadata.climate}
Foods: ${chunk.metadata.foods}
Travel Tips: ${chunk.metadata.travel_tips}
Local Transport: ${chunk.metadata.local_transport}

Itinerary:
${chunk.data.itinerary
                .map((day, dayIdx) => {
                    return `Day ${dayIdx + 1} (${day.best_time_to_visit_day}):
${day.activities
                            .map(
                                (act) => `  - ${act.place_name}: ${act.place_details}
    Address: ${act.place_address}
    Ticket Pricing: ${act.ticket_pricing}
    Time to Spend: ${act.time_travel_each_location}
    Best Time: ${act.best_time_to_visit}
    Coordinates: ${act.geo_coordinates.latitude}, ${act.geo_coordinates.longitude}`
                            )
                            .join('\n')}`;
                })
                .join('\n\n')}
`;
    });

    return contextParts.join('\n---\n');
}
