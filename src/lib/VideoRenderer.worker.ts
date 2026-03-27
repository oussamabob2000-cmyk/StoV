import * as Mp4Muxer from 'mp4-muxer';

self.onmessage = async (e) => {
  const { type, payload } = e.data;
  if (type === 'RENDER_CHUNK') {
    const { chunkIndex, startFrame, endFrame, fps, width, height, text } = payload;
    
    try {
      // 1. Setup OffscreenCanvas
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get 2d context');

      // 2. Setup Muxer & Encoder
      const muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: 'avc', width, height },
        fastStart: 'in-memory',
      });

      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => console.error(e),
      });

      videoEncoder.configure({
        codec: 'avc1.420028',
        width,
        height,
        bitrate: 5_000_000,
        framerate: fps,
        hardwareAcceleration: 'prefer-hardware',
      });

      // 3. Render Loop (GPU Accelerated via Canvas API)
      const totalFrames = endFrame - startFrame;
      for (let i = 0; i < totalFrames; i++) {
        // Clear background
        ctx.fillStyle = chunkIndex % 2 === 0 ? '#0f172a' : '#1e293b';
        ctx.fillRect(0, 0, width, height);

        // Add some visual elements (simulating filters/effects)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(1, '#818cf8');
        ctx.fillStyle = gradient;
        
        // Draw a moving shape
        const progress = i / totalFrames;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 + Math.sin(progress * Math.PI * 2) * 100, 200, 0, Math.PI * 2);
        ctx.fill();

        // RTL Arabic Text Rendering
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.fillText(text || 'تصدير الفيديو...', width / 2, height / 2 - 300);
        
        // Progress bar indicator
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, height - 20, progress * width, 20);

        const timestamp = (i * 1e6) / fps;
        const frame = new VideoFrame(canvas, { timestamp });
        const keyFrame = i % fps === 0;
        
        videoEncoder.encode(frame, { keyFrame });
        frame.close(); // Strict memory cleanup

        if (i % 10 === 0) {
          self.postMessage({ type: 'PROGRESS', payload: { chunkIndex, progress: i / totalFrames } });
        }
      }

      await videoEncoder.flush();
      muxer.finalize();

      const buffer = muxer.target.buffer;
      self.postMessage({ type: 'CHUNK_COMPLETE', payload: { chunkIndex, buffer } }, [buffer]);
    } catch (error: any) {
      self.postMessage({ type: 'ERROR', payload: { chunkIndex, error: error.message } });
    }
  }
};
