// Base path configuration for GitHub Pages deployment
// This ensures all paths work correctly both locally and on GitHub Pages

export const BASE_PATH = import.meta.env.BASE_URL;

// Developer toggle for showing resume links in 2025 data
// Set to true to show resume links, false to hide them (shows "-" instead)
export const SHOW_RESUME_LINKS_2025 = false;

// Helper to get the correct asset path
export function getAssetPath(path: string): string {
  // Remove leading slash if present, then prepend BASE_PATH
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_PATH}${cleanPath}`;
}
