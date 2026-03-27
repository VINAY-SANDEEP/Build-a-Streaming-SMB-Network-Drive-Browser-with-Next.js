import { useStore } from '@/store/useStore';

const promiseCache = new Map();

export function useDirectory(path: string) {
  const cache = useStore.getState().cache;
  if (cache[path]) return cache[path];
  
  if (!promiseCache.has(path)) {
    const promise = fetch(`/api/smb/list?path=${encodeURIComponent(path)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        // Ensure data is sorted: folders first
        const sorted = data.sort((a: any, b: any) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'directory' ? -1 : 1;
        });
        useStore.getState().setCache(path, sorted);
        promiseCache.delete(path);
      })
      .catch(err => {
        promiseCache.delete(path);
        throw err;
      });
    promiseCache.set(path, promise);
  }
  
  throw promiseCache.get(path);
}
