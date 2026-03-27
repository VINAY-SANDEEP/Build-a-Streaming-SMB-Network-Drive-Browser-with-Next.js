import { NextRequest, NextResponse } from 'next/server';
import { readFileStream } from '@/lib/smb-client';
import mime from 'mime-types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    if (!path) return NextResponse.json({ error: 'Path is required' }, { status: 400 });

    const sanitizedPath = path.replace(/\.\./g, '').replace(/\//g, '\\');
    const fileName = sanitizedPath.split('\\').pop() || 'download';
    
    const nodeStream = await readFileStream(sanitizedPath);

    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk: any) => {
          controller.enqueue(chunk);
        });
        nodeStream.on('end', () => {
          controller.close();
        });
        nodeStream.on('error', (err: any) => {
          controller.error(err);
        });
      },
      cancel() {
        nodeStream.destroy();
      }
    });

    const contentType = mime.lookup(fileName) || 'application/octet-stream';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);

    return new Response(webStream, { headers });
  } catch (error: any) {
    console.error('Download error:', error);
    if (error.code === 'STATUS_OBJECT_NAME_NOT_FOUND') {
      return NextResponse.json({ error: 'Path not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Download Failed' }, { status: 500 });
  }
}
