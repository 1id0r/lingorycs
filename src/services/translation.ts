// Translation service - calls server API route (keys are secure on server)

export const translateText = async (text: string, targetLang: string = 'EN'): Promise<string> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text], targetLang }),
    });

    if (!response.ok) {
      console.error('Translation API error');
      return text;
    }

    const data = await response.json();
    return data.translations?.[0] || text;
  } catch (error) {
    console.error('Translation request failed', error);
    return text;
  }
};

export const translateLyrics = async (lines: string[], targetLang: string = 'EN'): Promise<string[]> => {
  if (!lines || lines.length === 0) return lines;

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: lines, targetLang }),
    });

    if (!response.ok) {
      console.error('Translation API error');
      return lines;
    }

    const data = await response.json();
    return data.translations || lines;
  } catch (error) {
    console.error('Translation request failed', error);
    return lines;
  }
};
