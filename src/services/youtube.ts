// YouTube service - calls server API route (keys are secure on server)

export const findVideoId = async (query: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/youtube-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxResults: 1 }),
    });

    if (!response.ok) {
      console.error('YouTube API error');
      return null;
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].videoId;
    }
    return null;
  } catch (error) {
    console.error('YouTube search failed:', error);
    return null;
  }
};

// Search for multiple videos (used by Explore)
export const searchVideos = async (
  query: string,
  maxResults: number = 25
): Promise<Array<{ videoId: string; title: string; thumbnail: string }>> => {
  try {
    const response = await fetch('/api/youtube-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxResults }),
    });

    if (!response.ok) {
      console.error('YouTube API error');
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('YouTube search failed:', error);
    return [];
  }
};
