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

const API_KEY = 'AIzaSyBkj99XULXH8EVLZQMG0-iJeHiGBDZfJlA';
const API_URL = 'https://www.googleapis.com/youtube/v3';

export const searchYoutube = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  const response = await fetch(`${API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}&maxResults=20`);
  if (!response.ok) {
    const errorData = await response.json();
    console.error("YouTube API Error:", errorData);
    const errorMessage = errorData?.error?.message || 'Failed to fetch from YouTube API';
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


export const tracks: Track[] = [
  {
    id: "w_RLA6sAY-A",
    videoId: "w_RLA6sAY-A",
    title: "Peer Gynt Suite No. 1, Op. 46: Morning Mood",
    artist: "Edvard Grieg",
    albumArt: "https://i.ytimg.com/vi/w_RLA6sAY-A/hqdefault.jpg",
  },
  {
    id: "5qap5aO4i9A",
    videoId: "5qap5aO4i9A",
    title: "The Sleeping Prophet",
    artist: "Keys of Moon",
    albumArt: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
  },
  {
    id: "N4d7Wp9kKjA",
    videoId: "N4d7Wp9kKjA",
    title: "Invincible",
    artist: "DEAF KEV",
    albumArt: "https://i.ytimg.com/vi/N4d7Wp9kKjA/hqdefault.jpg",
  },
    {
    id: "3So_CoG6-3c",
    videoId: "3So_CoG6-3c",
    title: "Relaxing Acoustic Guitar Music",
    artist: "Relaxing Jazz Music",
    albumArt: "https://i.ytimg.com/vi/3So_CoG6-3c/hqdefault.jpg",
  },
  {
    id: "Q_g-2K5G_4A",
    videoId: "Q_g-2K5G_4A",
    title: "Powerful Trap Rock",
    artist: "Audio Library",
    albumArt: "https://i.ytimg.com/vi/Q_g-2K5G_4A/hqdefault.jpg",
  },
  {
    id: "__2-2s_Jh9w",
    videoId: "__2-2s_Jh9w",
    title: "Peaceful & Relaxing Piano Music",
    artist: "OCB Relax Music",
    albumArt: "https://i.ytimg.com/vi/__2-2s_Jh9w/hqdefault.jpg",
  },
];

export const getDefaultPlaylists = (): Playlist[] => [
  { name: "Lofi hip hop music - beats to relax/study to", tracks: [tracks[0], tracks[1], tracks[2]] },
  { name: "Rock Classics", tracks: [tracks[3], tracks[4]] },
  { name: "Workout Mix", tracks: [tracks[2], tracks[4]] },
  { name: "Indie 2024", tracks: [tracks[0], tracks[3]] },
  { name: "Coding Focus", tracks: [tracks[1], tracks[5]] },
];


export const mainContentCards = [
  {
    title: "Daily Mix 1",
    description: "Coldplay, Imagine Dragons, OneRepublic and more",
    imageUrl: "https://picsum.photos/300/300?random=10",
    tracks: [tracks[0], tracks[2], tracks[4]],
  },
  {
    title: "Discover Weekly",
    description: "Your weekly mixtape of fresh music. Enjoy new discoveries.",
    imageUrl: "https://picsum.photos/300/300?random=11",
    tracks: [tracks[1], tracks[3], tracks[5]],
  },
  {
    title: "Rock Classics",
    description: "Rock legends and epic songs that continue to inspire.",
    imageUrl: "https://picsum.photos/300/300?random=12",
    tracks: [tracks[4], tracks[3]],
  },
  {
    title: "Chill Hits",
    description: "Kick back to the best new and recent chill hits.",
    imageUrl: "https://picsum.photos/300/300?random=13",
    tracks: [tracks[0], tracks[1], tracks[5]],
  },
];