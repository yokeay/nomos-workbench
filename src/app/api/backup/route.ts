import { auth } from '@/lib/auth';
import * as backup from '@/lib/backup';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const name = await backup.createBackup();
    return NextResponse.json({ code: 0, message: 'Backup created', data: { name } });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ code: 5000, message: 'Backup failed', data: null }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const backups = backup.listBackups();
    return NextResponse.json({ code: 0, message: 'ok', data: backups });
  } catch (error) {
    console.error('List backups error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to list backups', data: null }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ code: 400, message: 'name required', data: null }, { status: 400 });
    const deleted = backup.deleteBackup(name);
    if (!deleted) return NextResponse.json({ code: 404, message: 'Not found', data: null }, { status: 404 });
    return NextResponse.json({ code: 0, message: 'ok' });
  } catch (error) {
    console.error('Delete backup error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to delete backup', data: null }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const body = await request.json();
    const restored = backup.restoreFromBackup(body.backupName);
    if (!restored) return NextResponse.json({ code: 404, message: 'Backup not found', data: null }, { status: 404 });
    return NextResponse.json({ code: 0, message: 'Restored, please refresh' });
  } catch (error) {
    console.error('Restore backup error:', error);
    return NextResponse.json({ code: 5000, message: 'Restore failed', data: null }, { status: 500 });
  }
}
