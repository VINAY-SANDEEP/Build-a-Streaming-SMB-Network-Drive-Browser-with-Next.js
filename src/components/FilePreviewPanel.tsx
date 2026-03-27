import React, { useState, useEffect } from 'react';
import { FileDown, Trash2, FileText, Image as ImageIcon, Box } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function FilePreviewPanel({ file }: { file: any }) {
  const [content, setContent] = useState<string | null>(null);
  const invalidateCache = useStore(state => state.invalidateCache);

  useEffect(() => {
    if (!file) {
      setContent(null);
      return;
    }

    const { name, path } = file;
    const isText = name.match(/\.(txt|md|js|ts|json|csv|html|css|tsx|jsx)$/i);
    if (isText && file.size < 1000000) { 
      fetch(`/api/smb/download?path=${encodeURIComponent(path)}`)
        .then(res => res.text())
        .then(text => setContent(text))
        .catch(console.error);
    } else {
      setContent(null);
    }
  }, [file]);

  if (!file) {
    return (
       <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 space-y-5 inset-0 absolute">
         <div className="p-8 rounded-[2rem] bg-neutral-900/30 border border-neutral-800 shadow-inner group transition-all duration-300 hover:scale-105">
            <Box size={48} className="text-neutral-700 group-hover:text-neutral-500 transition-colors" />
         </div>
         <p className="tracking-[0.2em] font-medium text-xs text-neutral-500">SELECT A FILE TO PREVIEW</p>
       </div>
    );
  }

  const handleDelete = async () => {
    if (confirm(`Delete ${file.name}?`)) {
      await fetch(`/api/smb/delete?path=${encodeURIComponent(file.path)}`, { method: 'DELETE' });
      const parts = file.path.split('\\');
      parts.pop();
      invalidateCache(parts.join('\\'));
      window.location.reload(); 
    }
  };

  const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0e] relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 px-8 py-5 border-b border-neutral-800/50 flex justify-between items-center bg-neutral-950/20 backdrop-blur-md">
        <div>
           <h3 className="text-xl font-bold text-neutral-100/90 tracking-wide flex items-center gap-4">
             {isImage ? <ImageIcon size={22} className="text-cyan-400" /> : <FileText size={22} className="text-emerald-400" />}
             {file.name}
           </h3>
           <p className="text-[11px] text-neutral-500 mt-2 tracking-[0.1em] font-medium font-mono uppercase">
             {(file.size / 1024).toFixed(2)} KB <span className="mx-2 text-neutral-700">|</span> Date Modified: {new Date(file.lastModified).toLocaleDateString()}
           </p>
        </div>
        <div className="flex space-x-3">
          <a
            href={`/api/smb/download?path=${encodeURIComponent(file.path)}`}
            download
            className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-neutral-950 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/20 active:scale-95"
          >
            <FileDown size={18} /> <span>Download</span>
          </a>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-5 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-rose-500/5 hover:shadow-rose-500/20 active:scale-95"
          >
            <Trash2 size={18} /> <span>Delete</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-8 relative z-10 custom-scrollbar">
        {isImage ? (
           <div className="flex justify-center items-center w-full h-full p-4">
              <img 
                src={`/api/smb/preview?path=${encodeURIComponent(file.path)}`} 
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
              />
           </div>
        ) : content !== null ? (
           <pre className="text-sm font-mono text-neutral-300/90 bg-[#121217] border border-neutral-800/80 p-6 rounded-2xl shadow-inner whitespace-pre-wrap overflow-x-auto selection:bg-indigo-500/40 rendering-auto">
             {content}
           </pre>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 space-y-5 absolute inset-0">
               <div className="opacity-20 animate-pulse">
                 <FileText size={64} />
               </div>
               <p className="text-xs tracking-[0.2em] font-medium text-neutral-600">PREVIEW NOT AVAILABLE</p>
           </div>
        )}
      </div>
    </div>
  );
}
