import {NextRequest, NextResponse} from 'next/server';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handler(req: NextRequest, { params }: { params: { slug: string[] } }) {
  if (!apiBaseUrl) {
    return new NextResponse('API base URL is not configured', {status: 500});
  }

  const slug = params.slug.join('/');
  const url = `${apiBaseUrl}/${slug}`;

  const headers = new Headers(req.headers);
  headers.delete('host'); // Let node-fetch set the host header

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.body,
      // @ts-ignore
      duplex: 'half', // Required for streaming request bodies
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    // Copy all headers from the backend response, but especially the session cookie
    for (const [key, value] of response.headers.entries()) {
       if (key.toLowerCase() === 'set-cookie') {
         responseHeaders.append(key, value);
       } else {
         responseHeaders.set(key, value);
       }
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
