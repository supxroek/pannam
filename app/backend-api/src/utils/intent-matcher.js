// src/utils/intent-matcher.js

// ============================================================
// Stop Words
// ============================================================
const STOP_WORDS = new Set([
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
// คำบ่งบอกคำถาม
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
// 🔧 คลังคำหลักสำหรับภาษาไทย (ใช้แยกคำจากประโยคติดกัน)
// ============================================================
const THAI_KEYWORD_DICTIONARY = [
  // ลงทะเบียน
  "ลงทะเบียน",
  "ลงทะเบียนเรียบร้อย",
  "ลงทะเบียนสำเร็จ",
  "สมัครสมาชิก",
  "สมัครสมาชิกสำเร็จ",
  "สมัครเรียบร้อย",
  // ทักทาย
  "สวัสดี",
  "หวัดดี",
  "ดีจ้า",
  "ดีครับ",
  "ดีค่ะ",
  "สบายดี",
  "เป็นไง",
  "ยังไง",
  "hello",
  "hi",
  "hey",
  "morning",
  "afternoon",
  "evening",
  // ค่าน้ำ
  "ค่าน้ำ",
  "บิลน้ำ",
  "น้ำประปา",
  "water bill",
  "ค้างชำระ",
  "ยอดค้าง",
  // ช่วยเหลือ
  "ช่วยเหลือ",
  "ช่วย",
  "help",
  "สอน",
  "วิธี",
  "ใช้ยังไง",
  "ทำยังไง",
  "คู่มือ",
  "guide",
  "tutorial",
  // ร้องเรียน
  "ร้องเรียน",
  "แจ้งปัญหา",
  "เสีย",
  "พัง",
  "น้ำไม่ไหล",
  "น้ำรั่ว",
  "ท่อแตก",
  "ปัญหา",
  "problem",
  "issue",
  "complaint",
  // ขอบคุณ
  "ขอบคุณ",
  "thank",
  "thanks",
  "ขอบใจ",
  "เก่งมาก",
  "ดีมาก",
  // ลาก่อน
  "ลาก่อน",
  "บาย",
  "bye",
  "goodbye",
  "ไปก่อน",
  "พักผ่อน",
  "see you",
  // ทั่วไป
  "ตรวจสอบ",
  "เช็ค",
  "ดู",
  "ถาม",
  "เท่าไร",
  "ยอด",
  "ค้าง",
  "จ่าย",
  "ชำระ",
  "ประวัติ",
  "ติดต่อ",
  "เจ้าหน้าที่",
  "วันนี้",
  "ตอนนี้",
  "เดือนนี้",
  "บ้าน",
  "ที่อยู่",
  "หมายเลข",
  "ผู้ใช้น้ำ",
  "รหัส",
];

// ============================================================
// 🔧 แยกคำจากข้อความ (ปรับปรุงให้รองรับภาษาไทยที่ติดกัน)
// ============================================================
function tokenize(text) {
  if (!text) return [];

  // แปลงเป็นพิมพ์เล็ก
  let cleaned = text.toLowerCase().trim();

  // เก็บข้อความต้นฉบับไว้ใช้ตรวจหลัง
  const original = cleaned;

  // ลบอักขระพิเศษ แต่เก็บช่องว่างและอักษรไทย/อังกฤษ/ตัวเลข
  cleaned = cleaned.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  const tokens = [];

  // ----- วิธีที่ 1: แยกตามช่องว่าง (สำหรับภาษาอังกฤษ) -----
  const spaceWords = cleaned.split(" ").filter((w) => w.length > 0);
  tokens.push(...spaceWords);

  // ----- วิธีที่ 2: แยกคำไทยจากพจนานุกรม (สำคัญมาก!) -----
  // ใช้ dictionary สแกนหาคำในข้อความต้นฉบับ
  const foundKeywords = new Set();

  for (const keyword of THAI_KEYWORD_DICTIONARY) {
    const kwLower = keyword.toLowerCase();

    // Exact match ในข้อความทั้งหมด
    if (original.includes(kwLower)) {
      foundKeywords.add(kwLower);
      continue;
    }

    // Fuzzy match แบบง่าย (สำหรับคำที่พิมพ์ผิดเล็กน้อย)
    // ตรวจสอบว่ามี substring ที่คล้ายกันหรือไม่
    if (original.length >= kwLower.length) {
      for (let i = 0; i <= original.length - kwLower.length; i++) {
        const substr = original.substring(i, i + kwLower.length);
        if (similarity(substr, kwLower) > 0.85) {
          foundKeywords.add(kwLower);
          break;
        }
      }
    }
  }

  // เพิ่มคำที่พบจาก dictionary เข้า tokens
  tokens.push(...foundKeywords);

  // ----- วิธีที่ 3: แยกคำไทยด้วย heuristic (สำหรับคำที่ไม่อยู่ใน dictionary) -----
  // แยกคำไทยที่ติดกันโดยใช้การสแกนหน้าต่าง (sliding window)
  const thaiText = original.replace(/[^ก-๙]/g, "");
  if (thaiText.length > 0) {
    // สแกนหาคำยาว 2-8 ตัวอักษร
    for (let len = 8; len >= 2; len--) {
      for (let i = 0; i <= thaiText.length - len; i++) {
        const substr = thaiText.substring(i, i + len);
        tokens.push(substr);
      }
    }
  }

  // กรองคำซ้ำและคำสั้นเกินไป
  const uniqueTokens = [...new Set(tokens)].filter((t) => t.length >= 2);

  return uniqueTokens;
}

function removeStopWords(tokens) {
  return tokens.filter((token) => !STOP_WORDS.has(token));
}

// ============================================================
// Levenshtein Distance
// ============================================================
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j] + 1,
        );
      }
    }
  }
  return dp[m][n];
}

function similarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

// ============================================================
// Smart Intent Matcher (ปรับปรุงแล้ว)
// ============================================================
class SmartIntentMatcher {
  constructor() {
    this.intents = new Map();
    this.fuzzyThreshold = 0.75;
    this.minScoreThreshold = 5; // 🔧 ลดจาก 10 → 5
  }

  register(name, config) {
    this.intents.set(name, {
      name,
      keywords: config.keywords || [],
      optionalKeywords: config.optionalKeywords || [],
      negativeKeywords: config.negativeKeywords || [],
      patterns: config.patterns || [],
      weight: config.weight || 1,
      execute: config.execute,
      response: config.response || null,
      description: config.description || "",
      requireQuestion: config.requireQuestion ?? null,
    });
  }

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

    allResults.sort((a, b) => b.score - a.score);

    // 🔧 ถ้าไม่มีอะไร match เลย แต่มี fallback intent ให้ return fallback
    if (!bestMatch || bestScore < this.minScoreThreshold) {
      const fallback = this.intents.get("UNKNOWN_FALLBACK");
      if (fallback) {
        return {
          intent: fallback,
          score: 1,
          matchedKeywords: [],
          isQuestion,
          allMatches: allResults.slice(0, 3),
          originalText: text,
          isFallback: true,
        };
      }
      return null;
    }

    return {
      intent: bestMatch.intent,
      score: bestMatch.score,
      matchedKeywords: bestMatch.matchedKeywords,
      isQuestion,
      allMatches: allResults.slice(0, 3),
      originalText: text,
      isFallback: false,
    };
  }

  _detectQuestion(text, tokens) {
    if (text.includes("?") || text.includes("？")) return true;
    return tokens.some((token) => QUESTION_INDICATORS.has(token));
  }

  _calculateScore(intent, originalText, tokens, filteredTokens, isQuestion) {
    let score = 0;
    const matchedKeywords = [];

    // 1. ตรวจสอบ negative keywords
    for (const neg of intent.negativeKeywords) {
      const negLower = neg.toLowerCase();
      if (originalText.toLowerCase().includes(negLower)) {
        return {
          intent,
          score: 0,
          matchedKeywords: [],
          reason: "negative_keyword_match",
        };
      }
    }

    // 2. ตรวจสอบ requireQuestion
    if (intent.requireQuestion === true && !isQuestion) {
      return { intent, score: 0, matchedKeywords: [], reason: "not_question" };
    }
    if (intent.requireQuestion === false && isQuestion) {
      return { intent, score: 0, matchedKeywords: [], reason: "is_question" };
    }

    // 3. ตรวจสอบ required keywords
    let requiredMatches = 0;

    for (const keyword of intent.keywords) {
      const kwLower = keyword.toLowerCase();
      let bestTokenScore = 0;
      let bestMatchToken = null;

      // 3.1 Exact match ในข้อความดิบ (สำคัญมากสำหรับภาษาไทย!)
      const textLower = originalText.toLowerCase();
      if (textLower.includes(kwLower)) {
        bestTokenScore = 1.0;
        bestMatchToken = kwLower;
      }

      // 3.2 ตรวจใน tokens
      if (bestTokenScore < 1.0) {
        for (const token of tokens) {
          if (token === kwLower) {
            bestTokenScore = 1.0;
            bestMatchToken = token;
            break;
          }

          // Partial match (substring)
          if (token.includes(kwLower) || kwLower.includes(token)) {
            const ratio =
              Math.min(token.length, kwLower.length) /
              Math.max(token.length, kwLower.length);
            if (ratio > bestTokenScore) {
              bestTokenScore = ratio;
              bestMatchToken = token;
            }
          }

          // Fuzzy match
          const sim = similarity(token, kwLower);
          if (sim > this.fuzzyThreshold && sim > bestTokenScore) {
            bestTokenScore = sim;
            bestMatchToken = token;
          }
        }
      }

      if (bestTokenScore > 0) {
        requiredMatches++;
        // 🔧 เพิ่มน้ำหนักให้ exact match
        const weightMultiplier = bestTokenScore >= 1.0 ? 15 : 10;
        score += bestTokenScore * weightMultiplier;
        matchedKeywords.push({
          keyword: kwLower,
          matched: bestMatchToken,
          score: bestTokenScore,
          type: "required",
        });
      }
    }

    // ถ้าไม่มี required match เลย → reject (ยกเว้น fallback ที่ไม่มี keywords)
    if (intent.keywords.length > 0 && requiredMatches === 0) {
      return {
        intent,
        score: 0,
        matchedKeywords: [],
        reason: "no_required_match",
      };
    }

    // 4. ตรวจสอบ optional keywords
    for (const keyword of intent.optionalKeywords) {
      const kwLower = keyword.toLowerCase();

      // Exact match ในข้อความดิบก่อน
      if (originalText.toLowerCase().includes(kwLower)) {
        score += 4;
        matchedKeywords.push({
          keyword: kwLower,
          matched: kwLower,
          score: 1,
          type: "optional",
        });
        continue;
      }

      for (const token of tokens) {
        let matchScore = 0;
        if (token === kwLower) matchScore = 1;
        else if (token.includes(kwLower) || kwLower.includes(token)) {
          matchScore =
            Math.min(token.length, kwLower.length) /
            Math.max(token.length, kwLower.length);
        } else {
          const sim = similarity(token, kwLower);
          if (sim > this.fuzzyThreshold) matchScore = sim;
        }

        if (matchScore > 0) {
          score += matchScore * 4;
          matchedKeywords.push({
            keyword: kwLower,
            matched: token,
            score: matchScore,
            type: "optional",
          });
        }
      }
    }

    // 5. ตรวจสอบ regex patterns
    for (const pattern of intent.patterns) {
      try {
        const regex = new RegExp(pattern, "i");
        if (regex.test(originalText)) {
          score += 10;
          matchedKeywords.push({ pattern, type: "regex" });
        }
      } catch (e) {
        console.error("Invalid regex pattern:", pattern, e.message);
      }
    }

    // 6. โบนัสคำถาม
    if (intent.requireQuestion === true && isQuestion) {
      score += 3;
    }

    // 7. คูณน้ำหนัก intent
    score *= intent.weight;

    // 8. 🔧 ปรับ normalization (ลดผลกระทบ)
    const tokenCount = tokens.filter((t) => t.length >= 3).length || 1;
    const normalizationFactor = Math.log(tokenCount + 1) * 0.5 + 0.8;
    score = score / normalizationFactor;

    return {
      intent,
      score: Math.min(score, 100),
      matchedKeywords,
      requiredMatches,
      totalRequired: intent.keywords.length,
    };
  }

  matchMultiple(text, threshold = 5) {
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

export default new SmartIntentMatcher();
