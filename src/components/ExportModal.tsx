import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  progress: number;
  status: string;
}

export function ExportModal({ isOpen, progress, status }: ExportModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-neutral-950 border-neutral-800 text-white" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-between items-center">
            <span>Exportation en cours</span>
            <span dir="rtl" className="font-arabic text-right">جاري التصدير</span>
          </DialogTitle>
          <DialogDescription className="text-neutral-400 flex justify-between items-center mt-2">
            <span>Veuillez patienter...</span>
            <span dir="rtl" className="font-arabic text-right">يرجى الانتظار...</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-teal-500 animate-spin absolute" />
            <span className="text-lg font-bold">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2 bg-neutral-800" />
            <p className="text-sm text-center text-teal-400 font-medium animate-pulse">
              {status}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
