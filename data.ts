export interface Track {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  albumArt: string;
}

export interface Playlist {
  name: string;
  tracks: Track[];
}

const API_KEY = 'AIzaSyBkj99XULXH8EVLZQMG0-iJeHiGBDZfJlA'; // Chave da API do YouTube
const API_URL = 'https://www.googleapis.com/youtube/v3';

export const searchYoutube = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  // The previous check for API_KEY.startsWith('AIzaSy') was incorrect as valid keys can start with this prefix.
  if (!API_KEY) {
    throw new Error("A chave da API do YouTube não está configurada.");
  }
  const response = await fetch(`${API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&videoEmbeddable=true&key=${API_KEY}&maxResults=20`);
  if (!response.ok) {
    let errorMessage = `Falha ao buscar na API do YouTube (${response.status} ${response.statusText})`;
    try {
        const errorData = await response.json();
        console.error("YouTube API Error:", errorData);
        if (errorData?.error?.message && typeof errorData.error.message === 'string') {
            errorMessage = errorData.error.message;
        } else if (errorData?.error?.errors?.[0]?.message && typeof errorData.error.errors[0].message === 'string') {
            errorMessage = errorData.error.errors[0].message;
        } else {
            errorMessage = `Recebida uma estrutura de erro inesperada: ${JSON.stringify(errorData)}`;
        }
    } catch (e) {
        try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
        } catch (textErr) { /* fallback to status text */ }
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  if (!data.items) return [];
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    albumArt: item.snippet.thumbnails.high.url,
  }));
};

export const getTrendingMusic = async (): Promise<Track[]> => {
  if (!API_KEY) {
    throw new Error("A chave da API do YouTube não está configurada.");
  }
  const response = await fetch(`${API_URL}/videos?part=snippet&chart=mostPopular&videoCategoryId=10&regionCode=BR&key=${API_KEY}&maxResults=20`);
  if (!response.ok) {
    let errorMessage = `Falha ao buscar as músicas em alta (${response.status} ${response.statusText})`;
     try {
        const errorData = await response.json();
        console.error("YouTube API Error (Trending):", errorData);
        if (errorData?.error?.message && typeof errorData.error.message === 'string') {
            errorMessage = errorData.error.message;
        } else {
            errorMessage = `Recebida uma estrutura de erro inesperada: ${JSON.stringify(errorData)}`;
        }
    } catch (e) {
        try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
        } catch (textErr) { /* fallback to status text */ }
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  if (!data.items) return [];
  return data.items.map((item: any) => ({
    id: item.id,
    videoId: item.id,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    albumArt: item.snippet.thumbnails.high.url,
  }));
};