import {NextRequest, NextResponse} from 'next/server';

// This is the proxy route. It will forward all requests from /api/* to the backend.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handler(
  req: NextRequest,
  {params}: {params: {slug: string[]}}
) {
  if (!apiBaseUrl) {
    return new NextResponse('API base URL is not configured', {status: 500});
  }

  const url = `${apiBaseUrl}/get/all_users`;

  // Clone headers from the incoming request.
  const headers = new Headers(req.headers);
  // The host header needs to be removed or the request will be rejected by some servers.
  headers.delete('host');

  try {
    // Make the request to the backend.
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      // Pass the body only if it's not a GET or HEAD request.
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      // Important for streaming response bodies and for Next.js to not buffer the whole response.
      // @ts-ignore - duplex is a valid option in Node.js fetch, but not in all TS typings yet.
      duplex: 'half',
      redirect: 'manual', // Prevent fetch from following redirects automatically.
    });

    // Create a new response with the backend's headers, status, and body.
    const responseHeaders = new Headers(response.headers);
    // Pass cookies from the backend to the client. This is crucial for login sessions.
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie);
    }
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new NextResponse('API proxy error', {status: 502}); // 502 Bad Gateway
  }
}

// Export the handler for all HTTP methods.
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as HEAD,
  handler as OPTIONS,
};
