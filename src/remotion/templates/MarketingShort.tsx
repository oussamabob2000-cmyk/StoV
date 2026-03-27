import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { MarketingShortProps } from '../types';

export const MarketingShort: React.FC<MarketingShortProps> = ({
  campaignHeadline,
  callToAction,
  websiteUrl,
  promoVideoUrl,
  title = "Special Offer",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 1.2,
    to: 1,
    config: { damping: 12 },
  });

  const translateY = spring({
    frame: frame - 15,
    fps,
    from: 100,
    to: 0,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill className="bg-rose-600 flex flex-col items-center justify-center p-12 font-sans overflow-hidden">
      {promoVideoUrl && (
        <AbsoluteFill className="opacity-40 mix-blend-overlay">
          <video 
            src={promoVideoUrl} 
            className="w-full h-full object-cover" 
            autoPlay 
            muted 
            loop 
          />
        </AbsoluteFill>
      )}
      
      <div 
        className="z-10 flex flex-col items-center text-center w-full max-w-lg"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-lg font-bold tracking-widest uppercase mb-12 border border-white/30 shadow-xl">
          {title}
        </div>
        
        <h1 className="text-7xl font-black text-white mb-16 leading-[1.1] drop-shadow-2xl">
          {campaignHeadline}
        </h1>
        
        <div 
          className="w-full bg-white text-rose-600 py-6 rounded-3xl text-3xl font-black shadow-2xl shadow-rose-900/50 uppercase tracking-wide"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {callToAction}
        </div>
        
        <p className="mt-8 text-white/80 text-xl font-medium tracking-widest uppercase">
          {websiteUrl}
        </p>
      </div>
    </AbsoluteFill>
  );
};
