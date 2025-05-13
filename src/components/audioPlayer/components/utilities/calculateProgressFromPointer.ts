type PointerPosition = { clientX: number; clientY: number };
// Utility to calculate relative pointer movement (0–100%) across an element
export const calculateProgressFromPointer = (
  pointerEvent: PointerPosition,
  containerElement: HTMLElement,
): number => {
  const rect = containerElement.getBoundingClientRect();
  let positionX = pointerEvent.clientX - rect.left;

  // Constrain to bounds (0-100%)
  positionX = Math.max(0, Math.min(positionX, rect.width));

  // Calculate percentage
  return positionX / rect.width;
};
