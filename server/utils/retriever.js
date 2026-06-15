// TF-IDF & Cosine Similarity Semantic Retriever for Node.js
// 100% API-free, local, and CPU-optimized.

const stopWords = new Set([
  'the', 'a', 'an', 'and', 'but', 'if', 'or', 'because', 'as', 'what', 'how', 'when', 'where', 'why', 'who', 'which',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'to', 'for', 'of', 'in',
  'on', 'at', 'by', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'this', 'that',
  'these', 'those', 'am', 'are', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for',
  'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
  'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
]);

const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
};

export class KBRetriever {
  constructor() {
    this.chunks = []; // Array of strings (text segments)
    this.vocab = new Set();
    this.idf = {};
    this.vectors = []; // TF-IDF vectors for each chunk
  }

  buildIndex(text) {
    if (!text || text.trim().length < 10) {
      this.chunks = [];
      this.vocab = new Set();
      this.idf = {};
      this.vectors = [];
      return;
    }

    // Split text into sentences using simple regex
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    // Group sentences into overlapping chunks (~3 sentences with 1 sentence overlap)
    const groupedChunks = [];
    const chunkSize = 3;
    const overlap = 1;

    for (let i = 0; i < sentences.length; i += chunkSize - overlap) {
      const chunkSentences = sentences.slice(i, i + chunkSize);
      const chunkText = chunkSentences.join(' ');
      if (chunkText.length > 20) {
        groupedChunks.push(chunkText);
      }
    }

    this.chunks = groupedChunks;
    if (this.chunks.length === 0) return;

    // Build vocabulary and count document frequency (DF)
    const df = {};
    this.vocab = new Set();

    const chunkTokens = this.chunks.map(chunk => {
      const tokens = tokenize(chunk);
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(token => {
        df[token] = (df[token] || 0) + 1;
        this.vocab.add(token);
      });
      return tokens;
    });

    // Compute Inverse Document Frequency (IDF)
    const N = this.chunks.length;
    this.idf = {};
    this.vocab.forEach(term => {
      this.idf[term] = Math.log(1 + N / (df[term] || 1));
    });

    // Compute TF-IDF vector for each chunk
    this.vectors = this.chunks.map((chunk, index) => {
      const tokens = chunkTokens[index];
      const tf = {};
      tokens.forEach(token => {
        tf[token] = (tf[token] || 0) + 1;
      });

      const vector = {};
      this.vocab.forEach(term => {
        if (tf[term]) {
          vector[term] = (tf[term] / tokens.length) * this.idf[term];
        } else {
          vector[term] = 0;
        }
      });
      return vector;
    });
  }

  search(query, topK = 1) {
    if (this.vectors.length === 0 || !this.chunks.length) {
      return [];
    }

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    // Compute Query TF-IDF vector
    const queryTf = {};
    queryTokens.forEach(token => {
      queryTf[token] = (queryTf[token] || 0) + 1;
    });

    const queryVector = {};
    this.vocab.forEach(term => {
      if (queryTf[term]) {
        queryVector[term] = (queryTf[term] / queryTokens.length) * this.idf[term];
      } else {
        queryVector[term] = 0;
      }
    });

    // Compute cosine similarity for each chunk vector
    const matches = this.vectors.map((vector, index) => {
      let dotProduct = 0;
      let queryNormSq = 0;
      let docNormSq = 0;

      this.vocab.forEach(term => {
        const qVal = queryVector[term] || 0;
        const dVal = vector[term] || 0;
        dotProduct += qVal * dVal;
        queryNormSq += qVal * qVal;
        docNormSq += dVal * dVal;
      });

      const queryNorm = Math.sqrt(queryNormSq);
      const docNorm = Math.sqrt(docNormSq);

      const similarity = (queryNorm === 0 || docNorm === 0) ? 0 : dotProduct / (queryNorm * docNorm);

      return {
        chunk: this.chunks[index],
        score: similarity
      };
    });

    // Filter, sort, and return top K
    return matches
      .filter(match => match.score > 0.05) // similarity threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(match => match.chunk);
  }
}
export default KBRetriever;
