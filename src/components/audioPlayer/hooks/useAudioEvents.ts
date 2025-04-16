import { useCallback } from "react";

interface UseAudioEventsOptions {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isScrubbing: boolean;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onLoadedData?: () => void;
  onEnded?: () => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onError?: (error: Event) => void;
}

interface AudioEventHandlers {
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
  handleLoadedData: () => void;
  handleEnded: () => void;
  handleDurationChange: () => void;
  handleStalled: () => void;
  handleError?: (e: Event) => void;
  handlePlay: () => void;
  handlePause: () => void;
}

/**
 * Custom hook to manage audio element event handlers
 */
export function useAudioEvents({
  audioRef,
  isPlaying,
  isScrubbing,
  onTimeUpdate,
  onDurationChange,
  onLoadedData,
  onEnded,
  onPlaybackStateChange,
  onError,
}: UseAudioEventsOptions): AudioEventHandlers {
  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && !isScrubbing) {
      const newTime = audioRef.current.currentTime;
      onTimeUpdate?.(newTime);
    }
  }, [audioRef, isScrubbing, onTimeUpdate]);

  // Metadata loaded handler
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const newDuration = audioRef.current.duration;
      onDurationChange?.(newDuration);
    }
  }, [audioRef, onDurationChange]);

  // Audio loaded handler
  const handleLoadedData = useCallback(() => {
    onLoadedData?.();
  }, [onLoadedData]);

  // Playback ended handler
  const handleEnded = useCallback(() => {
    onPlaybackStateChange?.(false);
    onEnded?.();
  }, [onEnded, onPlaybackStateChange]);

  // Duration change handler
  const handleDurationChange = useCallback(() => {
    if (audioRef.current) {
      onDurationChange?.(audioRef.current.duration || 0);
    }
  }, [audioRef, onDurationChange]);

  // Stall handler
  const handleStalled = useCallback(() => {
    // Auto-recovery for stalled playback
    if (isPlaying && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {
        // Silently fail if auto-recovery doesn't work
      });
    }
  }, [audioRef, isPlaying]);

  // Error handler
  const handleError = onError ? useCallback(
    (e: Event) => {
      console.error("Audio error:", e);
      onPlaybackStateChange?.(false);
      onError?.(e);
    },
    [onError, onPlaybackStateChange]
  ) : undefined;

  // Play event handler
  const handlePlay = useCallback(() => {
    onPlaybackStateChange?.(true);
  }, [onPlaybackStateChange]);

  // Pause event handler
  const handlePause = useCallback(() => {
    if (!isScrubbing) {
      onPlaybackStateChange?.(false);
    }
  }, [isScrubbing, onPlaybackStateChange]);

  return {
    handleTimeUpdate,
    handleLoadedMetadata,
    handleLoadedData,
    handleEnded,
    handleDurationChange,
    handleStalled,
    handleError,
    handlePlay,
    handlePause,
  };
} 