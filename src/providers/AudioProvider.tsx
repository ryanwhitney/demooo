// AudioContext.tsx
import type { Track } from "@/types/track";
import { createContext, useContext, useState, type ReactNode } from "react";

// Define the type for our context value
interface AudioContextType {
	currentTrack: Track | null;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	playTrack: (track: Track) => void;
	pauseTrack: () => void;
	resumeTrack: () => void;
	setCurrentTime: (time: number) => void;
	setDuration: (duration: number) => void;
}

// Create context with a default value matching the interface
const AudioContext = createContext<AudioContextType>({
	currentTrack: null,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	playTrack: () => {},
	pauseTrack: () => {},
	resumeTrack: () => {},
	setCurrentTime: () => {},
	setDuration: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
	const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const playTrack = (track: Track) => {
		alert("Playing track");
		setCurrentTrack(track);
		setIsPlaying(true);
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
				playTrack,
				pauseTrack,
				resumeTrack,
				setCurrentTime,
				setDuration,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	return useContext(AudioContext);
}
