import type { Track } from "@/types/track";

/**
 * PlayerSource - Defines the different contexts that can control audio playback
 */
export type PlayerSource = "global" | "track-view" | "artist-view";

/**
 * PlaybackState - Represents the current state of audio playback
 */
export type PlaybackState =
  | "playing"
  | "paused"
  | "loading"
  | "ended"
  | "error";

/**
 * AudioContextState - The complete state interface for the audio provider
 */
export interface AudioContextState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeSource: PlayerSource | null;
  queue: Track[];
  isScrubbing: boolean;
}

/**
 * AudioActions - All actions that can be performed on the audio context
 */
export interface AudioActions {
  // Playback actions
  playTrack: (track: Track, source: PlayerSource) => void;
  playTrackInQueue: (
    track: Track,
    queueTracks: Track[],
    source: PlayerSource,
  ) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlayPause: () => void;

  // Queue navigation
  nextTrack: () => void;
  previousTrack: () => void;
  skipToTrack: (trackId: string) => void;
  clearQueue: () => void;

  // Time control
  seekTo: (time: number) => void;
  startScrubbing: (previewTime: number) => void;
  endScrubbing: (finalTime: number) => void;

  // Source management
  setActiveSource: (source: PlayerSource) => void;
  isSourceActive: (source: PlayerSource) => boolean;
  transferControlTo: (source: PlayerSource) => void;

  // Audio access
  getAudioElement: () => HTMLAudioElement | null;
}

/**
 * AudioContextType - Combines state and actions for the complete audio context
 */
export type AudioContextType = AudioContextState & AudioActions;

/**
 * Determines if a player source should take precedence over another
 * Higher priority sources can take control from lower priority sources
 */
export const getSourcePriority = (source: PlayerSource): number => {
  switch (source) {
    case "track-view":
      return 3; // Highest priority - track detail page
    case "artist-view":
      return 2; // Medium priority - artist page
    case "global":
      return 1; // Lowest priority - global player
    default:
      return 0;
  }
};

/**
 * Determines if a source should automatically take control when mounted
 */
export const shouldAutoTakeControl = (source: PlayerSource): boolean => {
  // Only track-view should auto-take control when mounted
  return source === "track-view";
};
