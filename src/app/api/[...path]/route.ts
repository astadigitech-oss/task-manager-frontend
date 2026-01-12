import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_BASE_URL;

if (!BACKEND_URL) {
    throw new Error('BACKEND_BASE_URL is not defined!');
}

// Selalu bypass SSL verification untuk backend ini
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

async function handleRequest(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;

    try {
        const path = params.path.join('/');
        const searchParams = request.nextUrl.searchParams.toString();
        
        const isAuthEndpoint = path.startsWith('auth/');
        const isImageEndpoint = path.startsWith('profile-images/') || path.startsWith('uploads/');
        
        let backendPath: string;
        if (isAuthEndpoint) {
            backendPath = path;
        } else if (isImageEndpoint) {
            backendPath = path;
        } else {
            backendPath = `api/${path}`;
        }
        
        const fullUrl = searchParams
            ? `${BACKEND_URL}/${backendPath}?${searchParams}`
            : `${BACKEND_URL}/${backendPath}`;

        let body: string | undefined;
        const method = request.method;

        if (method !== 'GET' && method !== 'DELETE') {
            try {
                body = await request.text();
            } catch (e) {
                body = undefined;
            }
        }

        const headers: HeadersInit = {};
        request.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (!['host', 'connection', 'content-length', 'authorization'].includes(lowerKey)) {
                headers[key] = value;
            }
        });

        const tokenCookie = request.cookies.get('token')?.value;
        if (tokenCookie) {
            headers['Authorization'] = tokenCookie;
        }

        const response = await fetch(fullUrl, {
            method,
            headers,
            body: body || undefined,
            // @ts-ignore
            agent: BACKEND_URL.startsWith('https') ? httpsAgent : undefined,
        });

        const contentType = response.headers.get('content-type') || '';
        let data: string | ArrayBuffer;

        if (contentType.includes('application/json')) {
            data = await response.text();
        } else if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
            data = await response.arrayBuffer();
        } else {
            data = await response.text();
        }

        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'Content-Type': contentType,
                ...(response.headers.get('Access-Control-Allow-Origin') && {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin')!,
                }),
            },
        });

    } catch (error) {
        console.error('[PROXY ERROR]', {
            message: error instanceof Error ? error.message : String(error),
            path: params.path.join('/'),
        });

        return NextResponse.json(
            {
                error: 'Proxy failed',
                message: error instanceof Error ? error.message : String(error),
                path: params.path.join('/'),
            },
            { status: 502 }
        );
    }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;

export const dynamic = 'force-dynamic';