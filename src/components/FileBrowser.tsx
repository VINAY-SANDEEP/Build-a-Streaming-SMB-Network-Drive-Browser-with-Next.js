'use client';

import React, { useState } from 'react';
import DirectoryTree from './DirectoryTree';
import FilePreviewPanel from './FilePreviewPanel';
import UploadArea from './UploadArea';
import BreadcrumbBar from './BreadcrumbBar';

export default function FileBrowser() {
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleDownloadZip = async () => {
    if (selectedItems.length === 0) return;
    try {
      const response = await fetch('/api/smb/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paths: selectedItems }),
      });
      if (!response.ok) throw new Error('Zip download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'download.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to download ZIP');
    }
  };

  return (
    <div className="flex flex-col h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
      <BreadcrumbBar path={currentPath} onNavigate={(p) => { setCurrentPath(p); setSelectedFile(null); }} />

      {selectedItems.length > 0 && (
        <div className="bg-indigo-900/30 p-3 px-6 flex justify-between items-center border-b border-indigo-500/20 backdrop-blur-md">
          <span className="text-indigo-300 text-sm font-medium tracking-wide">
            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
          </span>
          <button 
            onClick={handleDownloadZip}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
          >
            <span>Download ZIP</span>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left pane: Tree */}
        <div className="w-80 lg:w-[400px] border-r border-neutral-800/80 flex flex-col bg-neutral-950/40">
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <React.Suspense fallback={<div className="animate-pulse flex flex-col space-y-4 p-4">
              <div className="h-5 bg-neutral-800 rounded w-3/4"></div>
              <div className="h-5 bg-neutral-800 rounded w-1/2 ml-6"></div>
              <div className="h-5 bg-neutral-800 rounded w-2/3 ml-6"></div>
            </div>}>
              <DirectoryTree 
                path="" 
                onSelectFile={(file) => setSelectedFile(file)} 
                currentPath={currentPath} 
                onSelectPath={setCurrentPath} 
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
              />
            </React.Suspense>
          </div>
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 backdrop-blur-sm">
            <UploadArea currentPath={currentPath} />
          </div>
        </div>
        
        {/* Right pane: Preview */}
        <div className="flex-1 flex flex-col bg-[#0b0b0f] relative overflow-hidden">
           <FilePreviewPanel file={selectedFile} />
        </div>
      </div>
    </div>
  );
}
