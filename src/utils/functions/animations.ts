/**
 * Function to calculate waterfall delay based on item position in grid
 * This creates a cascading effect for animations
 * that flows from top-left to bottom-right.
 * 
 * @param index 
 * @returns 
 */
export function calculateWaterfallDelay(index: number): number {
  let columnsCount = 1;
  if (typeof window !== "undefined") {
    if (window.innerWidth >= 1024) columnsCount = 3; // lg breakpoint
    else if (window.innerWidth >= 768) columnsCount = 2; // md breakpoint
  }

  const row = Math.floor(index / columnsCount);
  const col = index % columnsCount;

  const baseDelay = 0.4;
  const rowDelay = row * 0.25;
  const colDelay = col * 0.12;

  return baseDelay + rowDelay + colDelay;
}