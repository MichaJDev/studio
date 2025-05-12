
export interface Video {
  id: string;
  title: string; // Beautified title
  description: string;
  thumbnailUrl: string; // URL to an image
  videoSrc: string; // Path or URL to video file
  subtitleSrc?: string; // Path or URL to subtitle file
  uploadedAt?: string; // Keep for sorting uploads and identifying recent items
  duration?: string; // e.g., "1h 23m" or "45m"
  dataAiHint?: string; // for placeholder images

  // New fields from scanning/uploads
  type: 'movie' | 'show' | 'upload'; // Distinguish scanned from uploaded
  originalFilename?: string; // Keep the original filename for reference
  quality?: string; // e.g., "1080p", "720p"
  year?: number; // e.g., 2023

  // Show specific fields
  showName?: string; // Original show name if different from title
  season?: number; // e.g., 1
  episode?: number; // e.g., 1
  episodeTitle?: string; // e.g., "Pilot Episode"

  // Player enhancement fields
  introEndTimeInSeconds?: number; // e.g., 85 (for 1m 25s intro)
  durationInSeconds?: number; // e.g., 2700 (for 45m duration)
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  password?: string; // **INSECURE**: Only for local storage demo. Do NOT store plain text passwords in real applications.
}

