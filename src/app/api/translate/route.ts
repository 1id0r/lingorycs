import { NextResponse } from 'next/server';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate';

// Lingva is a free translation API (uses Google Translate backend)
const LINGVA_URL = 'https://lingva.ml/api/v1/es/en';

interface TranslateRequest {
  texts: string[];
}

// Translate with DeepL (primary)
async function translateWithDeepL(texts: string[]): Promise<string[]> {
  if (!DEEPL_API_KEY) {
    throw new Error('DeepL API key not configured');
  }

  const formData = new URLSearchParams();
  formData.append('auth_key', DEEPL_API_KEY);
  formData.append('target_lang', 'EN');
  formData.append('source_lang', 'ES');
  texts.forEach((text) => formData.append('text', text));

  const response = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[DeepL] API error:', error);
    throw new Error('DeepL translation failed');
  }

  const data = await response.json();
  return data.translations.map((t: { text: string }) => t.text);
}

// Translate with Lingva (free fallback) - parallel for speed
async function translateWithLingva(texts: string[]): Promise<string[]> {
  console.log(`🟡 [Lingva] Translating ${texts.length} texts in parallel...`);
  
  const promises = texts.map(async (text) => {
    try {
      const response = await fetch(`${LINGVA_URL}/${encodeURIComponent(text)}`, {
        signal: AbortSignal.timeout(10000), // 10s timeout per request
      });

      if (!response.ok) {
        return text; // Keep original on error
      }

      const data = await response.json();
      return data.translation || text;
    } catch {
      return text; // Keep original on error
    }
  });

  return Promise.all(promises);
}

export async function POST(request: Request) {
  try {
    const body: TranslateRequest = await request.json();
    const { texts } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts array required' }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    if (texts.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 texts per request' }, { status: 400 });
    }

    let translations: string[];

    // Try DeepL first, fallback to Lingva
    try {
      console.log('🔵 [Translate] Attempting DeepL...');
      translations = await translateWithDeepL(texts);
      console.log(`✅ [Translate] DeepL SUCCESS - ${texts.length} texts translated`);
    } catch (error) {
      console.warn('⚠️ [Translate] DeepL FAILED:', error);
      console.log('🟡 [Translate] Switching to Lingva fallback...');
      translations = await translateWithLingva(texts);
      console.log(`✅ [Translate] Lingva fallback SUCCESS - ${texts.length} texts translated`);
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('❌ [Translate] Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
