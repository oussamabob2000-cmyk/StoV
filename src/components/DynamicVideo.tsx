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

// Kinetic Text Component
const KineticText: React.FC<{ text: string; frame: number; fps: number; primaryColor: string; fontFamily: string }> = ({ text, frame, fps, primaryColor, fontFamily }) => {
  const words = text.toUpperCase().split(' ');
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
      {words.map((word, i) => {
        const delay = i * 4;
        const wordEntrance = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, stiffness: 200, mass: 0.5 },
        });
        
        const y = interpolate(wordEntrance, [0, 1], [50, 0]);
        const opacity = interpolate(wordEntrance, [0, 1], [0, 1]);
        const scale = interpolate(wordEntrance, [0, 1], [0.5, 1]);
        const isHighlight = i % 2 !== 0;
        
        return (
          <span key={i} style={{ 
            display: 'inline-block', 
            transform: `translateY(${y}px) scale(${scale})`, 
            opacity,
            color: isHighlight ? primaryColor : 'white',
            fontFamily: `${fontFamily}, sans-serif`,
            fontSize: '110px',
            fontWeight: 900,
            lineHeight: 1.1,
            textShadow: '0 15px 30px rgba(0,0,0,0.8)'
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Dynamic Background Component
const DynamicBackground: React.FC<{ frame: number; primaryColor: string; bgColor: string; width: number; height: number }> = ({ frame, primaryColor, bgColor, width, height }) => {
  const moveX = Math.sin(frame / 60) * 300;
  const moveY = Math.cos(frame / 60) * 300;
  
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${primaryColor}60 0%, transparent 70%)`,
        top: -width/2 + moveY,
        left: -width/2 + moveX,
        filter: 'blur(100px)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.04) 2px, transparent 2px)`,
        backgroundSize: '80px 80px',
        backgroundPosition: `${(frame * 2) % 80}px ${(frame * 2) % 80}px`,
      }} />
    </AbsoluteFill>
  );
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

const CenterLayout = ({ scene, frame, fps, entrance, fadeOut, Icon, fontFamily, primaryColor, bgColor, width, height }: any) => {
  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subtitleY = interpolate(frame, [25, 45], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: fadeOut }}>
      <DynamicBackground frame={frame} primaryColor={primaryColor} bgColor={bgColor} width={width} height={height} />
      
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80%' }}>
        <KineticText text={scene.title} frame={frame} fps={fps} primaryColor={primaryColor} fontFamily={fontFamily} />
        
        <p style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontSize: '45px', 
          color: 'rgba(255,255,255,0.9)', 
          marginTop: '40px', 
          opacity: subtitleOpacity, 
          transform: `translateY(${subtitleY}px)`,
          textAlign: 'center', 
          fontWeight: 600,
          textShadow: '0 5px 15px rgba(0,0,0,0.6)'
        }}>
          {scene.subtitle}
        </p>
      </div>
      
      {/* Progress Bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '12px', backgroundColor: primaryColor, width: `${(frame / scene.durationInFrames) * 100}%` }} />
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
