// Saved to database jsonb, but we pull it in as a string due to type issues.
// This restores it to an object we can map on.

export const parseWaveformData = (
  waveformString: string | null | undefined,
): number[] => {
  if (!waveformString) {
    return [];
  }
  const numbers = waveformString.match(/\d+(?:\.\d+)?/g);
  return numbers ? numbers.map((n) => Number.parseFloat(n)) : [];
};
