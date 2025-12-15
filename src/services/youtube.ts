const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const findVideoId = async (query: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("YouTube API Key is missing");
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${API_KEY}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API Error:", errorData);
      return null;
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch YouTube ID:", error);
    return null;
  }
};
