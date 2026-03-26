import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Img,
  interpolateColors,
} from 'remotion';
import { 
  ShoppingCart, 
  Star, 
  ShieldCheck, 
  Gamepad2, 
  MonitorPlay, 
  CreditCard,
  AlertOctagon,
  Zap,
  CheckCircle2,
  Music,
  Key,
  ArrowRight
} from 'lucide-react';

// --- Reusable Animated Components ---

const PopText = ({ text, delay, color = 'white', fontSize = '80px', className = '' }: { text: string, delay: number, color?: string, fontSize?: string, className?: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 200 } });
  
  return (
    <div
      className={className}
      style={{
        transform: `scale(${scale})`,
        color,
        fontSize,
        fontWeight: 900,
        textAlign: 'center',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        textShadow: '0 10px 30px rgba(0,0,0,0.8)',
      }}
    >
      {text}
    </div>
  );
};

const SlideInText = ({ text, delay, color = 'white', fontSize = '50px' }: { text: string, delay: number, color?: string, fontSize?: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 150 } });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  
  return (
    <div
      style={{
        transform: `translateY(${interpolate(y, [0, 1], [100, 0])}px)`,
        opacity,
        color,
        fontSize,
        fontWeight: 800,
        textAlign: 'center',
        textShadow: '0 5px 20px rgba(0,0,0,0.5)',
      }}
    >
      {text}
    </div>
  );
};

const GlassCard = ({ icon: Icon, title, subtitle, delay, color }: { icon: any, title: string, subtitle: string, delay: number, color: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 150 } });
  const rotate = interpolate(frame - delay, [0, 20], [-10, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${color}40`,
        borderRadius: '30px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px ${color}20`,
      }}
    >
      <Icon size={80} color={color} style={{ marginBottom: '20px', filter: `drop-shadow(0 0 10px ${color})` }} />
      <span style={{ color: 'white', fontSize: '35px', fontWeight: 900, textAlign: 'center' }}>{title}</span>
      <span style={{ color: color, fontSize: '25px', fontWeight: 700, textAlign: 'center', marginTop: '10px' }}>{subtitle}</span>
    </div>
  );
};

// --- Main Video Component ---

export const DefaultTemplate = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dynamic Background
  const bgRotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  const pulse = Math.sin(frame / 10) * 0.1 + 0.9;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Animated Gradient Background */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, #111 0%, #000 100%)',
          opacity: 0.8,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 255, 204, 0.1) 90deg, transparent 180deg, rgba(255, 0, 128, 0.1) 270deg, transparent 360deg)',
            transform: `rotate(${bgRotation}deg) scale(${pulse})`,
          }}
        />
      </AbsoluteFill>

      {/* SCENE 1: The Hook (0 - 2.5s) */}
      <Sequence from={0} durationInFrames={75}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <div style={{ transform: `rotate(${Math.sin(frame * 0.5) * 2}deg)` }}>
            <PopText text="ARE YOU STILL" delay={0} fontSize="70px" color="#FFF" />
            <PopText text="PAYING" delay={10} fontSize="90px" color="#FFF" />
            <PopText text="FULL PRICE?" delay={20} fontSize="110px" color="#FF3366" className="mt-4" />
          </div>
          
          <div style={{ marginTop: '60px', transform: `scale(${spring({ frame: frame - 35, fps })})` }}>
            <div style={{ position: 'relative' }}>
              <CreditCard size={180} color="#FF3366" />
              <AlertOctagon 
                size={80} 
                color="#FFF" 
                fill="#FF3366"
                style={{ position: 'absolute', bottom: -20, right: -20, transform: `scale(${pulse})` }} 
              />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 2: The Solution (2.5s - 5.5s) */}
      <Sequence from={75} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <SlideInText text="STOP SCROLLING." delay={0} color="#FFF" fontSize="60px" />
          <div style={{ height: '40px' }} />
          <PopText text="MEET" delay={15} fontSize="70px" color="#FFF" />
          
          <div 
            style={{ 
              marginTop: '20px',
              padding: '20px 60px',
              background: 'linear-gradient(90deg, #00FFCC, #00BFFF)',
              borderRadius: '30px',
              transform: `scale(${spring({ frame: frame - 30, fps })})`,
              boxShadow: '0 0 50px rgba(0, 255, 204, 0.4)'
            }}
          >
            <span style={{ color: '#000', fontSize: '80px', fontWeight: 900 }}>PromoGen AI</span>
          </div>

          <div style={{ marginTop: '50px' }}>
            <SlideInText text="Algeria's #1 Digital Market 🇩🇿" delay={45} color="#00FFCC" fontSize="45px" />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 3: The Value / Catalog (5.5s - 10s) */}
      <Sequence from={165} durationInFrames={135}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <PopText text="PREMIUM ACCOUNTS" delay={0} fontSize="75px" color="#FFF" />
          <SlideInText text="AT UNBEATABLE PRICES" delay={10} color="#FFD700" fontSize="45px" />
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '30px', 
            justifyContent: 'center', 
            marginTop: '60px',
            width: '100%'
          }}>
            <GlassCard icon={MonitorPlay} title="STREAMING" subtitle="Up to -60%" delay={25} color="#E50914" />
            <GlassCard icon={Gamepad2} title="GAMING" subtitle="Cheap Credits" delay={40} color="#00FF00" />
            <GlassCard icon={Music} title="MUSIC" subtitle="Premium" delay={55} color="#1DB954" />
            <GlassCard icon={Key} title="SOFTWARE" subtitle="Lifetime Keys" delay={70} color="#00A4EF" />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 4: Social Proof (10s - 12.5s) */}
      <Sequence from={300} durationInFrames={75}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <PopText text="TRUSTED BY" delay={0} fontSize="70px" color="#FFF" />
          <PopText text="8,000+" delay={10} fontSize="130px" color="#00FFCC" />
          <PopText text="HAPPY ALGERIANS" delay={20} fontSize="60px" color="#FFF" />
          
          <div style={{ display: 'flex', marginTop: '60px', gap: '15px' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ transform: `scale(${spring({ frame: frame - (30 + i * 5), fps })})` }}>
                <Star size={100} color="#FFD700" fill="#FFD700" style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' }} />
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '40px' }}>
            <SlideInText text="4.7/5 on Trustpilot" delay={60} color="#FFF" fontSize="50px" />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 5: The CTA (12.5s - 15s) */}
      <Sequence from={375} durationInFrames={75}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <div style={{ transform: `scale(${spring({ frame: frame - 0, fps })})` }}>
            <Zap size={120} color="#FFD700" fill="#FFD700" style={{ marginBottom: '30px' }} />
          </div>
          
          <PopText text="LEVEL UP YOUR" delay={10} fontSize="60px" color="#FFF" />
          <PopText text="DIGITAL LIFE" delay={20} fontSize="80px" color="#FFF" />
          
          <div 
            style={{ 
              marginTop: '60px',
              padding: '30px 80px',
              backgroundColor: '#00FFCC',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transform: `scale(${spring({ frame: frame - 30, fps, config: { damping: 10 } })})`,
              boxShadow: '0 20px 50px rgba(0, 255, 204, 0.4)'
            }}
          >
            <span style={{ color: '#000', fontSize: '65px', fontWeight: 900 }}>PROMOGEN.AI</span>
            <ArrowRight size={60} color="#000" />
          </div>

          <div style={{ marginTop: '50px', transform: `scale(${pulse})` }}>
            <SlideInText text="👇 LINK IN BIO 👇" delay={45} color="#FF3366" fontSize="55px" />
          </div>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};
