export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  duration: number; 
  createdAt: Date; 
  recordedAt: Date;
  tags: string; // comma-separated tags
}