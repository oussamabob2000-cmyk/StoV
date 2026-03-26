import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import * as LucideIcons from 'lucide-react';

export type Scene = {
  layout?: 'center' | 'split' | 'mockup' | 'data';
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  bgColor?: string;
  durationInFrames: number;
  dataValue?: number;
  dataLabel?: string;
};

export const DynamicVideo: React.FC<{ scenes: Scene[], fontFamily?: string }> = ({ scenes, fontFamily = 'Anton' }) => {
  const { fps } = useVideoConfig();

  let currentStartFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden' }}>
      {scenes.map((scene, index) => {
        const startFrame = currentStartFrame;
        currentStartFrame += scene.durationInFrames;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={scene.durationInFrames}
          >
            <SceneComponent scene={scene} index={index} fontFamily={fontFamily} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneComponent: React.FC<{ scene: Scene; index: number; fontFamily: string }> = ({ scene, index, fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const layout = scene.layout || 'center';
  const primaryColor = scene.color || '#3b82f6';
  const bgColor = scene.bgColor || '#0f172a';

  // Common animations
  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const fadeOut = interpolate(
    frame,
    [scene.durationInFrames - 15, scene.durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const Icon = (LucideIcons as any)[scene.iconName] || LucideIcons.Star;

  if (layout === 'split') {
    return <SplitLayout scene={scene} frame={frame} fps={fps} width={width} height={height} entrance={entrance} fadeOut={fadeOut} Icon={Icon} fontFamily={fontFamily} primaryColor={primaryColor} bgColor={bgColor} />;
  }
  if (layout === 'mockup') {
    return <MockupLayout scene={scene} frame={frame} fps={fps} width={width} height={height} entrance={entrance} fadeOut={fadeOut} Icon={Icon} fontFamily={fontFamily} primaryColor={primaryColor} bgColor={bgColor} />;
  }
  if (layout === 'data') {
    return <DataLayout scene={scene} frame={frame} fps={fps} width={width} height={height} entrance={entrance} fadeOut={fadeOut} Icon={Icon} fontFamily={fontFamily} primaryColor={primaryColor} bgColor={bgColor} />;
  }

  return <CenterLayout scene={scene} frame={frame} fps={fps} width={width} height={height} entrance={entrance} fadeOut={fadeOut} Icon={Icon} fontFamily={fontFamily} primaryColor={primaryColor} bgColor={bgColor} />;
};

// --- Layout Components ---

const CenterLayout = ({ scene, frame, fps, entrance, fadeOut, Icon, fontFamily, primaryColor, bgColor }: any) => {
  const titleY = interpolate(entrance, [0, 1], [100, 0]);
  const titleOpacity = interpolate(entrance, [0, 1], [0, 1]);
  
  const iconScale = spring({ frame: frame - 5, fps, config: { damping: 10, stiffness: 120 } });
  const subtitleOpacity = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', opacity: fadeOut }}>
      <div style={{ transform: `scale(${iconScale})`, marginBottom: '40px', backgroundColor: primaryColor, padding: '40px', borderRadius: '50%', boxShadow: `0 20px 50px ${primaryColor}80` }}>
        <Icon size={120} color={bgColor} strokeWidth={2.5} />
      </div>
      <h1 style={{ fontFamily: `${fontFamily}, sans-serif`, fontSize: '120px', lineHeight: 1.1, color: 'white', textTransform: 'uppercase', margin: 0, transform: `translateY(${titleY}px)`, opacity: titleOpacity, textAlign: 'center', textShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: '80%' }}>
        {scene.title}
      </h1>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '40px', color: 'rgba(255,255,255,0.8)', marginTop: '30px', opacity: subtitleOpacity, textAlign: 'center', maxWidth: '70%', fontWeight: 500 }}>
        {scene.subtitle}
      </p>
    </AbsoluteFill>
  );
};

const SplitLayout = ({ scene, frame, fps, width, height, entrance, fadeOut, Icon, fontFamily, primaryColor, bgColor }: any) => {
  const slideIn = spring({ frame, fps, config: { damping: 14 } });
  const leftX = interpolate(slideIn, [0, 1], [-width / 2, 0]);
  const rightX = interpolate(slideIn, [0, 1], [width / 2, 0]);

  return (
    <AbsoluteFill style={{ flexDirection: 'row', opacity: fadeOut, backgroundColor: '#000' }}>
      <div style={{ flex: 1, backgroundColor: bgColor, transform: `translateX(${leftX}px)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px' }}>
        <h1 style={{ fontFamily: `${fontFamily}, sans-serif`, fontSize: '100px', lineHeight: 1.1, color: 'white', textTransform: 'uppercase', margin: 0 }}>
          {scene.title}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '36px', color: 'rgba(255,255,255,0.7)', marginTop: '20px' }}>
          {scene.subtitle}
        </p>
      </div>
      <div style={{ flex: 1, backgroundColor: primaryColor, transform: `translateX(${rightX}px)`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${interpolate(slideIn, [0, 1], [0.5, 1])})` }}>
           <Icon size={200} color={bgColor} strokeWidth={2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MockupLayout = ({ scene, frame, fps, entrance, fadeOut, Icon, fontFamily, primaryColor, bgColor }: any) => {
  const mockupY = interpolate(entrance, [0, 1], [200, 0]);
  const mockupOpacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', opacity: fadeOut }}>
      <div style={{ position: 'absolute', top: '100px', textAlign: 'center', zIndex: 10 }}>
        <h1 style={{ fontFamily: `${fontFamily}, sans-serif`, fontSize: '80px', color: 'white', margin: 0, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{scene.title}</h1>
      </div>
      
      <div style={{ 
        width: '800px', height: '500px', backgroundColor: 'white', borderRadius: '24px', 
        transform: `translateY(${mockupY}px)`, opacity: mockupOpacity,
        boxShadow: `0 40px 100px rgba(0,0,0,0.4), 0 0 0 4px ${primaryColor}40`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden', marginTop: '80px'
      }}>
        <div style={{ height: '60px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#eab308' }} />
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', backgroundColor: '#ffffff' }}>
          <Icon size={100} color={primaryColor} style={{ marginBottom: '30px' }} />
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '48px', color: '#0f172a', margin: 0, textAlign: 'center', fontWeight: 700 }}>{scene.subtitle}</h2>
          <div style={{ marginTop: '40px', padding: '20px 60px', backgroundColor: primaryColor, color: 'white', borderRadius: '100px', fontSize: '32px', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            Get Started
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DataLayout = ({ scene, frame, fps, entrance, fadeOut, Icon, fontFamily, primaryColor, bgColor }: any) => {
  const targetValue = scene.dataValue || 85;
  const animatedValue = interpolate(frame, [15, 45], [0, targetValue], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', opacity: fadeOut, padding: '100px' }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '60px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: `${fontFamily}, sans-serif`, fontSize: '90px', lineHeight: 1.1, color: 'white', textTransform: 'uppercase', margin: 0 }}>
            {scene.title}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '36px', color: 'rgba(255,255,255,0.7)', marginTop: '20px' }}>
            {scene.subtitle}
          </p>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="30" />
              <circle cx="150" cy="150" r="130" fill="none" stroke={primaryColor} strokeWidth="30" 
                strokeDasharray={`${2 * Math.PI * 130}`} 
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - animatedValue / 100)}`} 
                strokeLinecap="round"
              />
            </svg>
            <div style={{ fontFamily: `${fontFamily}, sans-serif`, fontSize: '80px', color: 'white', display: 'flex', alignItems: 'baseline' }}>
              {Math.round(animatedValue)}<span style={{ fontSize: '40px', color: primaryColor }}>%</span>
            </div>
          </div>
          {scene.dataLabel && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '32px', color: 'white', marginTop: '30px', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 30px', borderRadius: '100px' }}>
              {scene.dataLabel}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
