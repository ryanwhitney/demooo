// AudioContext.tsx
import type { Track } from "@/types/track";
import { createContext, useContext, useState, type ReactNode } from "react";

type PlayerSource = "global" | "track-view";

// Define the type for our context value
interface AudioContextType {
	currentTrack: Track | null;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	activeSource: PlayerSource | null;
	playTrack: (track: Track, source: PlayerSource) => void;
	pauseTrack: () => void;
	resumeTrack: () => void;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
	setIsPlaying: (isPlaying: boolean) => void;
}

// Create context with a default value matching the interface
const AudioContext = createContext<AudioContextType>({
	currentTrack: null,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	activeSource: null,
	playTrack: () => {},
	pauseTrack: () => {},
	resumeTrack: () => {},
	setCurrentTime: () => {},
	setDuration: () => {},
	setIsPlaying: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
	const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [activeSource, setActiveSource] = useState<PlayerSource | null>(null);

	const playTrack = (track: Track, source: PlayerSource) => {
		// If it's the same track from the same source, just resume
		if (currentTrack?.id === track.id && activeSource === source) {
			setIsPlaying(true);
			return;
		}

		// If we're switching sources or tracks, reset state
		setCurrentTrack(track);
		setActiveSource(source);
		setIsPlaying(true);
		setCurrentTime(0);
		setDuration(0);
	};

	const pauseTrack = () => {
		setIsPlaying(false);
	};

	const resumeTrack = () => {
		setIsPlaying(true);
	};

	return (
		<AudioContext.Provider
			value={{
				currentTrack,
				isPlaying,
				currentTime,
				duration,
				activeSource,
				playTrack,
				pauseTrack,
				resumeTrack,
				setCurrentTime,
				setDuration,
				setIsPlaying,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	return useContext(AudioContext);
}
