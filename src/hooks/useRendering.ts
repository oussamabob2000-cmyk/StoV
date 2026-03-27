import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export function useRendering() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const ffmpegRef = useRef(new FFmpeg());

  const exportVideo = useCallback(async (totalDurationSec: number, text: string) => {
    setIsExporting(true);
    setProgress(0);
    setStatus('Initialisation du moteur / تهيئة المحرك...');

    try {
      // 1. Load FFmpeg
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }

      // 2. Chunking Strategy (5-second segments)
      const CHUNK_DURATION = 5;
      const fps = 30;
      const chunksCount = Math.ceil(totalDurationSec / CHUNK_DURATION);
      const chunks: { index: number; buffer: ArrayBuffer }[] = [];
      const chunkProgress = new Array(chunksCount).fill(0);
      
      setStatus('Génération des segments / إنشاء المقاطع...');

      // Run workers in parallel
      const workerPromises = Array.from({ length: chunksCount }).map((_, i) => {
        return new Promise<void>((resolve, reject) => {
          // Using Vite's worker import syntax
          const worker = new Worker(new URL('../lib/VideoRenderer.worker.ts', import.meta.url), { type: 'module' });
          
          const startFrame = i * CHUNK_DURATION * fps;
          const endFrame = Math.min((i + 1) * CHUNK_DURATION * fps, totalDurationSec * fps);
          
          worker.onmessage = (e) => {
            if (e.data.type === 'PROGRESS') {
              chunkProgress[i] = e.data.payload.progress;
              const totalProgress = chunkProgress.reduce((a, b) => a + b, 0) / chunksCount;
              // Map rendering progress to 0-90%
              setProgress(Math.min(totalProgress * 90, 90));
            } else if (e.data.type === 'CHUNK_COMPLETE') {
              chunks.push({ index: e.data.payload.chunkIndex, buffer: e.data.payload.buffer });
              worker.terminate();
              resolve();
            } else if (e.data.type === 'ERROR') {
              worker.terminate();
              reject(new Error(e.data.payload.error));
            }
          };
          
          worker.onerror = (err) => {
            worker.terminate();
            reject(err);
          };
          
          worker.postMessage({
            type: 'RENDER_CHUNK',
            payload: { chunkIndex: i, startFrame, endFrame, fps, width: 1080, height: 1920, text }
          });
        });
      });

      await Promise.all(workerPromises);

      // 3. Concatenate with FFmpeg (Copy Codec)
      setStatus('Assemblage final / التجميع النهائي...');
      setProgress(95);
      
      // Sort chunks
      chunks.sort((a, b) => a.index - b.index);
      
      let concatList = '';
      for (const chunk of chunks) {
        const filename = `chunk_${chunk.index}.mp4`;
        await ffmpeg.writeFile(filename, new Uint8Array(chunk.buffer));
        concatList += `file '${filename}'\n`;
      }
      
      await ffmpeg.writeFile('list.txt', concatList);
      
      // Fast concat without re-encoding
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4']);
      
      const data = await ffmpeg.readFile('output.mp4');
      const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export_final.mp4';
      a.click();

      setStatus('Terminé / اكتمل');
      setProgress(100);
      
      // Cleanup
      for (const chunk of chunks) {
        await ffmpeg.deleteFile(`chunk_${chunk.index}.mp4`);
      }
      await ffmpeg.deleteFile('list.txt');
      await ffmpeg.deleteFile('output.mp4');

    } catch (error) {
      console.error(error);
      setStatus('Erreur / خطأ');
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  }, []);

  return { isExporting, progress, status, exportVideo };
}
