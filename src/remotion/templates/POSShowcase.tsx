import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { POSShowcaseProps } from '../types';

export const POSShowcase: React.FC<POSShowcaseProps> = ({
  productName,
  price,
  features,
  productImageUrl,
  title = "New Arrival",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 14 },
  });

  return (
    <AbsoluteFill className="bg-zinc-950 flex flex-row items-center justify-center p-16 font-sans text-white">
      <div className="flex-1 flex items-center justify-center h-full pr-12 border-r border-zinc-800">
        <div 
          className="w-full max-w-2xl aspect-square bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-800"
          style={{ transform: `scale(${scale})` }}
        >
          {productImageUrl && (
            <Img src={productImageUrl} className="w-full h-full object-cover" />
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center pl-16">
        <div className="inline-block bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase mb-6 w-max border border-emerald-500/30">
          {title}
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
          {productName}
        </h1>
        
        <div className="text-5xl font-light text-zinc-400 mb-12 flex items-baseline gap-2">
          <span className="text-3xl">$</span>{price.toFixed(2)}
        </div>
        
        <div className="space-y-6">
          {features.map((feature, idx) => {
            const featureOpacity = spring({
              frame: frame - (idx * 10),
              fps,
              config: { damping: 12 },
            });
            
            return (
              <div 
                key={idx} 
                className="flex items-center gap-4 text-2xl text-zinc-300"
                style={{ opacity: featureOpacity }}
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {feature}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
