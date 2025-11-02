import {NextRequest, NextResponse} from 'next/server';
import {headers} from 'next/headers';

// Hardcoding the base URL to eliminate environment variable issues.
const apiBaseUrl = 'https://unengaged-slatier-anibal.ngrok-free.dev';

async function handler(req: NextRequest) {
  const {pathname, search} = req.nextUrl;
  const path = pathname.replace(/^\/api/, '');

  if (!apiBaseUrl) {
    return new NextResponse('API base URL is not configured', {status: 500});
  }

  const url = `${apiBaseUrl}${path}${search}`;

  const requestHeaders = new Headers(req.headers);

  // Ensure the host header is set to the target backend's host
  const parsedUrl = new URL(url);
  requestHeaders.set('host', parsedUrl.host);

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: requestHeaders,
      body: req.body,
      // @ts-ignore
      duplex: 'half',
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);

    // Forward the Set-Cookie header from the backend to the client
    const setCookie = response.headers.get('Set-Cookie');
    if (setCookie) {
      responseHeaders.set('Set-Cookie', setCookie);
    }
    
    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
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
