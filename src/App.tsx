import React, { useState, useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { DefaultTemplate } from './components/DefaultTemplate';
import { DynamicVideo, Scene } from './components/DynamicVideo';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toPng, toCanvas } from 'html-to-image';
import { Download, Play, Loader2, Video, Settings, Zap, Wand2, KeyRound, Lock, MonitorPlay, ChevronDown, ChevronUp, Upload, X, Smartphone, Rocket, BookOpen, Clapperboard, ListOrdered, ArrowRightLeft, Coffee, Feather, Sparkles, Flame, MessageCircleQuestion, BarChart3 } from 'lucide-react';
import * as Mp4Muxer from 'mp4-muxer';
import { GoogleGenAI, Type } from '@google/genai';
import { saveEncryptedSettings, getDecryptedSettings, hasEncryptedSettings, AISettings } from './lib/crypto';
import { useRendering } from './hooks/useRendering';
import { ExportModal } from './components/ExportModal';
import { TEMPLATE_DEMOS } from './lib/templateDemos';

const DIMENSIONS: Record<string, Record<string, [number, number]>> = {
  '1080': { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] },
  '720': { '9:16': [720, 1280], '16:9': [1280, 720], '1:1': [720, 720] },
  '480': { '9:16': [480, 854], '16:9': [854, 480], '1:1': [480, 480] },
  '360': { '9:16': [360, 640], '16:9': [640, 360], '1:1': [360, 360] },
};

const VIDEO_TEMPLATES = [
  { id: 'ugc', name: 'UGC / Testimonial', desc: 'Authentic, raw, relatable review style', icon: Smartphone },
  { id: 'teaser', name: 'Product Teaser', desc: 'High energy, fast cuts, bold text', icon: Rocket },
  { id: 'educational', name: 'Educational / How-To', desc: 'Step-by-step, clear text overlays', icon: BookOpen },
  { id: 'bts', name: 'Behind the Scenes', desc: 'Casual, engaging, building trust', icon: Clapperboard },
  { id: 'listicle', name: 'Listicle (Top 3/5)', desc: 'Numbered points, high retention', icon: ListOrdered },
  { id: 'before_after', name: 'Before & After', desc: 'Transformation, satisfying reveal', icon: ArrowRightLeft },
  { id: 'vlog', name: 'Day in the Life', desc: 'Storytelling, lifestyle-focused', icon: Coffee },
  { id: 'minimalist', name: 'Minimalist / Aesthetic', desc: 'Slow pacing, elegant typography', icon: Feather },
  { id: 'meme', name: 'Trending / Meme', desc: 'Humorous, highly shareable format', icon: Sparkles },
  { id: 'hype', name: 'Event / Hype', desc: 'Fast-paced, energetic, FOMO inducing', icon: Flame },
  { id: 'qa', name: 'Q&A / FAQ', desc: 'Direct to camera, text bubbles', icon: MessageCircleQuestion },
  { id: 'data', name: 'Data / Infographic', desc: 'Stat-heavy, animated charts, B2B', icon: BarChart3 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'ai' | 'settings'>('preview');
  
  // AI State
  const [promptInput, setPromptInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState('custom');
  const [videoStyle, setVideoStyle] = useState('Professional Marketing');
  const [fontFamily, setFontFamily] = useState('Anton');
  const [videoLength, setVideoLength] = useState('15');
  const [manualLength, setManualLength] = useState(30);
  const [pinInput, setPinInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTimer, setGenerationTimer] = useState(0);
  const [scenes, setScenes] = useState<Scene[] | null>(null);
  const [aiError, setAiError] = useState('');

  // Settings State
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelNameInput, setModelNameInput] = useState('openai/gpt-4o-mini');
  const [settingsPin, setSettingsPin] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null);
  const [referenceVideoBase64, setReferenceVideoBase64] = useState<string | null>(null);

  // Auto-adjust settings based on prompt input
  useEffect(() => {
    if (!promptInput) return;
    
    const lower = promptInput.toLowerCase();
    
    if (lower.match(/https?:\/\//)) {
      setVideoStyle('Professional Marketing');
      setFontFamily('Inter');
    } else if (lower.includes('funny') || lower.includes('meme') || lower.includes('joke')) {
      setVideoStyle('Funny & Energetic');
      setFontFamily('Bangers');
    } else if (lower.includes('tech') || lower.includes('ai ') || lower.includes('cyber') || lower.includes('software')) {
      setVideoStyle('Cyberpunk Style');
      setFontFamily('Space Grotesk');
    } else if (lower.includes('cinematic') || lower.includes('movie') || lower.includes('trailer')) {
      setVideoStyle('Cinematic');
      setFontFamily('Cinzel');
    } else if (lower.includes('minimal') || lower.includes('clean')) {
      setVideoStyle('Minimalist & Clean');
      setFontFamily('Inter');
    }
  }, [promptInput]);

  // Generation Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationTimer(0);
      interval = setInterval(() => {
        setGenerationTimer(prev => prev + 1);
      }, 1000);
    } else {
      setGenerationTimer(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Render State
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [renderLog, setRenderLog] = useState('');
  const [engine, setEngine] = useState<'webcodecs' | 'ffmpeg'>('webcodecs');
  const [resolution, setResolution] = useState<'1080' | '720' | '480' | '360'>('1080');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [format, setFormat] = useState<'mp4' | 'webm' | 'gif'>('mp4');
  const [fps, setFps] = useState<number>(30);

  const playerRef = useRef<PlayerRef>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ffmpegRef = useRef(new FFmpeg());

  // New Architecture Hook
  const { isExporting, progress: exportProgress, status: exportStatus, exportVideo } = useRendering();

  useEffect(() => {
    if (engine === 'webcodecs' && format !== 'mp4') {
      setFormat('mp4');
    }
  }, [engine, format]);

  const handleSaveSettings = () => {
    if (!apiKeyInput || !settingsPin) {
      setSettingsMessage('Please enter both API Key and PIN.');
      return;
    }
    const settings: AISettings = {
      provider: aiProvider,
      apiKey: apiKeyInput,
      modelName: aiProvider === 'openrouter' ? modelNameInput : undefined
    };
    saveEncryptedSettings(settings, settingsPin);
    setSettingsMessage('Settings encrypted and saved securely to local storage!');
    setApiKeyInput('');
    setSettingsPin('');
    setTimeout(() => setSettingsMessage(''), 3000);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload a video smaller than 10MB.");
      return;
    }
    
    setReferenceVideo(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceVideoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAI = async () => {
    setAiError('');
    if (!promptInput) {
      setAiError('Please enter a prompt, URL, or script.');
      return;
    }
    if (!pinInput) {
      setAiError('Please enter your PIN to decrypt your settings.');
      return;
    }

    const settings = getDecryptedSettings(pinInput);
    if (!settings || !settings.apiKey) {
      setAiError('Invalid PIN or no API key found. Please check Settings.');
      return;
    }

    setIsGenerating(true);
    try {
      const targetSeconds = videoLength === 'manual' ? manualLength : parseInt(videoLength);
      const targetFrames = targetSeconds * 30;
      const estimatedScenes = Math.max(3, Math.floor(targetSeconds / 4));

      const selectedTemplateData = VIDEO_TEMPLATES.find(t => t.id === selectedTemplate);
      const templateInstruction = selectedTemplateData 
        ? `\nCRITICAL THEME REQUIREMENT: You MUST strictly follow the "${selectedTemplateData.name}" template style. Description: ${selectedTemplateData.desc}. Adapt the scenes, pacing, and layout to perfectly match this specific style.` 
        : '';

      const prompt = `Create a highly engaging, professional social media promotional video script based on this input: "${promptInput}". 
      The tone and style of the video should be: ${videoStyle}.${templateInstruction}
      The video should have around ${estimatedScenes} scenes. 
      
      CRITICAL: The total video must be exactly ${targetSeconds} seconds long (${targetFrames} frames total). The sum of 'durationInFrames' across all scenes MUST equal exactly ${targetFrames}.
      
      You must act as an expert social media content creator and video editor. Use strong hooks, engaging pacing, and dynamic visual descriptions.
      
      For each scene, provide:
      - layout: Choose from 'center' (bold text focus), 'split' (two-tone background), 'mockup' (UI/app showcase), or 'data' (showing a stat or progress).
      - title: Short, punchy hook or main point.
      - subtitle: Supporting text.
      - iconName: A relevant icon from lucide-react (e.g., Zap, Star, Smartphone, BarChart3, TrendingUp, ShieldCheck).
      - color: Primary vibrant hex color.
      - bgColor: A contrasting dark or complementary hex color for the background.
      - durationInFrames: Frames for this scene (30fps).
      - dataValue: (Optional) A number from 1 to 100 if layout is 'data' (e.g., 99 for "99% satisfaction").
      - dataLabel: (Optional) Label for the dataValue.
      
      Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
      Example format:
      [
        {"layout": "center", "title": "STOP SCROLLING", "subtitle": "You need to see this", "iconName": "AlertCircle", "color": "#FF3366", "bgColor": "#111111", "durationInFrames": 60},
        {"layout": "data", "title": "Boost Productivity", "subtitle": "Users report massive gains", "iconName": "TrendingUp", "color": "#00E5FF", "bgColor": "#0A2540", "durationInFrames": 90, "dataValue": 85, "dataLabel": "Efficiency Increase"}
      ]`;

      let generatedScenes: Scene[] = [];

      if (settings.provider === 'openrouter') {
        let res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'PromoGen AI'
          },
          body: JSON.stringify({
            model: settings.modelName || 'openai/gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
          })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          // Automatic fallback if the user is using a free model but hasn't enabled data logging
          if (errData.error?.message?.includes('guardrail restrictions and data policy')) {
            console.log('Falling back to paid model to bypass data policy restriction...');
            res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${settings.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'PromoGen AI'
              },
              body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }]
              })
            });
            if (!res.ok) {
              const fallbackErr = await res.json();
              throw new Error(fallbackErr.error?.message || 'OpenRouter API Error (Fallback failed)');
            }
          } else {
            throw new Error(errData.error?.message || 'OpenRouter API Error');
          }
        }
        
        const data = await res.json();
        let text = data.choices[0].message.content;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
          text = text.substring(firstBracket, lastBracket + 1);
        }
        generatedScenes = JSON.parse(text);
      } else {
        const ai = new GoogleGenAI({ apiKey: settings.apiKey });
        
        let finalPrompt = prompt;
        let contents: any = finalPrompt;

        if (referenceVideoBase64) {
          finalPrompt = `I have attached a reference video. Please deeply analyze its visual style, color palette, text animations, pacing, and overall vibe. Then, generate a script for a new video based on this input: "${promptInput}". The new script MUST heavily simulate the style, colors, layout, and animation vibe of the attached reference video.\n\n${prompt}`;
          
          contents = {
            parts: [
              {
                inlineData: {
                  mimeType: referenceVideo?.type || 'video/mp4',
                  data: referenceVideoBase64.split(',')[1]
                }
              },
              { text: finalPrompt }
            ]
          };
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  iconName: { type: Type.STRING },
                  color: { type: Type.STRING },
                  bgColor: { type: Type.STRING },
                  layout: { type: Type.STRING, enum: ['center', 'split', 'mockup', 'data'] },
                  durationInFrames: { type: Type.NUMBER }
                },
                required: ['title', 'subtitle', 'iconName', 'color', 'bgColor', 'layout', 'durationInFrames']
              }
            }
          }
        });
        if (response.text) {
          generatedScenes = JSON.parse(response.text);
        } else {
          throw new Error('Failed to generate video script.');
        }
      }

      setScenes(generatedScenes);
      setActiveTab('preview');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg.loaded) {
      setStatusText('Loading FFmpeg...');
      ffmpeg.on('log', ({ message }) => {
        setRenderLog(message);
      });
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      } catch (blobError) {
        console.warn('toBlobURL failed in App.tsx, attempting direct URL load...', blobError);
        await ffmpeg.load({
          coreURL: `${baseURL}/ffmpeg-core.js`,
          wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        });
      }
    }
  };

  const renderWithWebCodecs = async () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(0);
    setRenderLog('');
    setStatusText('Initializing Hardware Encoder...');

    try {
      const targetFps = fps;
      const totalFrames = scenes ? scenes.reduce((acc, s) => acc + s.durationInFrames, 0) : 450;
      const step = 30 / targetFps;

      let [width, height] = DIMENSIONS[resolution][aspectRatio];
      width = Math.floor(width / 2) * 2;
      height = Math.floor(height / 2) * 2;

      let muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: 'avc', width, height },
        fastStart: 'in-memory',
      });

      let videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => console.error(e),
      });

      videoEncoder.configure({
        codec: 'avc1.420028',
        width,
        height,
        bitrate: 5_000_000,
        framerate: targetFps,
        hardwareAcceleration: 'prefer-hardware',
      });

      playerRef.current?.pause();

      for (let i = 0; i < totalFrames; i++) {
        const compFrame = Math.floor(i * step);
        playerRef.current?.seekTo(compFrame);
        
        // Wait for React to commit the frame to the DOM (much faster than fixed setTimeout)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        if (playerContainerRef.current) {
          const sourceCanvas = await toCanvas(playerContainerRef.current, {
            width, height, pixelRatio: 1,
            cacheBust: false, skipAutoScale: true,
            style: { transform: 'scale(1)', transformOrigin: 'top left' }
          });

          const timestamp = (i * 1e6) / targetFps;
          const frame = new VideoFrame(sourceCanvas, { timestamp });
          const keyFrame = i % targetFps === 0;
          videoEncoder.encode(frame, { keyFrame });
          frame.close();
        }
        
        setRenderProgress((i / totalFrames) * 100);
        setStatusText(`Encoding frame ${i + 1}/${totalFrames}...`);
        setRenderLog(`WebCodecs: Processed frame ${i + 1} / ${totalFrames}`);
      }

      setStatusText('Finalizing video...');
      setRenderLog('Flushing encoder and finalizing MP4 container...');
      await videoEncoder.flush();
      muxer.finalize();

      const buffer = muxer.target.buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `promo-fast.mp4`;
      a.click();

      setStatusText('Done!');
      setTimeout(() => setStatusText(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusText('Rendering failed. See console.');
    } finally {
      setIsRendering(false);
    }
  };

  const renderWithFFmpeg = async () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(0);
    setRenderLog('');

    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      const targetFps = fps;
      const totalFrames = scenes ? scenes.reduce((acc, s) => acc + s.durationInFrames, 0) : 450;
      const step = 30 / targetFps;

      let [width, height] = DIMENSIONS[resolution][aspectRatio];
      width = Math.floor(width / 2) * 2;
      height = Math.floor(height / 2) * 2;

      setStatusText('Capturing frames...');
      playerRef.current?.pause();

      for (let i = 0; i < totalFrames; i++) {
        const compFrame = Math.floor(i * step);
        playerRef.current?.seekTo(compFrame);
        
        // Wait for React to commit the frame to the DOM
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        if (playerContainerRef.current) {
          const dataUrl = await toPng(playerContainerRef.current, {
            width, height, pixelRatio: 1,
            cacheBust: false, skipAutoScale: true,
            style: { transform: 'scale(1)', transformOrigin: 'top left' }
          });

          const blob = await (await fetch(dataUrl)).blob();
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          await ffmpeg.writeFile(`frame-${i.toString().padStart(4, '0')}.png`, uint8Array);
        }
        setRenderProgress((i / totalFrames) * 50);
        setRenderLog(`Captured frame ${i + 1}/${totalFrames} to memory...`);
      }

      setStatusText(`Encoding ${format.toUpperCase()}...`);
      setRenderLog('Starting FFmpeg encoding process...');
      ffmpeg.on('progress', ({ progress }) => {
        setRenderProgress(50 + progress * 50);
      });

      let outputName = `output.${format}`;
      let ffmpegArgs: string[] = [];
      
      if (format === 'mp4') {
        ffmpegArgs = ['-framerate', targetFps.toString(), '-i', 'frame-%04d.png', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', outputName];
      } else if (format === 'webm') {
        ffmpegArgs = ['-framerate', targetFps.toString(), '-i', 'frame-%04d.png', '-c:v', 'libvpx', '-b:v', '2M', outputName];
      } else if (format === 'gif') {
        ffmpegArgs = ['-framerate', targetFps.toString(), '-i', 'frame-%04d.png', '-vf', `split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, outputName];
      }

      await ffmpeg.exec(ffmpegArgs);
      setStatusText('Downloading...');
      const data = await ffmpeg.readFile(outputName);
      const mimeType = format === 'mp4' ? 'video/mp4' : format === 'webm' ? 'video/webm' : 'image/gif';
      const url = URL.createObjectURL(new Blob([data], { type: mimeType }));

      const a = document.createElement('a');
      a.href = url;
      a.download = `promo.${format}`;
      a.click();

      setStatusText('Done!');
      setTimeout(() => setStatusText(''), 3000);

      for (let i = 0; i < totalFrames; i++) {
        await ffmpeg.deleteFile(`frame-${i.toString().padStart(4, '0')}.png`);
      }
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error(err);
      setStatusText('Rendering failed. See console.');
    } finally {
      setIsRendering(false);
    }
  };

  const handleRender = () => {
    if (engine === 'webcodecs') renderWithWebCodecs();
    else renderWithFFmpeg();
  };

  const totalDuration = scenes ? scenes.reduce((acc, s) => acc + s.durationInFrames, 0) : 450;
  const [compWidth, compHeight] = DIMENSIONS[resolution][aspectRatio];
  
  // Calculate preview scale to fit within a 360x640 box
  const previewScale = Math.min(360 / compWidth, 640 / compHeight);
  const previewWidth = compWidth * previewScale;
  const previewHeight = compHeight * previewScale;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-10 font-sans">
      <div className="max-w-6xl w-full px-6 flex flex-col gap-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="text-teal-400" /> PromoGen AI
          </h1>
          <div className="flex gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'preview' ? 'bg-teal-500/20 text-teal-400' : 'text-neutral-400 hover:text-white'}`}
            >
              Preview & Render
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'ai' ? 'bg-teal-500/20 text-teal-400' : 'text-neutral-400 hover:text-white'}`}
            >
              <Wand2 size={16} /> AI Generator
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-teal-500/20 text-teal-400' : 'text-neutral-400 hover:text-white'}`}
            >
              <Settings size={16} /> Settings
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* Left Column: Player */}
          <div className={`flex-1 flex flex-col items-center w-full ${activeTab !== 'preview' ? 'hidden md:flex opacity-50 pointer-events-none' : ''}`}>
            <div className="relative bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center" style={{ width: 360, height: 640 }}>
              <div className="relative" style={{ width: previewWidth, height: previewHeight, overflow: 'hidden' }}>
                <div
                  ref={playerContainerRef}
                  style={{
                    width: compWidth, height: compHeight, transform: `scale(${previewScale})`,
                    transformOrigin: 'top left', position: 'absolute', top: 0, left: 0,
                  }}
                >
                  <Player
                    ref={playerRef}
                    component={scenes ? DynamicVideo : DefaultTemplate}
                    inputProps={scenes ? { scenes, fontFamily } : undefined}
                    durationInFrames={totalDuration}
                    compositionWidth={compWidth}
                    compositionHeight={compHeight}
                    fps={30}
                    controls={!isRendering}
                    autoPlay
                    loop
                    style={{ width: compWidth, height: compHeight }}
                  />
                </div>
              </div>

              {isRendering && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
                  <p className="text-lg font-medium text-white">{statusText}</p>
                  <div className="w-64 h-2 bg-neutral-800 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-teal-400 transition-all duration-300 ease-out" style={{ width: `${renderProgress}%` }} />
                  </div>
                  <p className="text-sm text-neutral-400 mt-2">{Math.round(renderProgress)}%</p>
                  
                  {renderLog && (
                    <div className="mt-6 w-5/6 bg-black/60 border border-neutral-800 rounded-lg p-3 text-[10px] text-neutral-500 font-mono h-20 overflow-hidden flex flex-col justify-end break-all">
                      <span className="line-clamp-3">{renderLog}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic Content based on Tab */}
          <div className="flex-1 w-full bg-neutral-900 p-8 rounded-2xl border border-neutral-800 min-h-[640px]">
            
            {/* PREVIEW & RENDER TAB */}
            {activeTab === 'preview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold mb-2">Render Settings</h2>
                <p className="text-neutral-400 mb-6">Choose your preferred rendering settings below.</p>

                <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex justify-between">
                      <span>Rendering Engine</span>
                      {engine === 'webcodecs' && <span className="text-xs text-teal-400 flex items-center gap-1"><Zap size={12} /> Hardware Accelerated</span>}
                    </label>
                    <select value={engine} onChange={(e) => setEngine(e.target.value as any)} disabled={isRendering} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white outline-none focus:border-teal-400">
                      <option value="webcodecs">WebCodecs (Ultra Fast, MP4 Only)</option>
                      <option value="ffmpeg">FFmpeg.wasm (Stable, Supports GIF/WebM)</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">Resolution</label>
                      <select value={resolution} onChange={(e) => setResolution(e.target.value as any)} disabled={isRendering} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white outline-none focus:border-teal-400">
                        <option value="1080">1080p (HD)</option>
                        <option value="720">720p (SD)</option>
                        <option value="480">480p (Draft)</option>
                        <option value="360">360p (Ultra Fast)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">Aspect Ratio</label>
                      <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)} disabled={isRendering} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white outline-none focus:border-teal-400">
                        <option value="9:16">9:16 (TikTok/Reels)</option>
                        <option value="16:9">16:9 (YouTube)</option>
                        <option value="1:1">1:1 (Instagram)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">Output Format</label>
                      <select value={format} onChange={(e) => setFormat(e.target.value as any)} disabled={isRendering || engine === 'webcodecs'} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white outline-none focus:border-teal-400">
                        <option value="mp4">MP4 (H.264)</option>
                        <option value="webm">WebM (VP8)</option>
                        <option value="gif">GIF</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5">Frame Rate</label>
                      <select value={fps} onChange={(e) => setFps(Number(e.target.value))} disabled={isRendering} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white outline-none focus:border-teal-400">
                        <option value={30}>30 FPS</option>
                        <option value={15}>15 FPS</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button onClick={handleRender} disabled={isRendering || isExporting} className="w-full py-4 px-6 bg-teal-500 hover:bg-teal-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-teal-500/20">
                  {isRendering ? <><Loader2 className="animate-spin" /> Rendering...</> : <><Download /> Render & Download</>}
                </button>

                <div className="pt-4 border-t border-neutral-800">
                  <h3 className="text-lg font-bold mb-2 text-purple-400">New Architecture (Web Worker + Chunking)</h3>
                  <p className="text-sm text-neutral-400 mb-4">Test the new experimental hardware-accelerated rendering engine with RTL support.</p>
                  <button 
                    onClick={() => exportVideo(totalDuration / 30, promptInput || 'تصدير الفيديو التجريبي', scenes || undefined)} 
                    disabled={isRendering || isExporting} 
                    className="w-full py-3 px-6 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap size={18} /> Test Worker Engine ({Math.round(totalDuration / 30)}s)
                  </button>
                </div>
              </div>
            )}

            {/* AI GENERATOR TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Wand2 className="text-teal-400"/> Generate Video</h2>
                <p className="text-neutral-400 mb-6">Paste a website URL, YouTube link, or a script to generate a custom promotional video.</p>

                <div className="space-y-4">
                  {/* PRIMARY INPUT: Prompt / URL / Script */}
                  <div>
                    <textarea 
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Paste a URL (e.g., https://example.com) or type your prompt here..."
                      className="w-full h-40 bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-white outline-none focus:border-teal-400 resize-none text-lg shadow-inner"
                    />
                  </div>

                  {/* TEMPLATE SELECTION (OPTIONAL) */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-neutral-300 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Wand2 size={16} className="text-teal-400" /> Choose a Theme/Template (Optional)</span>
                      {selectedTemplate && (
                        <button onClick={() => setSelectedTemplate(null)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                          Clear Selection
                        </button>
                      )}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {VIDEO_TEMPLATES.map(t => {
                        const Icon = t.icon;
                        const isSelected = selectedTemplate === t.id;
                        return (
                          <div key={t.id} className={`relative p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${isSelected ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:border-neutral-700'}`}>
                            <button
                              onClick={() => setSelectedTemplate(isSelected ? null : t.id)}
                              className="flex flex-col gap-2 text-left w-full"
                            >
                              <Icon size={20} className={isSelected ? 'text-teal-400' : 'text-neutral-500'} />
                              <div>
                                <div className={`font-bold text-sm ${isSelected ? 'text-teal-300' : 'text-neutral-200'}`}>{t.name}</div>
                                <div className="text-xs opacity-70 line-clamp-2 mt-0.5">{t.desc}</div>
                              </div>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t.id); }}
                              className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-medium transition-colors"
                            >
                              <Play size={12} /> Watch Demo
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* REFERENCE VIDEO UPLOAD */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                      <Video size={16} className="text-teal-400" /> Reference Video (Optional, Gemini Only)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className={`cursor-pointer border ${aiProvider === 'gemini' ? 'border-neutral-700 hover:border-teal-500 bg-neutral-900 text-neutral-300' : 'border-neutral-800 bg-neutral-950 text-neutral-600'} px-4 py-3 rounded-lg transition-colors flex items-center gap-2 text-sm flex-1`}>
                        <Upload size={16} />
                        <span className="truncate">{referenceVideo ? referenceVideo.name : "Upload a video to simulate style & animation (Max 10MB)"}</span>
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden" 
                          onChange={handleVideoUpload}
                          disabled={isGenerating || aiProvider !== 'gemini'}
                        />
                      </label>
                      {referenceVideo && (
                        <button 
                          onClick={() => { setReferenceVideo(null); setReferenceVideoBase64(null); }}
                          className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                          title="Remove Reference Video"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {aiProvider !== 'gemini' && (
                      <p className="text-xs text-amber-500">Reference video analysis is only available when using Google Gemini.</p>
                    )}
                  </div>

                  {/* TOGGLE ADVANCED OPTIONS */}
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-teal-400 transition-colors py-2"
                  >
                    {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
                    {showOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                  </button>

                  {/* ADVANCED OPTIONS (Collapsible) */}
                  {showOptions && (
                    <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Prompt Template</label>
                          <select 
                            value={promptTemplate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPromptTemplate(val);
                              if (val === 'ecommerce') {
                                setPromptInput('Create a promo video for a new smart coffee mug. Highlight features: keeps coffee hot for 12 hours, app-controlled temperature, sleek design. End with a 20% off discount code: MUG20.');
                              } else if (val === 'app_launch') {
                                setPromptInput('Create an app launch video for a meditation app called "ZenMind". Highlight features: daily guided meditations, sleep sounds, progress tracking. Call to action: Download now on iOS and Android.');
                              } else if (val === 'service') {
                                setPromptInput('Create a promo video for a local plumbing service called "QuickFix". Highlight: 24/7 emergency service, licensed professionals, upfront pricing. Call to action: Call us today for a free quote.');
                              } else {
                                setPromptInput('');
                              }
                            }}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                          >
                            <option value="custom">Custom Prompt</option>
                            <option value="ecommerce">E-commerce Product</option>
                            <option value="app_launch">App Launch</option>
                            <option value="service">Service Promotion</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Video Style & Tone</label>
                          <select 
                            value={videoStyle}
                            onChange={(e) => setVideoStyle(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                          >
                            <option value="Professional Marketing">Professional Marketing</option>
                            <option value="Funny & Energetic">Funny & Energetic</option>
                            <option value="Cyberpunk Style">Cyberpunk Style</option>
                            <option value="Full Animation / Cartoonish">Full Animation / Cartoonish</option>
                            <option value="Minimalist & Clean">Minimalist & Clean</option>
                            <option value="Cinematic">Cinematic</option>
                            <option value="Content Creator (5 years experience)">Content Creator (5 yrs exp)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Video Length</label>
                          <div className="flex gap-2">
                            <select 
                              value={videoLength}
                              onChange={(e) => setVideoLength(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                            >
                              <option value="15">15 Seconds (Short)</option>
                              <option value="30">30 Seconds (Standard)</option>
                              <option value="60">1 Minute (Long)</option>
                              <option value="manual">Manual Input</option>
                            </select>
                            {videoLength === 'manual' && (
                              <input 
                                type="number"
                                min="5"
                                max="300"
                                value={manualLength}
                                onChange={(e) => setManualLength(parseInt(e.target.value) || 15)}
                                className="w-24 bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                                placeholder="Secs"
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Font Style</label>
                          <select 
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                          >
                            <option value="Anton">Anton (Bold & Punchy)</option>
                            <option value="Inter">Inter (Clean & Modern)</option>
                            <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                            <option value="Space Grotesk">Space Grotesk (Tech & Futuristic)</option>
                            <option value="JetBrains Mono">JetBrains Mono (Coding & Cyber)</option>
                            <option value="Bangers">Bangers (Comic & Fun)</option>
                            <option value="Cinzel">Cinzel (Cinematic & Epic)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                      <Lock size={14} /> Enter PIN to decrypt API settings
                    </label>
                    <input 
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="****"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  {aiError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex flex-col gap-2">
                      <p>{aiError}</p>
                      {aiError.includes('openrouter.ai/settings/privacy') && (
                        <div className="mt-2 text-xs text-red-300">
                          <strong>Fix:</strong> Free OpenRouter models require data logging to be enabled. 
                          Click the link below to allow data logging, or use a paid model.
                          <a 
                            href="https://openrouter.ai/settings/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block mt-2 text-white bg-red-500/20 hover:bg-red-500/30 px-3 py-2 rounded-md text-center font-medium transition-colors"
                          >
                            Open Privacy Settings
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !hasEncryptedSettings()}
                    className="w-full py-4 px-6 bg-purple-500 hover:bg-purple-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-purple-500/20"
                  >
                    {isGenerating ? <><Loader2 className="animate-spin" /> Generating Script... ({generationTimer}s)</> : <><Wand2 /> Generate Video</>}
                  </button>

                  {!hasEncryptedSettings() && (
                    <p className="text-sm text-amber-400 text-center mt-4">
                      You need to configure your API Provider in Settings first.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Settings className="text-teal-400"/> Security Settings</h2>
                <p className="text-neutral-400 mb-6">Securely store your API keys locally. Encrypted using AES and never leaves your device.</p>

                <div className="space-y-5 bg-neutral-950 p-6 rounded-xl border border-neutral-800">
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                      <MonitorPlay size={14} /> AI Provider
                    </label>
                    <select 
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                      <KeyRound size={14} /> {aiProvider === 'gemini' ? 'Gemini API Key' : 'OpenRouter API Key'}
                    </label>
                    <input 
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={aiProvider === 'gemini' ? 'AIzaSy...' : 'sk-or-v1-...'}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  {aiProvider === 'openrouter' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                        <Wand2 size={14} /> Model Name
                      </label>
                      <input 
                        type="text"
                        value={modelNameInput}
                        onChange={(e) => setModelNameInput(e.target.value)}
                        placeholder="e.g., openai/gpt-4o-mini"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                      />
                      <p className="text-xs text-neutral-500 mt-2">Note: Free models (like google/gemini-2.5-flash:free) require "Allow Data Logging" to be enabled in your OpenRouter privacy settings.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                      <Lock size={14} /> Create a Secure PIN
                    </label>
                    <input 
                      type="password"
                      value={settingsPin}
                      onChange={(e) => setSettingsPin(e.target.value)}
                      placeholder="e.g., 1234"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-teal-400"
                    />
                    <p className="text-xs text-neutral-500 mt-2">This PIN is required to decrypt your key when generating videos.</p>
                  </div>

                  {settingsMessage && (
                    <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg text-sm">
                      {settingsMessage}
                    </div>
                  )}

                  <button 
                    onClick={handleSaveSettings}
                    className="w-full py-3 px-6 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Encrypt & Save Locally
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Export Modal for New Architecture */}
      <ExportModal isOpen={isExporting} progress={exportProgress} status={exportStatus} />

      {/* Template Preview Modal */}
      {previewTemplate && TEMPLATE_DEMOS[previewTemplate] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 w-full max-w-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MonitorPlay size={18} className="text-teal-400" />
                {VIDEO_TEMPLATES.find(t => t.id === previewTemplate)?.name} Demo
              </h3>
              <button onClick={() => setPreviewTemplate(null)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="rounded-xl overflow-hidden bg-black aspect-[9/16] relative">
              <Player
                component={DynamicVideo}
                inputProps={{ 
                  scenes: TEMPLATE_DEMOS[previewTemplate].scenes,
                  fontFamily: TEMPLATE_DEMOS[previewTemplate].fontFamily
                }}
                durationInFrames={TEMPLATE_DEMOS[previewTemplate].scenes.reduce((acc, s) => acc + s.durationInFrames, 0)}
                fps={30}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{ width: '100%', height: '100%' }}
                controls
                autoPlay
                loop
              />
            </div>

            <button
              onClick={() => {
                setSelectedTemplate(previewTemplate);
                setPreviewTemplate(null);
              }}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-colors"
            >
              Use This Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
