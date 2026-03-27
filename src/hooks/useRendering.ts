import { useState, useCallback } from 'react';

export function useRendering() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const exportVideo = useCallback(async (totalDurationSec: number, text: string) => {
    setIsExporting(true);
    setProgress(0);
    setStatus('Initialisation du moteur / تهيئة المحرك...');

    try {
      const fps = 30;
      
      setStatus('Génération de la vidéo / إنشاء الفيديو...');

      // Run a single worker for the entire video to avoid FFmpeg concatenation
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const worker = new Worker(new URL('../lib/VideoRenderer.worker.ts', import.meta.url), { type: 'module' });
        
        const startFrame = 0;
        const endFrame = totalDurationSec * fps;
        
        worker.onmessage = (e) => {
          if (e.data.type === 'PROGRESS') {
            setProgress(Math.min(e.data.payload.progress * 100, 99));
          } else if (e.data.type === 'CHUNK_COMPLETE') {
            worker.terminate();
            resolve(e.data.payload.buffer);
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
          payload: { chunkIndex: 0, startFrame, endFrame, fps, width: 1080, height: 1920, text }
        });
      });

      setStatus('Finalisation / جاري الانتهاء...');
      setProgress(100);
      
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export_final.mp4';
      a.click();

      setStatus('Terminé / اكتمل');
      
    } catch (error: any) {
      console.error(error);
      setStatus(`Erreur: ${error.message || 'Inconnue'}`);
    } finally {
      setTimeout(() => setIsExporting(false), 4000);
    }
  }, []);

  return { isExporting, progress, status, exportVideo };
}
