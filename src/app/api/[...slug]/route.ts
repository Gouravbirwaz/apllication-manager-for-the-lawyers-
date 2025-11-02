import {NextRequest, NextResponse} from 'next/server';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handler(req: NextRequest) {
  if (!apiBaseUrl) {
    return new NextResponse('API base URL is not configured', {status: 500});
  }

  // Extract the path from the request URL
  const pathname = new URL(req.url).pathname;
  const path = pathname.replace(/^\/api/, '');
  
  const url = `${apiBaseUrl}${path}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      // @ts-ignore - duplex is a valid option for streaming
      duplex: 'half',
      redirect: 'manual',
    });
    
    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new NextResponse('API proxy error', {status: 502});
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
