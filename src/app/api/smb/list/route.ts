import { NextRequest, NextResponse } from 'next/server';
import { listDirectory } from '@/lib/smb-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path') || '';

    // Sanitize path slightly
    const sanitizedPath = path.replace(/\.\./g, '').replace(/\//g, '\\');

    const files = await listDirectory(sanitizedPath);
    return NextResponse.json(files);
  } catch (error: any) {
    console.error('List error:', error);
    if (error.code === 'STATUS_LOGON_FAILURE' || String(error).includes('Access denied')) {
      return NextResponse.json({ error: 'Authentication failed. Please check your credentials.' }, { status: 401 });
    }
    if (error.code === 'STATUS_OBJECT_NAME_NOT_FOUND' || String(error).includes('not found')) {
      return NextResponse.json({ error: 'Path not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
