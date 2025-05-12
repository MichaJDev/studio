// src/components/video/VideoPlayer.tsx
"use client";

interface VideoPlayerProps {
  src: string;
  title: string;
  autoplay?: boolean;
  subtitleSrc?: string; // Optional subtitle source URL/path
}

export default function VideoPlayer({ src, title, autoplay = true, subtitleSrc }: VideoPlayerProps) {
  // Note: The subtitleSrc path must be accessible by the browser.
  // For local files simulated here (e.g., /Subtitle_files/...), this won't work directly
  // unless the Next.js server is configured to serve these static files under those paths.
  // A real implementation would likely involve serving subtitles from a public URL or API endpoint.

  return (
    <div className="w-full h-full aspect-video bg-black overflow-hidden">
      <video
        controls
        crossOrigin="anonymous" // Required for loading tracks from different origins if applicable
        className="w-full h-full"
        src={src}
        title={title}
        autoPlay={autoplay}
        preload="metadata" // Good for loading metadata quickly
      >
        {subtitleSrc && (
          <track
            label="English" // Consider making label dynamic if language is known
            kind="subtitles"
            srcLang="en" // Consider making srcLang dynamic
            src={subtitleSrc}
            default // Make subtitles default if present
          />
        )}
        Your browser does not support the video tag or the subtitle format. Consider upgrading to a modern browser.
      </video>
    </div>
  );
}
