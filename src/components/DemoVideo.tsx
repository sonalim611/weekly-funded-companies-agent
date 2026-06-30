interface DemoVideoProps {
  src?: string;
}

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
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

export function DemoVideo({ src }: DemoVideoProps) {
  const embedUrl = src ? toEmbedUrl(src) : null;

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden border border-card-border bg-card shadow-card">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="StartWithStartup demo"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : src ? (
        <video
          src={src}
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-cover bg-black"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-50 to-white px-6 text-center">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-foreground">30-second product demo</p>
            <p className="text-sm text-muted mt-1">
              Add your video URL to <code className="text-accent">NEXT_PUBLIC_DEMO_VIDEO_URL</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
