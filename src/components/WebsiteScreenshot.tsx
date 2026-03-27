import React, { useEffect, useState } from 'react';
import { delayRender, continueRender, useVideoConfig, Img } from 'remotion';

interface WebsiteScreenshotProps {
  url: string;
  fullPage?: boolean;
  className?: string;
  containerStyle?: 'browser' | 'card' | 'none';
}

export const WebsiteScreenshot: React.FC<WebsiteScreenshotProps> = ({ 
  url, 
  fullPage = false,
  className = '',
  containerStyle = 'browser'
}) => {
  const [handle] = useState(() => delayRender("Fetching screenshot"));
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useVideoConfig();

  useEffect(() => {
    const fetchScreenshot = async () => {
      try {
        // We calculate the desired viewport based on the Remotion composition.
        // For a browser mockup, we might want to subtract the header height,
        // but for simplicity, we request the full composition size.
        const response = await fetch('/api/screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            width,
            height,
            fullPage,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch screenshot');
        }

        const data = await response.json();
        setImageSrc(data.image);
      } catch (err: any) {
        console.error("Screenshot capture failed:", err);
        setError(err.message);
      } finally {
        continueRender(handle);
      }
    };

    fetchScreenshot();
  }, [url, width, height, fullPage, handle]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 p-4 ${className}`}>
        <p>Error loading screenshot: {error}</p>
      </div>
    );
  }

  if (!imageSrc) {
    return null; // Still loading, Remotion will wait due to delayRender
  }

  // Render the image based on the chosen container style
  if (containerStyle === 'browser') {
    return (
      <div className={`flex flex-col rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl ${className}`}>
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-950 border-b border-neutral-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-neutral-900 text-neutral-400 text-xs px-4 py-1 rounded-md max-w-sm truncate flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              {url.replace(/^https?:\/\//, '')}
            </div>
          </div>
        </div>
        {/* Browser Content */}
        <div className="relative flex-1 bg-white overflow-hidden">
          <Img 
            src={imageSrc} 
            className="w-full h-full object-cover object-top"
            alt={`Screenshot of ${url}`}
          />
        </div>
      </div>
    );
  }

  if (containerStyle === 'card') {
    return (
      <div className={`rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 ${className}`}>
        <Img 
          src={imageSrc} 
          className="w-full h-full object-cover object-top"
          alt={`Screenshot of ${url}`}
        />
      </div>
    );
  }

  // Default: no container
  return (
    <Img 
      src={imageSrc} 
      className={`w-full h-full object-cover object-top ${className}`}
      alt={`Screenshot of ${url}`}
    />
  );
};
