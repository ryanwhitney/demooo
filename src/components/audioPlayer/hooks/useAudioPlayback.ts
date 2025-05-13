import { useAudio } from "@/providers/AudioProvider";
import type { Track } from "@/types/track";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAudioPlaybackOptions {
  track: Track;
  externalIsPlaying?: boolean;
  onPlayPause?: (isPlaying: boolean) => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  source?: "global" | "track-view" | "artist-view";
}

interface UseAudioPlaybackResult {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isScrubbing: boolean;
  isLoaded: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  togglePlayPause: () => void;
  jumpToPosition: (time: number) => void;
  handleScrubbing: (scrubbing: boolean, previewTime: number) => void;
}

/**
 * Custom hook to manage audio playback with scrubbing support
 */
export function useAudioPlayback({
  track,
  externalIsPlaying,
  onPlayPause,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  source = "global",
}: UseAudioPlaybackOptions): UseAudioPlaybackResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wasPlayingRef = useRef(false);
  const previousTrackId = useRef<string | null>(null);
  const pendingSeekTimeRef = useRef<number | null>(null);

  // Get the shared audio context
  const audioContext = useAudio();
  const isActiveSource = audioContext.isSourceActive?.(source);

  // Add direct listeners to the audio element to ensure we catch all updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoaded(true);
    };

    const handleDurationChange = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setDuration(audio.duration);
        onDurationChange?.(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      }
    };

    const handleEnded = () => {
      onEnded?.();
    };

    const handlePause = () => {
      // Only update state if we're not scrubbing
      if (!isScrubbing) {
        setIsPlaying(false);
        onPlayPause?.(false);
      }
    };

    const handlePlay = () => {
      // Only update state if we're not scrubbing
      if (!isScrubbing) {
        setIsPlaying(true);
        onPlayPause?.(true);
      }
    };

    const handleWaiting = () => {
      // Audio is waiting for more data
    };

    const handlePlaying = () => {
      // Audio has started playing
    };

    // Add the direct event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);

    // If duration is already available, use it
    if (audio.duration && !Number.isNaN(audio.duration)) {
      setDuration(audio.duration);
      onDurationChange?.(audio.duration);
      setIsLoaded(true);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
    };
  }, [isScrubbing, onDurationChange, onTimeUpdate, onEnded, onPlayPause]);

  // Reset state when track changes
  useEffect(() => {
    if (previousTrackId.current !== track.id) {
      setCurrentTime(0);
      setDuration(0);
      setIsLoaded(false);

      pendingSeekTimeRef.current = null;
      setIsScrubbing(false);
      wasPlayingRef.current = false;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.load();

        // Chrome sometimes needs a small delay before trying to play a new track
        setTimeout(() => {
          if (externalIsPlaying && audioRef.current && isActiveSource) {
            audioRef.current.play().catch((error) => {
              console.error("Error playing new track:", error);
              setIsPlaying(false);
              onPlayPause?.(false);
            });
          }
        }, 100);
      }
      previousTrackId.current = track.id;
    }
  }, [track.id, externalIsPlaying, onPlayPause, isActiveSource]);

  // Sync with external play state if provided
  useEffect(() => {
    if (
      externalIsPlaying !== undefined &&
      externalIsPlaying !== isPlaying &&
      isActiveSource
    ) {
      if (externalIsPlaying) {
        if (audioRef.current && isLoaded) {
          audioRef.current.play().catch((error: Error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            onPlayPause?.(false);
          });
        }
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying, isPlaying, onPlayPause, isLoaded, isActiveSource]);

  // Toggle play/pause state
  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      const newPlayingState = !isPlaying;

      // If we're not the active source but trying to play, transfer control
      if (
        newPlayingState &&
        !isActiveSource &&
        audioContext.currentTrack?.id === track.id
      ) {
        audioContext.transferControlTo(source);
      }

      // If playing the same track that's already active elsewhere, transfer control
      if (
        newPlayingState &&
        !isActiveSource &&
        audioContext.isPlaying &&
        audioContext.currentTrack?.id === track.id
      ) {
        audioContext.transferControlTo(source);
        return;
      }

      // If we're playing a different track than what's currently active, play through normal channels
      if (newPlayingState) {
        audioRef.current.play().catch((error: Error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
          onPlayPause?.(false);
        });
      } else {
        audioRef.current.pause();
      }

      setIsPlaying(newPlayingState);
      onPlayPause?.(newPlayingState);
    }
  }, [isPlaying, onPlayPause, audioContext, track.id, isActiveSource, source]);

  // Jump to a specific time position
  const jumpToPosition = useCallback(
    (time: number) => {
      if (!audioRef.current) return;

      // Check if the audio element is ready for seeking
      if (!isLoaded || audioRef.current.readyState < 1) {
        pendingSeekTimeRef.current = time;
        return;
      }

      const boundedTime = Math.max(
        0,
        Math.min(time, audioRef.current.duration || 0),
      );

      try {
        // Store the current play state
        const wasPlaying = isPlaying;

        audioRef.current.currentTime = boundedTime;
        setCurrentTime(boundedTime);
        onTimeUpdate?.(boundedTime);

        // Resume playback only if we were already playing and not scrubbing
        if (wasPlaying && !isScrubbing) {
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error resuming after seek:", error);
              if (!isScrubbing) {
                setIsPlaying(false);
                onPlayPause?.(false);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error seeking audio:", error);
        pendingSeekTimeRef.current = time;
      }
    },
    [isLoaded, isPlaying, isScrubbing, onTimeUpdate, onPlayPause],
  );

  // Handle scrubbing state
  const handleScrubbing = useCallback(
    (scrubbing: boolean, previewTime: number) => {
      // When starting to scrub
      if (scrubbing && !isScrubbing) {
        wasPlayingRef.current = isPlaying;

        // Pause if currently playing (but don't update UI state)
        if (isPlaying && audioRef.current) {
          audioRef.current.pause();
        }
      }
      // When ending a scrub
      else if (!scrubbing && isScrubbing) {
        // Only resume playback if we were playing before scrubbing
        if (wasPlayingRef.current && audioRef.current) {
          // Only update UI state if it's different from what it was before scrubbing
          if (!isPlaying) {
            setIsPlaying(true);
            onPlayPause?.(true);
          }

          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.error("Error resuming playback:", err);
              setIsPlaying(false);
              onPlayPause?.(false);
            });
          }
        } else if (!wasPlayingRef.current) {
          // Make sure we stay paused if we were paused before scrubbing
          if (isPlaying) {
            setIsPlaying(false);
            onPlayPause?.(false);
          }

          // Ensure audio element is actually paused
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
      }

      // Update scrubbing state
      setIsScrubbing(scrubbing);

      // When actively scrubbing, update time
      if (scrubbing) {
        setCurrentTime(previewTime);
        onTimeUpdate?.(previewTime);

        if (audioRef.current && isLoaded) {
          try {
            audioRef.current.currentTime = previewTime;
          } catch (e) {
            console.warn("Could not update currentTime during scrubbing", e);
          }
        }
      }
    },
    [isPlaying, isScrubbing, onPlayPause, onTimeUpdate, isLoaded],
  );

  return {
    isPlaying,
    currentTime,
    duration,
    isScrubbing,
    isLoaded,
    audioRef,
    togglePlayPause,
    jumpToPosition,
    handleScrubbing,
  };
}
