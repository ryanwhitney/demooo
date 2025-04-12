export interface Track {
  id: string;
  title: string;
  description: string;
  artist: string;
  albumArt?: string;
  duration: number; 
  createdAt: string; 
  recordedAt: string;
  tags: string; // comma-separated tags
}