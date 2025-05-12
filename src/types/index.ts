
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string; // URL to an image
  videoSrc: string; // URL to the video file (can be objectURL for local files or remote URL)
  uploadedAt?: string; // ISO date string
  duration?: string; // e.g., "1h 23m" or "45m"
  dataAiHint?: string; // for placeholder images
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  password?: string; // **INSECURE**: Only for local storage demo. Do NOT store plain text passwords in real applications.
}
