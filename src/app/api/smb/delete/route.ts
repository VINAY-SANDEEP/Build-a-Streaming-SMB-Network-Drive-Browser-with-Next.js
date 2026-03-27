import { NextRequest, NextResponse } from 'next/server';
import { deleteFileOrDirectory } from '@/lib/smb-client';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    if (!path) return NextResponse.json({ error: 'Path is required' }, { status: 400 });

    const sanitizedPath = path.replace(/\.\./g, '').replace(/\//g, '\\');
    await deleteFileOrDirectory(sanitizedPath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    if (error.code === 'STATUS_OBJECT_NAME_NOT_FOUND') {
      return NextResponse.json({ error: 'Path not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Deletion failed' }, { status: 500 });
  }
}
