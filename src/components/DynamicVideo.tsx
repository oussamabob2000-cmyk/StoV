import React from 'react';
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as Icons from 'lucide-react';

export type Scene = {
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  durationInFrames: number;
};

export const DynamicVideo: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  let currentStartFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden' }}>
      {/* Dynamic Background */}
      <DynamicBackground />

      {scenes.map((scene, index) => {
        const startFrame = currentStartFrame;
        currentStartFrame += scene.durationInFrames;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={scene.durationInFrames}
          >
            <SceneComponent scene={scene} index={index} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const DynamicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.5;
  const scale = 1 + Math.sin(frame / 30) * 0.1;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: '150%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(0,255,204,0.15) 0%, rgba(5,5,5,1) 60%)',
          transform: `rotate(${rotation}deg) scale(${scale})`,
          filter: 'blur(80px)',
        }}
      />
    </AbsoluteFill>
  );
};

const SceneComponent: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleY = spring({ frame, fps, config: { damping: 12 }, from: 100, to: 0 });
  const titleOpacity = spring({ frame, fps, config: { damping: 12 }, from: 0, to: 1 });
  
  const subY = spring({ frame: frame - 10, fps, config: { damping: 12 }, from: 50, to: 0 });
  const subOpacity = spring({ frame: frame - 10, fps, config: { damping: 12 }, from: 0, to: 1 });

  const iconScale = spring({ frame: frame - 5, fps, config: { damping: 10 }, from: 0, to: 1 });

  // Dynamically get the icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[scene.iconName] || Icons.Zap;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            transform: `scale(${iconScale})`,
            color: scene.color || '#00FFCC',
            background: `rgba(255,255,255,0.05)`,
            padding: '32px',
            borderRadius: '50%',
            boxShadow: `0 0 40px ${scene.color || '#00FFCC'}40`,
          }}
        >
          <IconComponent size={120} strokeWidth={1.5} />
        </div>

        <h1
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '100px',
            lineHeight: 1,
            color: 'white',
            textTransform: 'uppercase',
            margin: 0,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {scene.title}
        </h1>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '48px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
            transform: `translateY(${subY}px)`,
            opacity: subOpacity,
          }}
        >
          {scene.subtitle}
        </p>
      </div>
    </AbsoluteFill>
  );
};
