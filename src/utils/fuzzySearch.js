/**
 * Fuzzy Search Engine for Thai + English text
 * 
 * Strategy:
 * 1. Tokenize query into individual words/substrings
 * 2. Match each token against all searchable fields + keywords
 * 3. Score results by how many tokens match (relevance scoring)
 * 4. Return results sorted by score (highest first)
 */

// Common Thai words to ignore (stop words) - these are too generic
const STOP_WORDS = new Set(['ที่', 'และ', 'ใน', 'ของ', 'จะ', 'ให้', 'ก็', 'ไป', 'มา', 'ว่า', 'กับ', 'แล้ว', 'จาก', 'ทำ', 'แต่', 'เมื่อ', 'ด้วย', 'ถ้า', 'จน', 'คือ', 'ยัง', 'ทั้ง', 'มี', 'อยู่']);

/**
 * Split a query string into meaningful tokens.
 * For Thai text, we split by spaces and also do sub-token matching.
 */
function tokenize(text) {
  if (!text) return [];
  const lower = text.toLowerCase().trim();
  
  // Split by spaces first
  const spacedTokens = lower.split(/\s+/).filter(t => t.length > 0);
  
  // For Thai text without spaces, also try to break into smaller parts
  const allTokens = [];
  for (const token of spacedTokens) {
    if (!STOP_WORDS.has(token) && token.length > 0) {
      allTokens.push(token);
    }
  }
  
  return allTokens;
}

/**
 * Calculate how well a single token matches against a text string.
 * Returns a score: 0 = no match, 1 = partial, 2 = exact substring
 */
function tokenMatchScore(token, text) {
  if (!text || !token) return 0;
  const lowerText = text.toLowerCase();
  
  // Exact substring match
  if (lowerText.includes(token)) return 2;
  
  // Check if the token shares significant common substrings with any word in text
  // This handles cases like "เร่งไม่ได้" matching "เร่งไม่ขึ้น"
  // by checking if individual characters/substrings overlap
  if (token.length >= 2) {
    // Try matching overlapping 2-char substrings
    let subMatches = 0;
    const subLen = Math.min(3, token.length);
    for (let i = 0; i <= token.length - subLen; i++) {
      const sub = token.substring(i, i + subLen);
      if (lowerText.includes(sub)) {
        subMatches++;
      }
    }
    // If more than half of the substrings match, it's a partial match
    const totalSubs = token.length - subLen + 1;
    if (totalSubs > 0 && subMatches / totalSubs >= 0.5) {
      return 1;
    }
  }
  
  return 0;
}

/**
 * Score how well a query matches a single item.
 * Searches across multiple fields and the keywords array.
 */
function scoreItem(queryTokens, item, searchFields, keywordField = 'keywords') {
  let totalScore = 0;
  let matchedTokens = 0;
  
  for (const token of queryTokens) {
    let bestTokenScore = 0;
    
    // Check each search field
    for (const field of searchFields) {
      const value = item[field];
      if (!value) continue;
      
      if (Array.isArray(value)) {
        // For array fields (like brands)
        for (const v of value) {
          const s = tokenMatchScore(token, v);
          bestTokenScore = Math.max(bestTokenScore, s);
        }
      } else {
        const s = tokenMatchScore(token, String(value));
        bestTokenScore = Math.max(bestTokenScore, s);
      }
    }
    
    // Check keywords (higher weight for keyword matches)
    if (item[keywordField] && Array.isArray(item[keywordField])) {
      for (const kw of item[keywordField]) {
        const s = tokenMatchScore(token, kw);
        // Keywords get a bonus because they're curated synonyms
        bestTokenScore = Math.max(bestTokenScore, s * 1.5);
      }
    }
    
    if (bestTokenScore > 0) {
      matchedTokens++;
    }
    totalScore += bestTokenScore;
  }
  
  // Bonus for matching ALL query tokens (full relevance)
  if (queryTokens.length > 0 && matchedTokens === queryTokens.length) {
    totalScore *= 1.5;
  }
  
  // Ratio of matched tokens
  const coverage = queryTokens.length > 0 ? matchedTokens / queryTokens.length : 0;
  
  return { score: totalScore, coverage, matchedTokens };
}

/**
 * Main search function. Returns scored results above a minimum threshold.
 */
export function fuzzySearch(query, items, searchFields, options = {}) {
  const { minCoverage = 0.3, keywordField = 'keywords' } = options;
  
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  
  const scored = items.map(item => {
    const { score, coverage, matchedTokens } = scoreItem(queryTokens, item, searchFields, keywordField);
    return { item, score, coverage, matchedTokens };
  });
  
  return scored
    .filter(r => r.coverage >= minCoverage && r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Search symptoms specifically
 */
export function searchSymptoms(query, symptoms) {
  return fuzzySearch(query, symptoms, ['code', 'symptom', 'category', 'solution', 'brands'], {
    minCoverage: 0.3,
    keywordField: 'keywords'
  });
}

/**
 * Search parts specifically  
 */
export function searchParts(query, parts) {
  return fuzzySearch(query, parts, ['name', 'location', 'notes'], {
    minCoverage: 0.3,
    keywordField: 'keywords'
  });
}
