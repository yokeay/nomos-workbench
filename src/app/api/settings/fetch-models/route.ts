import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const { baseUrl, apiKey } = await request.json();
    if (!baseUrl || !apiKey) {
      return NextResponse.json({ code: 1003, message: 'baseUrl and apiKey required', data: null }, { status: 400 });
    }

    // Normalize base URL: strip trailing slash
    const url = baseUrl.replace(/\/+$/, '');
    const modelsUrl = `${url}/v1/models`;

    const res = await fetch(modelsUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return NextResponse.json({
        code: 5000,
        message: `Failed to fetch models: ${res.status} ${errText.slice(0, 200)}`,
        data: null,
      }, { status: 502 });
    }

    const data = await res.json();
    // OpenAI-compatible /v1/models returns { object: "list", data: [{ id: "model-name", ... }] }
    const models: string[] = (data.data ?? [])
      .map((m: any) => m.id)
      .filter(Boolean)
      .sort();

    if (models.length === 0) {
      return NextResponse.json({ code: 0, message: 'ok', data: [], hint: 'No models returned from provider' });
    }

    return NextResponse.json({ code: 0, message: 'ok', data: models });
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json({ code: 5000, message: 'Request timed out', data: null }, { status: 504 });
    }
    console.error('Fetch models error:', error);
    return NextResponse.json({ code: 5000, message: error.message || 'Failed to fetch models', data: null }, { status: 500 });
  }
}
