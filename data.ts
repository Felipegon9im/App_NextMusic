export interface Track {
  id: number;
  title: string;
  artist: string;
  albumArt: string;
  audioSrc: string;
}

export const tracks: Track[] = [
  {
    id: 1,
    title: "Morning Mood",
    artist: "Edvard Grieg",
    albumArt: "https://picsum.photos/300/300?random=1",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "Ambient Chill",
    artist: "SoundHelix",
    albumArt: "https://picsum.photos/300/300?random=2",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "Electronic Dance",
    artist: "SoundHelix",
    albumArt: "https://picsum.photos/300/300?random=3",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
    {
    id: 4,
    title: "Acoustic Guitar",
    artist: "SoundHelix",
    albumArt: "https://picsum.photos/300/300?random=4",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: 5,
    title: "Rock Anthem",
    artist: "SoundHelix",
    albumArt: "https://picsum.photos/300/300?random=5",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: 6,
    title: "Peaceful Piano",
    artist: "SoundHelix",
    albumArt: "https://picsum.photos/300/300?random=6",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
];

export const userPlaylists = [
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