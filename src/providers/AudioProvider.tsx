// AudioContext.tsx
import type { Track } from "@/types/track";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type PlayerSource = "global" | "track-view";

// Define the type for our context value
interface AudioContextType {
	currentTrack: Track | null;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	activeSource: PlayerSource | null;
	queue: Track[];
	playTrack: (track: Track, source: PlayerSource) => void;
	playTrackInQueue: (track: Track, queueTracks: Track[], source: PlayerSource) => void;
	pauseTrack: () => void;
	resumeTrack: () => void;
	nextTrack: () => void;
	previousTrack: () => void;
	skipToTrack: (trackId: string) => void;
	clearQueue: () => void;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
	setIsPlaying: (isPlaying: boolean) => void;
	getQueuePosition: () => number;
}

// Create context with a default value matching the interface
const AudioContext = createContext<AudioContextType>({
	currentTrack: null,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	activeSource: null,
	queue: [],
	playTrack: () => {},
	playTrackInQueue: () => {},
	pauseTrack: () => {},
	resumeTrack: () => {},
	nextTrack: () => {},
	previousTrack: () => {},
	skipToTrack: () => {},
	clearQueue: () => {},
	setCurrentTime: () => {},
	setDuration: () => {},
	setIsPlaying: () => {},
	getQueuePosition: () => -1,
});

export function AudioProvider({ children }: { children: ReactNode }) {
	const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [activeSource, setActiveSource] = useState<PlayerSource | null>(null);
	const [queue, setQueue] = useState<Track[]>([]);
	
	// Simple play method for individual tracks (clears queue)
	const playTrack = useCallback((track: Track, source: PlayerSource) => {
		// If it's the same track from the same source, just resume
		if (currentTrack?.id === track.id && activeSource === source) {
			setIsPlaying(true);
			return;
		}

		// If we're switching sources or tracks, reset state and clear queue
		setCurrentTrack(track);
		setActiveSource(source);
		setIsPlaying(true);
		setCurrentTime(0);
		setDuration(0);
		setQueue([]);
	}, [currentTrack?.id, activeSource]);

	// Play a track and set up a queue
	const playTrackInQueue = useCallback((track: Track, queueTracks: Track[], source: PlayerSource) => {
		// Set the new queue
		setQueue(queueTracks);
		
		// Find the index of the selected track in the queue
		const trackIndex = queueTracks.findIndex(t => t.id === track.id);
		
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
	}, [playTrack]);

	const pauseTrack = useCallback(() => {
		setIsPlaying(false);
	}, []);

	const resumeTrack = useCallback(() => {
		setIsPlaying(true);
	}, []);
	
	// Get current position in queue
	const getQueuePosition = useCallback(() => {
		if (!currentTrack || queue.length === 0) return -1;
		return queue.findIndex(track => track.id === currentTrack.id);
	}, [currentTrack, queue]);
	
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
	
	// Play previous track in queue
	const previousTrack = useCallback(() => {
		const currentPosition = getQueuePosition();
		
		// If not in queue or at the beginning, restart current track
		if (currentPosition <= 0) {
			setCurrentTime(0);
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
	const skipToTrack = useCallback((trackId: string) => {
		const trackIndex = queue.findIndex(track => track.id === trackId);
		if (trackIndex === -1) return;
		
		const track = queue[trackIndex];
		setCurrentTrack(track);
		setCurrentTime(0);
		setDuration(0);
		setIsPlaying(true);
	}, [queue]);
	
	// Clear the queue
	const clearQueue = useCallback(() => {
		setQueue([]);
	}, []);

	return (
		<AudioContext.Provider
			value={{
				currentTrack,
				isPlaying,
				currentTime,
				duration,
				activeSource,
				queue,
				playTrack,
				playTrackInQueue,
				pauseTrack,
				resumeTrack,
				nextTrack,
				previousTrack,
				skipToTrack,
				clearQueue,
				setCurrentTime,
				setDuration,
				setIsPlaying,
				getQueuePosition,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	return useContext(AudioContext);
}
