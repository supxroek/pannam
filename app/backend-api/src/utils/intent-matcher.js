// src/utils/intent-matcher.js

// ============================================================
// คำช่วยที่ไม่มีความหมาย (Stop Words) สำหรับภาษาไทยและอังกฤษ
// ============================================================
const STOP_WORDS = new Set([
  // ภาษาไทย
  "ค่ะ",
  "ครับ",
  "นะ",
  "จ้า",
  "จ๊ะ",
  "เถอะ",
  "เลย",
  "หน่อย",
  "นะคะ",
  "นะครับ",
  "คับ",
  "ค่า",
  "จร้า",
  "เจ้า",
  "เนอะ",
  // ภาษาอังกฤษ
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "can",
  "could",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "and",
  "but",
  "if",
  "or",
  "because",
  "until",
  "while",
  "this",
  "that",
  "these",
  "those",
]);

// ============================================================
// คำที่บ่งบอกว่าเป็นคำถาม (Question Indicators)
// ============================================================
const QUESTION_INDICATORS = new Set([
  "ถาม",
  "อยากรู้",
  "สงสัย",
  "?",
  "หรือเปล่า",
  "ยังไง",
  "อย่างไร",
  "เท่าไร",
  "เท่าไหร่",
  "กี่",
  "อะไร",
  "ใคร",
  "ที่ไหน",
  "เมื่อไหร่",
  "ทำไม",
  "how",
  "what",
  "who",
  "where",
  "when",
  "why",
  "which",
]);

// ============================================================
// Utility: แยกคำจากข้อความ (Simple Tokenizer)
// ============================================================
function tokenize(text) {
  if (!text) return [];

  // แปลงเป็นพิมพ์เล็กและลบอักขระพิเศษ
  let cleaned = text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, " ") // เก็บไทย+อังกฤษ+ตัวเลข
    .replace(/\s+/g, " ")
    .trim();

  // แยกคำ (รองรับทั้งภาษาไทยที่ไม่มีช่องว่างและภาษาอังกฤษ)
  // สำหรับภาษาไทย: ใช้ pattern ที่แยกคำไทยออกจากกัน
  const tokens = [];
  const words = cleaned.split(" ");

  for (const word of words) {
    if (!word) continue;

    // ถ้าเป็นคำไทยยาวๆ อาจต้องแยกเพิ่ม (simplified)
    // ใน production ควรใช้ library ตัดคำไทย เช่น wordcut หรือ newmm
    tokens.push(word);

    // แยกคำไทยที่ติดกันโดยใช้ heuristic (เช่น สวัสดีวันนี้ → สวัสดี, วันนี้)
    // ตัวอย่างง่าย: ถ้าพบ keyword ย่อยในคำยาว ให้แยกออกมา
    if (/[\u0E00-\u0E7F]/.test(word) && word.length > 3) {
      // ตรวจหาคำย่อยที่อาจเป็น keyword (เช่น สวัสดี, ดีจ้า)
      const subKeywords = [
        "สวัสดี",
        "หวัดดี",
        "ดีจ้า",
        "ดีครับ",
        "ดีค่ะ",
        "สบาย",
        "เป็นไง",
      ];
      for (const kw of subKeywords) {
        if (word.includes(kw) && !tokens.includes(kw)) {
          tokens.push(kw);
        }
      }
    }
  }

  return tokens;
}

// ============================================================
// Utility: ลบคำที่ไม่มีความหมายออก
// ============================================================
function removeStopWords(tokens) {
  return tokens.filter((token) => !STOP_WORDS.has(token));
}

// ============================================================
// Utility: คำนวณคะแนนความใกล้เคียง (Levenshtein Distance)
// ============================================================
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // แทนที่
          dp[i][j - 1] + 1, // เพิ่ม
          dp[i - 1][j] + 1, // ลบ
        );
      }
    }
  }
  return dp[m][n];
}

// คำนวณความคล้ายคลึง (0-1) โดยที่ 1 = ตรงกันเป๊ะ
function similarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

// ============================================================
// Smart Intent Matcher Class
// ============================================================
class SmartIntentMatcher {
  constructor() {
    this.intents = new Map();
    this.fuzzyThreshold = 0.7; // เกณฑ์ความคล้ายคลึงขั้นต่ำ (70%)
    this.minTokenMatch = 1; // จำนวน token ที่ต้องตรงกันขั้นต่ำ
  }

  /**
   * ลงทะเบียน Intent พร้อมรูปแบบที่หลากหลาย
   * @param {string} name - ชื่อ Intent
   * @param {Object} config - การตั้งค่า
   */
  register(name, config) {
    this.intents.set(name, {
      name,
      // คำหลักที่ต้องมี (required keywords)
      keywords: config.keywords || [],
      // คำที่อาจมีเพิ่มเติม (optional keywords) - ช่วยเพิ่มคะแนน
      optionalKeywords: config.optionalKeywords || [],
      // คำที่ห้ามมี (negative keywords) - ถ้ามีจะลดคะแนนหรือ reject
      negativeKeywords: config.negativeKeywords || [],
      // รูปแบบ regex ที่ซับซ้อน (ถ้ามี)
      patterns: config.patterns || [],
      // น้ำหนักของ intent (priority)
      weight: config.weight || 1,
      // ฟังก์ชันที่จะ execute เมื่อตรง
      execute: config.execute,
      // ต้องการให้เป็นคำถามหรือไม่ (null = ไม่สนใจ, true = ต้องเป็นคำถาม, false = ต้องไม่เป็นคำถาม)
      requireQuestion: config.requireQuestion ?? null,
      // ข้อความตอบกลับ (ถ้าไม่มี execute)
      response: config.response || null,
      // คำอธิบายสำหรับ debug
      description: config.description || "",
    });
  }

  /**
   * วิเคราะห์ข้อความและหา Intent ที่ตรงที่สุด
   * @param {string} text - ข้อความจากผู้ใช้
   * @returns {Object|null} - ผลลัพธ์ที่ดีที่สุด
   */
  match(text) {
    if (!text || typeof text !== "string") return null;

    const tokens = tokenize(text);
    const filteredTokens = removeStopWords(tokens);
    const isQuestion = this._detectQuestion(text, tokens);

    let bestMatch = null;
    let bestScore = 0;
    const allResults = [];

    for (const intent of this.intents.values()) {
      const result = this._calculateScore(
        intent,
        text,
        tokens,
        filteredTokens,
        isQuestion,
      );

      if (result.score > 0) {
        allResults.push(result);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMatch = result;
        }
      }
    }

    // เรียงลำดับตามคะแนน
    allResults.sort((a, b) => b.score - a.score);

    return bestMatch
      ? {
          intent: bestMatch.intent,
          score: bestMatch.score,
          matchedKeywords: bestMatch.matchedKeywords,
          isQuestion,
          allMatches: allResults.slice(0, 3), // ส่ง top 3 กลับไปด้วย
          originalText: text,
        }
      : null;
  }

  /**
   * ตรวจสอบว่าเป็นคำถามหรือไม่
   */
  _detectQuestion(text, tokens) {
    // เช็คเครื่องหมายคำถาม
    if (text.includes("?") || text.includes("？")) return true;

    // เช็คคำบ่งบอกคำถาม
    return tokens.some((token) => QUESTION_INDICATORS.has(token));
  }

  /**
   * คำนวณคะแนนสำหรับแต่ละ Intent
   */
  _calculateScore(intent, originalText, tokens, filteredTokens, isQuestion) {
    let score = 0;
    const matchedKeywords = [];
    const matchedDetails = [];

    // 1. ตรวจสอบ negative keywords (ถ้ามี = reject ทันที)
    for (const neg of intent.negativeKeywords) {
      const negTokens = tokenize(neg);
      for (const nt of negTokens) {
        if (tokens.some((t) => t.includes(nt) || similarity(t, nt) > 0.85)) {
          return {
            intent,
            score: 0,
            matchedKeywords: [],
            reason: "negative_keyword_match",
          };
        }
      }
    }

    // 2. ตรวจสอบ requireQuestion
    if (intent.requireQuestion === true && !isQuestion) {
      return { intent, score: 0, matchedKeywords: [], reason: "not_question" };
    }
    if (intent.requireQuestion === false && isQuestion) {
      return { intent, score: 0, matchedKeywords: [], reason: "is_question" };
    }

    // 3. ตรวจสอบ required keywords (exact + fuzzy matching)
    let requiredMatches = 0;
    for (const keyword of intent.keywords) {
      const keywordTokens = tokenize(keyword);

      for (const kt of keywordTokens) {
        let bestTokenScore = 0;
        let bestMatchToken = null;

        for (const token of tokens) {
          // Exact match
          if (token === kt) {
            bestTokenScore = 1;
            bestMatchToken = token;
            break;
          }

          // Partial match (substring)
          if (token.includes(kt) || kt.includes(token)) {
            const ratio =
              Math.min(token.length, kt.length) /
              Math.max(token.length, kt.length);
            if (ratio > bestTokenScore) {
              bestTokenScore = ratio;
              bestMatchToken = token;
            }
          }

          // Fuzzy match (Levenshtein)
          const sim = similarity(token, kt);
          if (sim > this.fuzzyThreshold && sim > bestTokenScore) {
            bestTokenScore = sim;
            bestMatchToken = token;
          }
        }

        if (bestTokenScore > 0) {
          requiredMatches++;
          score += bestTokenScore * 10; // น้ำหนักสูงสำหรับ required
          matchedKeywords.push({
            keyword: kt,
            matched: bestMatchToken,
            score: bestTokenScore,
            type: "required",
          });
        }
      }
    }

    // ถ้า required keywords ไม่ตรงเลย = reject
    if (intent.keywords.length > 0 && requiredMatches === 0) {
      return {
        intent,
        score: 0,
        matchedKeywords: [],
        reason: "no_required_match",
      };
    }

    // 4. ตรวจสอบ optional keywords (เพิ่มคะแนน)
    for (const keyword of intent.optionalKeywords) {
      const keywordTokens = tokenize(keyword);

      for (const kt of keywordTokens) {
        for (const token of tokens) {
          let matchScore = 0;
          if (token === kt) matchScore = 1;
          else if (token.includes(kt) || kt.includes(token)) {
            matchScore =
              Math.min(token.length, kt.length) /
              Math.max(token.length, kt.length);
          } else {
            const sim = similarity(token, kt);
            if (sim > this.fuzzyThreshold) matchScore = sim;
          }

          if (matchScore > 0) {
            score += matchScore * 3; // น้ำหนักน้อยกว่า required
            matchedKeywords.push({
              keyword: kt,
              matched: token,
              score: matchScore,
              type: "optional",
            });
          }
        }
      }
    }

    // 5. ตรวจสอบ regex patterns
    for (const pattern of intent.patterns) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(originalText)) {
        score += 8; // น้ำหนักสูงสำหรับ pattern match
        matchedKeywords.push({ pattern, type: "regex" });
      }
    }

    // 6. โบนัสถ้าเป็นคำถามและ intent ต้องการคำถาม
    if (intent.requireQuestion === true && isQuestion) {
      score += 2;
    }

    // 7. ปรับคะแนนตามน้ำหนัก intent
    score *= intent.weight;

    // 8. ปกติคะแนน (normalize) ตามจำนวน token
    const normalizationFactor = Math.log(tokens.length + 1) + 1;
    score = score / normalizationFactor;

    return {
      intent,
      score: Math.min(score, 100), // cap ที่ 100
      matchedKeywords,
      requiredMatches,
      totalRequired: intent.keywords.length,
    };
  }

  /**
   * หา multiple intents ในประโยคเดียว
   */
  matchMultiple(text, threshold = 15) {
    const tokens = tokenize(text);
    const filteredTokens = removeStopWords(tokens);
    const isQuestion = this._detectQuestion(text, tokens);

    const results = [];

    for (const intent of this.intents.values()) {
      const result = this._calculateScore(
        intent,
        text,
        tokens,
        filteredTokens,
        isQuestion,
      );
      if (result.score >= threshold) {
        results.push(result);
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}

// ============================================================
// Export Singleton
// ============================================================
export default new SmartIntentMatcher();
