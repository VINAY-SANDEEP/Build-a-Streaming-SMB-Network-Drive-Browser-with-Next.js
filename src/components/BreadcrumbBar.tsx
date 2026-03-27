import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function BreadcrumbBar({ path, onNavigate }: { path: string, onNavigate: (p: string) => void }) {
  const parts = path ? path.split('\\').filter(Boolean) : [];

  return (
    <div className="flex items-center space-x-2 p-4 bg-neutral-900/40 border-b border-white/5 shadow-md backdrop-blur-md" data-test-id="breadcrumb-bar">
      <button 
        onClick={() => onNavigate('')}
        className="text-neutral-500 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-neutral-800/80 transition-all duration-200"
      >
        <Home size={18} />
      </button>
      {parts.length > 0 && <span className="text-neutral-700"><ChevronRight size={16} /></span>}
      {parts.map((part, index) => {
        const fullPath = parts.slice(0, index + 1).join('\\');
        return (
          <React.Fragment key={fullPath}>
            <button
              onClick={() => onNavigate(fullPath)}
              className={`text-sm tracking-wide transition-colors ${index === parts.length - 1 ? 'text-indigo-300 font-semibold' : 'text-neutral-400 font-medium hover:text-indigo-400'}`}
            >
              {part}
            </button>
            {index < parts.length - 1 && <span className="text-neutral-700"><ChevronRight size={16} /></span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
