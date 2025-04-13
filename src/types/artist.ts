import { Track } from "./track"

export interface Artist {
  id: string;
  name: string;
  bio: string;
  profilePicture: string;
  socialLinks: SocialLink[];
  tracks: Track[]; 
}

export interface SocialLink {
  name: string;
  link: URL;
}
