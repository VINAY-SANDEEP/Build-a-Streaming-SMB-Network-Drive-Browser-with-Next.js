import dynamic from 'next/dynamic';

const FileBrowser = dynamic(() => import('@/components/FileBrowser'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            Network Drive
          </h1>
          <div className="text-sm text-neutral-400 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800 shadow-inner">
            Connected to SMB
          </div>
        </header>
        <FileBrowser />
      </div>
    </main>
  );
}
