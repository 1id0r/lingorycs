const API_KEY = process.env.NEXT_PUBLIC_DEEPL_API_KEY;
// Using CORS proxy for development (browser limitation workaround)
const CORS_PROXY = 'https://corsproxy.io/?';
const BASE_URL = `${CORS_PROXY}https://api-free.deepl.com/v2`;

export const translateText = async (text: string, targetLang: string = 'EN'): Promise<string> => {
  if (!API_KEY) return text;

  try {
    const formData = new URLSearchParams();
    formData.append('auth_key', API_KEY);
    formData.append('text', text);
    formData.append('target_lang', targetLang);

    const response = await fetch(`${BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
       console.error("DeepL Error", await response.text());
       return text; // Fallback to original
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error("DeepL request failed", error);
    return text;
  }
};

export const translateLyrics = async (lines: string[]): Promise<string[]> => {
    // DeepL allows batching, but for simplicity/limits lets batch slightly or do one big request?
    // Doing one big request with multiple 'text' params is best for DeepL.
    
    if (!API_KEY) return lines;

    try {
        const formData = new URLSearchParams();
        formData.append('auth_key', API_KEY);
        formData.append('target_lang', 'EN');
        lines.forEach(line => formData.append('text', line));

        const response = await fetch(`${BASE_URL}/translate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
          });
      
          if (!response.ok) return lines;
      
          const data = await response.json();
          return data.translations.map((t: any) => t.text);

    } catch (e) {
        return lines;
    }
}
