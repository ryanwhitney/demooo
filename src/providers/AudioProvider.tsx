// AudioContext.tsx
import type { Track } from "@/types/track";
import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
	useRef,
	useEffect,
} from "react";

type PlayerSource = "global" | "track-view" | "artist-view";

// Define the type for our context value
interface AudioContextType {
	// State
	currentTrack: Track | null;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	activeSource: PlayerSource | null;
	queue: Track[];
	isScrubbing: boolean;

	// Actions
	playTrack: (track: Track, source: PlayerSource) => void;
	playTrackInQueue: (
		track: Track,
		queueTracks: Track[],
		source: PlayerSource,
	) => void;
	pauseTrack: () => void;
	resumeTrack: () => void;
	togglePlayPause: () => void;
	nextTrack: () => void;
	previousTrack: () => void;
	skipToTrack: (trackId: string) => void;
	clearQueue: () => void;

	// Time control
	seekTo: (time: number) => void;
	startScrubbing: (previewTime: number) => void;
	endScrubbing: (finalTime: number) => void;

	// Get audio element for direct manipulation
	getAudioElement: () => HTMLAudioElement | null;

	// Source management
	setActiveSource: (source: PlayerSource) => void;
	isSourceActive: (source: PlayerSource) => boolean;
	transferControlTo: (source: PlayerSource) => void;
}

// Create context with a default value matching the interface
const AudioContext = createContext<AudioContextType>({
	// Default state values
	currentTrack: null,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	activeSource: null,
	queue: [],
	isScrubbing: false,

	// Default action stubs
	playTrack: () => {},
	playTrackInQueue: () => {},
	pauseTrack: () => {},
	resumeTrack: () => {},
	togglePlayPause: () => {},
	nextTrack: () => {},
	previousTrack: () => {},
	skipToTrack: () => {},
	clearQueue: () => {},

	// Default time control stubs
	seekTo: () => {},
	startScrubbing: () => {},
	endScrubbing: () => {},

	// Default audio element accessor
	getAudioElement: () => null,

	// Default source management stubs
	setActiveSource: () => {},
	isSourceActive: () => false,
	transferControlTo: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
	// State
	const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [activeSource, setActiveSource] = useState<PlayerSource | null>(null);
	const [queue, setQueue] = useState<Track[]>([]);
	const [isScrubbing, setIsScrubbing] = useState(false);

	// Refs
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const wasPlayingBeforeScrubRef = useRef(false);
	const nextTrackRef = useRef<() => void>(() => {});
	const isSeekingRef = useRef(false);
	const ignoreTimeUpdatesUntilRef = useRef(0); // Timestamp to ignore timeupdate events until
	const pendingPlaybackRef = useRef(false); // Track if we should resume playback after seeking
	const transferDebounceRef = useRef(0); // Timestamp to debounce transfer operations
	const lastTimeUpdateRef = useRef(0); // Timestamp for throttled time updates

	// Initialize the single audio element
	useEffect(() => {
		if (!audioRef.current) {
			console.log("Creating audio element");
			const audio = new Audio();
			audio.preload = "auto";
			audioRef.current = audio;

			// Return cleanup function
			return () => {
				audio.pause();
				audio.src = "";
				console.log("Cleaning up audio element");
			};
		}
	}, []);

	// Setup event listeners on the audio element
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		console.log("Setting up audio element event listeners");

		// Simple timeupdate handler - don't update time during scrubbing/seeking
		const handleTimeUpdate = () => {
			// Skip all updates during scrubbing or seeking
			if (isScrubbing || isSeekingRef.current) {
				return;
			}

			// Skip updates if we're in the ignore period after a seek
			if (Date.now() < ignoreTimeUpdatesUntilRef.current) {
				return;
			}

			// Throttle time updates to reduce rendering pressure during playback
			const now = Date.now();
			if (!audio.paused && now - lastTimeUpdateRef.current < 100) {
				return; // Skip updates that are too close together during playback
			}
			lastTimeUpdateRef.current = now;

			// Update time state normally during playback
			setCurrentTime(audio.currentTime);
		};

		const handleDurationChange = () => {
			if (audio.duration && !Number.isNaN(audio.duration)) {
				setDuration(audio.duration);
			}
		};

		const handlePlay = () => {
			// Skip play events during scrubbing to maintain consistent UI
			if (!isScrubbing) {
				setIsPlaying(true);
			}
		};

		const handlePause = () => {
			// Skip pause events during scrubbing to maintain consistent UI
			if (!isScrubbing) {
				setIsPlaying(false);
			}
		};

		const handleEnded = () => {
			nextTrackRef.current();
		};

		const handleError = (e: Event) => {
			console.error("Audio error:", e);
			setIsPlaying(false);
		};

		// Add event listeners
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("durationchange", handleDurationChange);
		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("error", handleError);

		// Cleanup on unmount or refresh
		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("durationchange", handleDurationChange);
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("error", handleError);
		};
	}, [isScrubbing]);

	// Get current position in queue
	const getQueuePosition = useCallback(() => {
		if (!currentTrack || queue.length === 0) return -1;
		return queue.findIndex((track) => track.id === currentTrack.id);
	}, [currentTrack, queue]);

	// Check if a source is active
	const isSourceActive = useCallback(
		(source: PlayerSource) => activeSource === source,
		[activeSource],
	);

	// Update audio source when track changes
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !currentTrack) return;

		console.log(`Updating audio source for track: ${currentTrack.title}`);

		let trackUrl = "";
		if (currentTrack.audioUrl) {
			if (currentTrack.audioUrl.startsWith("http")) {
				trackUrl = currentTrack.audioUrl;
			} else {
				trackUrl = `${import.meta.env.VITE_API_BASE_URL}${currentTrack.audioUrl}`;
			}
		}

		// Only update if URL has changed to prevent unnecessary reloading
		if (audio.src !== trackUrl) {
			// Save current playing state
			const wasPlaying = !audio.paused;

			// Update source
			audio.src = trackUrl;
			audio.load();

			// Resume playback if it was playing
			if (wasPlaying) {
				audio.play().catch((error) => {
					console.error("Error playing new track:", error);
					setIsPlaying(false);
				});
			}
		}
	}, [currentTrack]);

	// Control playback when isPlaying state changes
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !currentTrack) return;

		if (isPlaying && audio.paused && !isScrubbing) {
			console.log(`Playing track: ${currentTrack.title} (${activeSource})`);
			audio.play().catch((error) => {
				console.error("Error playing audio:", error);
				setIsPlaying(false);
			});
		} else if (!isPlaying && !audio.paused && !isScrubbing) {
			console.log(`Pausing track: ${currentTrack.title} (${activeSource})`);
			audio.pause();
		}
	}, [isPlaying, currentTrack, activeSource, isScrubbing]);

	// Play next track in queue
	const nextTrack = useCallback(() => {
		const currentPosition = getQueuePosition();

		// If not in queue or at the end, stop playback
		if (currentPosition === -1 || currentPosition === queue.length - 1) {
			setIsPlaying(false);
			return;
		}

		// Play next track
		const nextTrack = queue[currentPosition + 1];
		setCurrentTrack(nextTrack);
		setCurrentTime(0);
		setDuration(0);
		setIsPlaying(true);
	}, [queue, getQueuePosition]);

	// Update the nextTrack ref whenever the function changes
	useEffect(() => {
		nextTrackRef.current = nextTrack;
	}, [nextTrack]);

	// Play a specific track
	const playTrack = useCallback(
		(track: Track, source: PlayerSource) => {
			console.log(`Play track requested: ${track.title} from source ${source}`);

			// If it's the same track, just switch source and resume
			if (currentTrack?.id === track.id) {
				console.log(`Same track - setting source to ${source} and resuming`);
				setActiveSource(source);
				setIsPlaying(true);
				return;
			}

			// New track - reset state and play
			console.log(`New track - playing ${track.title} from source ${source}`);
			setCurrentTrack(track);
			setActiveSource(source);
			setIsPlaying(true);
			setCurrentTime(0);
			setDuration(0);
			setQueue([track]);
		},
		[currentTrack?.id],
	);

	// Play a track and set up a queue
	const playTrackInQueue = useCallback(
		(track: Track, queueTracks: Track[], source: PlayerSource) => {
			console.log(`Play in queue requested: ${track.title} from ${source}`);

			// If it's the same track, just switch source and resume
			if (currentTrack?.id === track.id) {
				setActiveSource(source);
				setIsPlaying(true);
				setQueue(queueTracks);
				return;
			}

			// Set the new queue
			setQueue(queueTracks);

			// Find the index of the selected track in the queue
			const trackIndex = queueTracks.findIndex((t) => t.id === track.id);

			// If not found, just play the track without queue
			if (trackIndex === -1) {
				playTrack(track, source);
				return;
			}

			// Set current track and play it
			setCurrentTrack(track);
			setActiveSource(source);
			setIsPlaying(true);
			setCurrentTime(0);
			setDuration(0);
		},
		[currentTrack?.id, playTrack],
	);

	// Simple playback controls
	const pauseTrack = useCallback(() => {
		setIsPlaying(false);
	}, []);

	const resumeTrack = useCallback(() => {
		setIsPlaying(true);
	}, []);

	const togglePlayPause = useCallback(() => {
		setIsPlaying((prev) => !prev);
	}, []);

	// Change active source
	const changeActiveSource = useCallback(
		(source: PlayerSource) => {
			console.log(
				`Setting active source to ${source} for track: ${currentTrack?.title}`,
			);
			setActiveSource(source);
		},
		[currentTrack?.title],
	);

	// Transfer control to another source, preserving playback state
	const transferControlTo = useCallback(
		(source: PlayerSource) => {
			console.log(
				`Transferring control to ${source} for track: ${currentTrack?.title} (was ${activeSource})`,
			);

			// If we're already the active source, no need to transfer
			if (activeSource === source) {
				console.log(`Already ${source}, skipping transfer`);
				return;
			}

			// If we've transfered very recently, debounce this operation
			const now = Date.now();
			const lastTransferTime = transferDebounceRef.current;
			if (now - lastTransferTime < 300) {
				console.log(
					`Transfer too soon, debouncing (${now - lastTransferTime}ms since last)`,
				);
				return;
			}

			// Mark this transfer time
			transferDebounceRef.current = now;

			// Save state before transfer
			const wasPlaying = isPlaying;
			const currentPosition = currentTime;

			// Update the active source
			setActiveSource(source);

			// Ensure the audio element state matches
			const audio = audioRef.current;
			if (audio && currentTrack) {
				// Don't change actual audio playback, just the controlling source
				console.log(
					`Maintaining playback state: ${wasPlaying ? "playing" : "paused"} at position ${currentPosition.toFixed(2)}`,
				);

				// Only adjust currentTime if significantly different
				if (Math.abs(audio.currentTime - currentPosition) > 0.5) {
					console.log(
						`Adjusting time from ${audio.currentTime.toFixed(2)} to ${currentPosition.toFixed(2)}`,
					);
					try {
						audio.currentTime = currentPosition;
					} catch (error) {
						console.error("Error adjusting time during transfer:", error);
					}
				}

				// Ensure play state is maintained
				if (wasPlaying && audio.paused) {
					console.log("Audio was playing but is paused, resuming");
					const playPromise = audio.play();
					if (playPromise !== undefined) {
						playPromise.catch((error) => {
							console.error("Error resuming during transfer:", error);
							setIsPlaying(false);
						});
					}
				} else if (!wasPlaying && !audio.paused) {
					console.log("Audio was paused but is playing, pausing");
					audio.pause();
				}
			}
		},
		[activeSource, currentTrack, isPlaying, currentTime],
	);

	// Play previous track in queue
	const previousTrack = useCallback(() => {
		const currentPosition = getQueuePosition();

		// If not in queue or at the beginning, restart current track
		if (currentPosition <= 0) {
			setCurrentTime(0);
			const audio = audioRef.current;
			if (audio) {
				audio.currentTime = 0;
			}
			return;
		}

		// Play previous track
		const prevTrack = queue[currentPosition - 1];
		setCurrentTrack(prevTrack);
		setCurrentTime(0);
		setDuration(0);
		setIsPlaying(true);
	}, [queue, getQueuePosition]);

	// Skip to a specific track in the queue
	const skipToTrack = useCallback(
		(trackId: string) => {
			const trackIndex = queue.findIndex((track) => track.id === trackId);
			if (trackIndex === -1) return;

			const track = queue[trackIndex];
			setCurrentTrack(track);
			setCurrentTime(0);
			setDuration(0);
			setIsPlaying(true);
		},
		[queue],
	);

	// Clear the queue
	const clearQueue = useCallback(() => {
		setQueue([]);
	}, []);

	// Seek to a specific time
	const seekTo = useCallback((time: number) => {
		const audio = audioRef.current;
		if (!audio) return;

		console.log(`Seeking to ${time.toFixed(2)} seconds`);

		// Mark that we're in a seeking operation to block timeupdate events
		isSeekingRef.current = true;

		// Ignore time updates for a period to prevent UI flickering during seek
		ignoreTimeUpdatesUntilRef.current = Date.now() + 500;

		// Remember playback state
		const wasPlaying = !audio.paused;
		pendingPlaybackRef.current = wasPlaying;

		try {
			// Update state first for immediate UI feedback
			const boundedTime = Math.max(0, Math.min(time, audio.duration || 0));
			setCurrentTime(boundedTime);

			// Pause briefly to avoid stuttering during seek
			if (wasPlaying) {
				audio.pause();
			}

			// Update audio element position
			audio.currentTime = boundedTime;

			// Clear seeking state and resume playback after a delay
			setTimeout(() => {
				isSeekingRef.current = false;

				// Resume playback smoothly after a short delay if needed
				if (wasPlaying) {
					setTimeout(() => {
						const playPromise = audio.play();
						if (playPromise) {
							playPromise.catch((error) => {
								console.error("Error resuming after seek:", error);
								setIsPlaying(false);
							});
						}
					}, 50);
				}
			}, 150);
		} catch (error) {
			console.error("Error during seek:", error);
			isSeekingRef.current = false;

			// Try to recover playback state
			if (pendingPlaybackRef.current && audio.paused) {
				audio.play().catch(() => {
					setIsPlaying(false);
				});
			}
		}
	}, []);

	// Start scrubbing operation
	const startScrubbing = useCallback((previewTime: number) => {
		console.log(`Starting scrub at ${previewTime} seconds`);

		const audio = audioRef.current;
		if (!audio) return;

		// Remember if we were playing before scrubbing
		const wasPlaying = !audio.paused;
		wasPlayingBeforeScrubRef.current = wasPlaying;

		// Mark that we're scrubbing
		isSeekingRef.current = true;
		setIsScrubbing(true);

		// Update UI immediately for responsive feedback
		setCurrentTime(previewTime);

		// Chrome works best if we maintain the playing state during scrubbing
		// instead of pausing/playing which can cause flicker

		// Update audio element for preview
		try {
			const boundedTime = Math.max(
				0,
				Math.min(previewTime, audio.duration || 0),
			);
			audio.currentTime = boundedTime;
		} catch (error) {
			console.warn("Could not update currentTime during scrubbing:", error);
		}
	}, []);

	// End scrubbing operation
	const endScrubbing = useCallback((finalTime: number) => {
		console.log(
			`Ending scrub at ${finalTime} seconds, was playing: ${wasPlayingBeforeScrubRef.current}`,
		);

		const audio = audioRef.current;
		if (!audio) {
			setIsScrubbing(false);
			isSeekingRef.current = false;
			return;
		}

		// Apply the final position
		try {
			const boundedTime = Math.max(0, Math.min(finalTime, audio.duration || 0));
			audio.currentTime = boundedTime;
			setCurrentTime(boundedTime);
		} catch (error) {
			console.error("Error setting time at end of scrub:", error);
		}

		// Clear scrubbing state - we do this first to avoid race conditions
		setIsScrubbing(false);
		isSeekingRef.current = false;

		// Clear seeking flag immediately to allow timeupdate events
		// No need to adjust playback state - maintain what was playing before
	}, []);

	// Provide direct access to the audio element for direct manipulation
	const getAudioElement = useCallback(() => {
		return audioRef.current;
	}, []);

	// Expose the context
	return (
		<AudioContext.Provider
			value={{
				// State
				currentTrack,
				isPlaying,
				currentTime,
				duration,
				activeSource,
				queue,
				isScrubbing,

				// Actions
				playTrack,
				playTrackInQueue,
				pauseTrack,
				resumeTrack,
				togglePlayPause,
				nextTrack,
				previousTrack,
				skipToTrack,
				clearQueue,

				// Time control
				seekTo,
				startScrubbing,
				endScrubbing,

				// Audio element access
				getAudioElement,

				// Source management
				setActiveSource: changeActiveSource,
				isSourceActive,
				transferControlTo,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	return useContext(AudioContext);
}
