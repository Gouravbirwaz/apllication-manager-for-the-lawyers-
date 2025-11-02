import { NextRequest, NextResponse } from 'next/server';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handler(req: NextRequest, { params }: { params: { slug: string[] } }) {
  if (!apiBaseUrl) {
    return new NextResponse('API base URL is not configured', { status: 500 });
  }

  const path = params.slug.join('/');
  const url = new URL(path, apiBaseUrl);
  url.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.set('host', url.host);

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: req.body,
      // @ts-ignore
      duplex: 'half',
      redirect: 'manual',
    });

    return response;
  } catch (error) {
    console.error('API proxy error:', error);
    return new NextResponse('API proxy error', { status: 502 });
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as HEAD,
  handler as OPTIONS,
};
