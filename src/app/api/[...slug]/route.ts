import {NextRequest, NextResponse} from 'next/server';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handler(req: NextRequest) {
  if (!apiBaseUrl) {
    return new NextResponse('API base URL is not configured', {status: 500});
  }

  const {pathname, search} = new URL(req.url);
  const slug = pathname.replace('/api/', '');
  const url = `${apiBaseUrl}/${slug}${search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('x-forwarded-host');
  headers.delete('x-forwarded-proto');
  headers.delete('x-forwarded-port');
  headers.delete('x-forwarded-for');

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    
    // Pass cookies from the backend to the client
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
