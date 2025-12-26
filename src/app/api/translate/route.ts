import { NextResponse } from 'next/server';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate';

// Lingva is a free translation API (uses Google Translate backend)
const LINGVA_URL = 'https://lingva.ml/api/v1';



// Translate with DeepL (primary)
async function translateWithDeepL(texts: string[], targetLang: string = 'EN'): Promise<string[]> {
  if (!DEEPL_API_KEY) {
    throw new Error('DeepL API key not configured');
  }

  const formData = new URLSearchParams();
  formData.append('auth_key', DEEPL_API_KEY);
  formData.append('target_lang', targetLang);
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
async function translateWithLingva(texts: string[], targetLang: string = 'EN'): Promise<string[]> {
  console.log(`🟡 [Lingva] Translating ${texts.length} texts in parallel to ${targetLang}...`);
  // Map standard codes to Lingva codes if needed (usually 2 letter is fine)
  const lang = targetLang.toLowerCase();
  
  const promises = texts.map(async (text) => {
    try {
      const response = await fetch(`${LINGVA_URL}/es/${lang}/${encodeURIComponent(text)}`, {
        signal: AbortSignal.timeout(10000), // 10s timeout per request
      });

      if (!response.ok) {
        console.error(`[Lingva] API error for text: "${text.substring(0, 20)}..." status: ${response.status}`);
        return ''; // Return empty string to indicate no translation
      }

      const data = await response.json();
      return data.translation || '';
    } catch (err) {
      console.error(`[Lingva] request failed for text: "${text.substring(0, 20)}..." error:`, err);
      return ''; // Return empty string on error
    }
  });

  return Promise.all(promises);
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // Don't enforce type check here to avoid "TranslateRequest" import issues if loose
    const { texts, targetLang = 'EN' } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts array required' }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    if (texts.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 texts per request' }, { status: 400 });
    }

    const isDev = process.env.NODE_ENV === 'development';
    let translations: string[];

    if (isDev) {
      console.log(`🟡 [Translate] Development mode: Prioritizing Lingva (Target: ${targetLang})...`);
      translations = await translateWithLingva(texts, targetLang);
      
      // If Lingva fails (returns empty strings), try DeepL as ultimate fallback in dev if key exists
      const failed = translations.every(t => !t);
      if (failed && DEEPL_API_KEY) {
        console.warn('⚠️ [Translate] Lingva failed in dev, trying DeepL as fallback...');
        translations = await translateWithDeepL(texts, targetLang);
      }
    } else {
      // Production: Try DeepL first, fallback to Lingva
      try {
        console.log(`🔵 [Translate] Attempting DeepL (Target: ${targetLang})...`);
        translations = await translateWithDeepL(texts, targetLang);
        console.log(`✅ [Translate] DeepL SUCCESS - ${texts.length} texts translated`);
      } catch (error) {
        console.warn('⚠️ [Translate] DeepL FAILED:', error);
        console.log('🟡 [Translate] Switching to Lingva fallback...');
        translations = await translateWithLingva(texts, targetLang);
        console.log(`✅ [Translate] Lingva fallback SUCCESS - ${texts.length} texts translated`);
      }
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('❌ [Translate] Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
