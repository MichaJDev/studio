// src/components/video/VideoPlayer.tsx
"use client";

interface VideoPlayerProps {
  src: string;
  title: string;
  autoplay?: boolean;
}

export default function VideoPlayer({ src, title, autoplay = true }: VideoPlayerProps) {
  return (
    <div className="w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden">
      <video
        controls
        className="w-full h-full"
        src={src}
        title={title}
        autoPlay={autoplay}
        preload="metadata" // Good for loading metadata quickly
      >
        Your browser does not support the video tag. Consider upgrading to a modern browser.
      </video>
    </div>
  );
}
