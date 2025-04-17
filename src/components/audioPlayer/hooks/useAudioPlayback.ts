import { useCallback, useEffect, useRef, useState } from "react";
import type { Track } from "@/types/track";

interface UseAudioPlaybackOptions {
  track: Track;
  externalIsPlaying?: boolean;
  onPlayPause?: (isPlaying: boolean) => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
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

  // Add direct listeners to the audio element to ensure we catch all updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      console.log(`DIRECT: LoadedMetadata - duration=${audio.duration}`);
      setDuration(audio.duration || 0);
      setIsLoaded(true);
    };

    const handleDurationChange = () => {
      console.log(`DIRECT: DurationChange - duration=${audio.duration}`);
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
      console.log("DIRECT: Audio ended");
      onEnded?.();
    };

    const handlePause = () => {
      console.log("DIRECT: Audio paused");
      // Only update state if we're not scrubbing
      if (!isScrubbing) {
        setIsPlaying(false);
        onPlayPause?.(false);
      } else {
        console.log("Ignoring pause event during scrubbing");
      }
    };

    const handlePlay = () => {
      console.log("DIRECT: Audio playing");
      // Only update state if we're not scrubbing
      if (!isScrubbing) {
        setIsPlaying(true);
        onPlayPause?.(true);
      } else {
        console.log("Ignoring play event during scrubbing");
      }
    };

    const handleWaiting = () => {
      console.log("DIRECT: Audio waiting");
    };

    const handlePlaying = () => {
      console.log("DIRECT: Audio playing");
    };

    // Add the direct event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    // If duration is already available, use it
    if (audio.duration && !Number.isNaN(audio.duration)) {
      setDuration(audio.duration);
      onDurationChange?.(audio.duration);
      setIsLoaded(true);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [isScrubbing, onDurationChange, onTimeUpdate, onEnded, onPlayPause]);

  // Reset state when track changes
  useEffect(() => {
    if (previousTrackId.current !== track.id) {
      console.log(`Track changed to ${track.id}`);
      setCurrentTime(0);
      setDuration(0);
      setIsLoaded(false);

      // Reset all internal state on track change
      pendingSeekTimeRef.current = null;
      setIsScrubbing(false);
      wasPlayingRef.current = false;

      if (audioRef.current) {
        // Ensure we reset the audio element completely
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        // Load the new track
        audioRef.current.load();

        // Chrome sometimes needs a small delay before trying to play a new track
        setTimeout(() => {
          if (externalIsPlaying && audioRef.current) {
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
  }, [track.id, externalIsPlaying, onPlayPause]);

  // Sync with external play state if provided
  useEffect(() => {
    if (externalIsPlaying !== undefined && externalIsPlaying !== isPlaying) {
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
  }, [externalIsPlaying, isPlaying, onPlayPause, isLoaded]);

  // Toggle play/pause state
  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      const newPlayingState = !isPlaying;
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
  }, [isPlaying, onPlayPause]);

  // Jump to a specific time position
  const jumpToPosition = useCallback(
    (time: number) => {
      if (!audioRef.current) return;

      console.log(`Jumping to position: ${time} (loaded: ${isLoaded}, readyState: ${audioRef.current.readyState})`);

      // Check if the audio element is ready for seeking
      if (!isLoaded || audioRef.current.readyState < 1) {
        // Save the requested time to apply once loaded
        console.log(`Audio not ready for seeking, saving pending time: ${time}`);
        pendingSeekTimeRef.current = time;
        return;
      }

      // Proceed with seeking now that we know the audio is ready
      const boundedTime = Math.max(
        0,
        Math.min(time, audioRef.current.duration || 0),
      );

      try {
        // Remember play state before seeking
        const wasPlaying = isPlaying;
        
        // Set the audio element time
        audioRef.current.currentTime = boundedTime;
        console.log(`Set audio currentTime to ${boundedTime}`);

        // Update state
        setCurrentTime(boundedTime);
        onTimeUpdate?.(boundedTime);

        // Resume playback if we were playing before - but only if not currently scrubbing
        if (wasPlaying && !isScrubbing) {
          // Ensure the audio gets played after seeking
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error resuming after seek:", error);
              // Only update state if playback actually fails and we're not scrubbing
              if (!isScrubbing) {
                setIsPlaying(false);
                onPlayPause?.(false);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error seeking audio:", error);
        // Store for later if seeking fails
        pendingSeekTimeRef.current = time;
      }
    },
    [isLoaded, isPlaying, isScrubbing, onTimeUpdate, onPlayPause],
  );

  // Handle scrubbing state
  const handleScrubbing = useCallback(
    (scrubbing: boolean, previewTime: number) => {
      console.log(`Scrubbing: ${scrubbing}, previewTime: ${previewTime}`);
      
      // When starting to scrub
      if (scrubbing && !isScrubbing) {
        // Remember if we were playing
        wasPlayingRef.current = isPlaying;
        console.log(`Starting scrub - wasPlaying: ${wasPlayingRef.current}`);
        
        // Pause if currently playing (but don't update UI state)
        if (isPlaying && audioRef.current) {
          audioRef.current.pause();
          // Don't call setIsPlaying or onPlayPause here
        }
      } 
      // When ending a scrub
      else if (!scrubbing && isScrubbing) {
        console.log(`Ending scrub - wasPlaying: ${wasPlayingRef.current}`);
        
        // Resume playback if we were playing before
        if (wasPlayingRef.current && audioRef.current) {
          console.log("Resuming playback after scrub");
          
          // Only update UI state if it's different from what it was before scrubbing
          if (!isPlaying) {
            setIsPlaying(true);
            onPlayPause?.(true);
          }

          // Resume playback with proper promise handling
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.error("Error resuming playback:", err);
              setIsPlaying(false);
              onPlayPause?.(false);
            });
          }
        } else if (wasPlayingRef.current === false && isPlaying) {
          // Only update the state if we were paused before and now showing as playing
          setIsPlaying(false);
          onPlayPause?.(false);
        }
      }

      // Update scrubbing state
      setIsScrubbing(scrubbing);

      // When actively scrubbing, update time
      if (scrubbing) {
        setCurrentTime(previewTime);
        onTimeUpdate?.(previewTime);
        
        // Also update the audio position for immediate feedback
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