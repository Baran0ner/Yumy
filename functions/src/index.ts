import { HttpsError, onCall } from 'firebase-functions/https';

type GeminiPart = {
  text: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

export const geminiProxy = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Kimlik doğrulama gerekli.');
  }

  const description = String(request.data?.description ?? '').trim();
  if (!description) {
    throw new HttpsError('invalid-argument', 'description zorunlu.');
  }

  if (!GEMINI_API_KEY) {
    throw new HttpsError('failed-precondition', 'GEMINI_API_KEY tanımlı değil.');
  }

  const prompt =
    'Kullanıcının öğün metnini analiz et ve sadece JSON dön. ' +
    'Format: {"calories":number,"protein":number,"carbs":number,"fat":number}. ' +
    `Öğün: ${description}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 },
    }),
  });

  if (!response.ok) {
    throw new HttpsError('internal', 'Gemini isteği başarısız.');
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new HttpsError('internal', 'Gemini boş yanıt döndü.');
  }

  return { raw: text };
});
