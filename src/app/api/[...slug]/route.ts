import {NextRequest, NextResponse} from 'next/server';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handler(
  req: NextRequest,
  {params}: {params: {slug: string[]}}
) {
  if (!apiBaseUrl) {
    return new NextResponse('API base URL is not configured', {status: 500});
  }

  // The `slug` param is an array of path segments.
  // e.g., for `/api/get/all_users`, slug would be `['get', 'all_users']`
  const slugPath = params.slug.join('/');
  const url = `${apiBaseUrl}/${slugPath}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      redirect: 'manual',
    });

    // Create a new response with the backend's headers, status, and body.
    const responseHeaders = new Headers(response.headers);
    // Pass cookies from the backend to the client.
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
