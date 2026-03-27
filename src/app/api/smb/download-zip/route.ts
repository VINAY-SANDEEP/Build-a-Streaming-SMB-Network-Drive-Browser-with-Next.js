import { NextRequest, NextResponse } from 'next/server';
import { readFileStream } from '@/lib/smb-client';
import archiver from 'archiver';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { paths } = await req.json();
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: 'Paths must be a non-empty array' }, { status: 400 });
    }

    const archive = archiver('zip', {
      zlib: { level: 0 }, // Level 0 means no compression, just store (much faster for streaming over network)
    });

    const webStream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk) => controller.enqueue(chunk));
        archive.on('end', () => controller.close());
        archive.on('error', (err) => controller.error(err));
        archive.on('warning', (err) => {
           if (err.code === 'ENOENT') {
               console.warn('Archiver warning:', err);
           } else {
               controller.error(err);
           }
        });
      },
      cancel() {
        archive.abort();
      }
    });

    // Add each file to the archive asynchronously
    for (const path of paths) {
      if (typeof path !== 'string') continue;
      const sanitizedPath = path.replace(/\.\./g, '').replace(/\//g, '\\');
      const fileName = sanitizedPath.split('\\').pop() || 'file';
      
      try {
        const stream = await readFileStream(sanitizedPath);
        archive.append(stream, { name: fileName });
      } catch (err) {
        console.error(`Skipping ${path} due to error`, err);
        // Depending on requirements, we could fail the whole request, but skipping might be better
      }
    }
    
    // Finalize the archive after all streams are appended
    archive.finalize();

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', 'attachment; filename="download.zip"');

    return new Response(webStream, { headers });

  } catch (error: any) {
    console.error('Download ZIP error:', error);
    return NextResponse.json({ error: error.message || 'ZIP Streaming Failed' }, { status: 500 });
  }
}
