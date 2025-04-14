// Sample a fixed number of items from an array
//
// Example
// const data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
// const samples = evenSample(data, 4);
// Result: [0.1, 0.3, 0.6, 0.8]

export function arraySample({array, sampleCount}:{array: number[], sampleCount: number}): number[] {
  const result: number[] = [];
  const ratio = array.length / sampleCount;
  
  for (let i = 0; i < sampleCount; i++) {
    const index = Math.floor(i * ratio);
    result.push(array[index]);
  }
  return result;
}