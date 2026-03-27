'use client';

import React, { useState } from 'react';
import { useDirectory } from '@/lib/fetcher';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, CheckSquare, Square } from 'lucide-react';

interface TreeNodeProps {
  path: string;
  name?: string;
  isRoot?: boolean;
  onSelectFile: (file: any) => void;
  currentPath: string;
  onSelectPath: (path: string) => void;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function DirectoryTree({ path, name = 'Root', isRoot = true, onSelectFile, currentPath, onSelectPath, selectedItems, setSelectedItems }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(isRoot);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    onSelectPath(path);
  };

  const isSelected = path === currentPath;

  return (
    <div className="select-none text-neutral-300 font-medium">
      {!isRoot && (
        <div 
          className={`flex items-center group cursor-pointer py-1.5 px-2 rounded-lg transition-all duration-200 ${isSelected ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-neutral-800/60'}`}
          onClick={toggleOpen}
        >
          <div className="mr-1.5 w-4 h-4 flex items-center justify-center text-neutral-500 transition-transform">
            {isOpen ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} />}
          </div>
          {isOpen ? (
            <FolderOpen size={16} className="mr-2.5 text-indigo-400 animate-in zoom-in-95 duration-200" />
          ) : (
             <Folder size={16} className={`mr-2.5 ${isSelected ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-neutral-400'}`} />
          )}
          <span className="truncate text-sm tracking-wide">{name}</span>
        </div>
      )}
      {isOpen && (
        <div className={`${isRoot ? '' : 'ml-4 pl-4 border-l border-neutral-800/60'}`}>
          <React.Suspense fallback={<div data-test-id={`tree-loading-${name}`} className="ml-6 my-3 h-4 w-24 bg-neutral-800 rounded animate-pulse" />}>
            <FolderContents 
              path={path} 
              onSelectFile={onSelectFile} 
              currentPath={currentPath} 
              onSelectPath={onSelectPath} 
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems} 
            />
          </React.Suspense>
        </div>
      )}
    </div>
  );
}

function FolderContents({ path, onSelectFile, currentPath, onSelectPath, selectedItems, setSelectedItems }: Omit<TreeNodeProps, 'isRoot' | 'name'>) {
  const files = useDirectory(path);

  const toggleSelect = (itemPath: string) => {
    setSelectedItems(prev => 
      prev.includes(itemPath) ? prev.filter(p => p !== itemPath) : [...prev, itemPath]
    );
  };

  if (!files || files.length === 0) {
    return <div className="py-3 px-3 text-xs text-neutral-600 italic tracking-wider">Empty</div>;
  }

  return (
    <div className="mt-1 flex flex-col space-y-[2px]" data-test-id={`tree-children-${path || 'root'}`}>
      {files.map((file: any) => {
        if (file.type === 'directory') {
          return (
            <div data-test-id={`tree-folder-node-${file.name}`} key={file.path}>
               <DirectoryTree 
                 path={file.path} 
                 name={file.name} 
                 isRoot={false} 
                 onSelectFile={onSelectFile} 
                 currentPath={currentPath} 
                 onSelectPath={onSelectPath} 
                 selectedItems={selectedItems}
                 setSelectedItems={setSelectedItems} 
               />
            </div>
          );
        }

        const checked = selectedItems.includes(file.path);

        return (
          <div 
            key={file.path}
            className={`flex items-center group cursor-pointer py-1.5 px-2 rounded-lg transition-all duration-200 hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200`}
            onClick={() => onSelectFile(file)}
          >
            <div 
              className="mr-3 text-neutral-600 hover:text-indigo-400 transition-colors"
              onClick={(e) => { e.stopPropagation(); toggleSelect(file.path); }}
            >
              {checked ? <CheckSquare size={15} className="text-indigo-400" /> : <Square size={15} />}
            </div>
            <File size={15} className="mr-2.5 text-neutral-500/80 group-hover:text-neutral-400" />
            <span className="truncate text-sm flex-1 tracking-wide">{file.name}</span>
          </div>
        );
      })}
    </div>
  );
}
