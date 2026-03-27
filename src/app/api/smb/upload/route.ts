import { NextRequest, NextResponse } from 'next/server';
import { writeFileStream } from '@/lib/smb-client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    
    if (!path) {
       return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const sanitizedPath = path.replace(/\.\./g, '').replace(/\//g, '\\');

    if (!req.body) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    const smbWriteStream = await writeFileStream(sanitizedPath);
    
    const reader = req.body.getReader();

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          smbWriteStream.end();
          break;
        }
        smbWriteStream.write(Buffer.from(value));
      }
    };

    await pump();

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Upload error:', error);
    if (error.code === 'STATUS_LOGON_FAILURE') {
      return NextResponse.json({ error: 'Authentication failed. Please check your credentials.' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Upload Failed' }, { status: 500 });
  }
}
