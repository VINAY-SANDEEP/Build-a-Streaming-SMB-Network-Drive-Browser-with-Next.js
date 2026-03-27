import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function UploadArea({ currentPath }: { currentPath: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const invalidateCache = useStore(state => state.invalidateCache);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const targetPath = currentPath ? `${currentPath}\\${file.name}` : file.name;
      const response = await fetch(`/api/smb/upload?path=${encodeURIComponent(targetPath)}`, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': 'application/octet-stream',
        }
      });
      if (!response.ok) throw new Error('Upload failed');
      
      invalidateCache(currentPath);
      window.location.reload(); 
    } catch (error) {
       console.error(error);
       alert('Upload failed');
    } finally {
       setIsUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="relative group w-full">
       <input 
         type="file" 
         className="hidden" 
         ref={fileInput} 
         onChange={onFileSelect} 
         disabled={isUploading}
       />
       <div 
         className={`border-2 border-dashed rounded-[1rem] p-5 text-center transition-all duration-300 cursor-pointer shadow-lg
            ${isUploading ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-neutral-700/80 bg-[#121216] hover:border-cyan-400/60 hover:bg-cyan-400/5'}`}
         onClick={() => !isUploading && fileInput.current?.click()}
       >
         {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-indigo-400">
               <Loader2 size={28} className="animate-spin text-cyan-400" />
               <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Uploading...</span>
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-neutral-500 group-hover:text-cyan-400 transition-colors">
               <div className="p-3 rounded-xl bg-neutral-900 shadow-inner group-hover:bg-cyan-500/10 transition-colors duration-300">
                 <UploadCloud size={24} className="transition-transform duration-300 group-hover:-translate-y-1" />
               </div>
               <div className="text-[11px] tracking-widest uppercase">
                 <span className="font-bold text-neutral-300 group-hover:text-cyan-300">Click to upload</span>
                 <br/><span className="text-neutral-600 mt-1 block">to current folder</span>
               </div>
            </div>
         )}
       </div>
    </div>
  );
}
