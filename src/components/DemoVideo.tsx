"use client";

import { useEffect, useRef, useState } from "react";

interface DemoVideoProps {
  src?: string;
  poster?: string;
}

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url, "https://placeholder.local");
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "loom.com") {
      return url.replace("/share/", "/embed/");
    }

    return null;
  } catch {
    return null;
  }
}

function isFileVideo(src: string): boolean {
  return !toEmbedUrl(src);
}

function inferPosterFromVideo(src: string): string | undefined {
  if (/\.mp4$/i.test(src)) {
    return src.replace(/\.mp4$/i, "-poster.jpg");
  }
  return undefined;
}

function captureVideoFrame(video: HTMLVideoElement): string | null {
  if (!video.videoWidth || !video.videoHeight) return null;

  const maxWidth = 960;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return null;

  context.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function DemoVideo({ src, poster }: DemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const staticPoster = poster ?? (src ? inferPosterFromVideo(src) : undefined);

  const [posterUrl, setPosterUrl] = useState(staticPoster ?? "");
  const [staticPosterFailed, setStaticPosterFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!staticPoster);

  const embedUrl = src ? toEmbedUrl(src) : null;
  const fileVideo = src ? isFileVideo(src) : false;

  useEffect(() => {
    setPosterUrl(staticPoster ?? "");
    setStaticPosterFailed(false);
    setShouldLoadVideo(!staticPoster);
    setIsPlaying(false);
  }, [staticPoster, src]);

  useEffect(() => {
    if (!fileVideo || !src || posterUrl || staticPoster) return;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          if (!cancelled) setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [fileVideo, posterUrl, src, staticPoster]);

  useEffect(() => {
    if (!shouldLoadVideo || !fileVideo || !src || posterUrl || staticPoster) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const capture = () => {
      const dataUrl = captureVideoFrame(video);
      if (!cancelled && dataUrl) {
        setPosterUrl(dataUrl);
      }
    };

    const onLoadedData = () => {
      if (video.currentTime < 0.1) {
        video.currentTime = 0.1;
        return;
      }
      capture();
    };

    const onSeeked = () => {
      capture();
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onSeeked);

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [fileVideo, posterUrl, shouldLoadVideo, src, staticPoster]);

  async function handlePlayClick() {
    const video = videoRef.current;
    if (!video || !src) return;

    setShouldLoadVideo(true);
    setIsPlaying(true);

    if (video.readyState < 2) {
      video.load();
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        const onReady = () => {
          video.removeEventListener("loadeddata", onReady);
          resolve();
        };
        video.addEventListener("loadeddata", onReady);
      });
    }

    void video.play();
  }

  const hasPosterImage = Boolean(posterUrl && !staticPosterFailed);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden border border-card-border bg-card shadow-card"
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="StartWithStartup demo"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : src ? (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={hasPosterImage ? posterUrl : undefined}
            controls={isPlaying}
            playsInline
            preload={hasPosterImage && !isPlaying ? "none" : shouldLoadVideo ? "metadata" : "none"}
            className={`absolute inset-0 w-full h-full object-cover bg-background ${
              isPlaying ? "" : "opacity-0 pointer-events-none"
            }`}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {!isPlaying && (
            <button
              type="button"
              onClick={() => void handlePlayClick()}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="Play demo video"
            >
              {hasPosterImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => {
                    setStaticPosterFailed(true);
                    setPosterUrl("");
                    setShouldLoadVideo(true);
                  }}
                />
              ) : (
                <span className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white" aria-hidden="true" />
              )}

              <span className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

              <span className="relative w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-50 to-white px-6 text-center">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-foreground">15-second product demo</p>
            <p className="text-sm text-muted mt-1">
              Add your video URL to <code className="text-accent">NEXT_PUBLIC_DEMO_VIDEO_URL</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
