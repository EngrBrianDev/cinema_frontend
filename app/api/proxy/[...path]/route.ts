import { NextRequest, NextResponse } from "next/server";

async function handleProxy(
  request: NextRequest,
  params: { path: string[] }
) {
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
  const apiKey = process.env.BACKEND_CLIENT_API_KEY || "";

  if (!backendUrl) {
    return NextResponse.json(
      { error: "BACKEND_API_URL is not configured" },
      { status: 500 }
    );
  }

  const path = params.path.join("/");
  const searchParams = request.nextUrl.search;
  const targetUrl = `${backendUrl}/${path}${searchParams}`;

  // 1. Copy headers from the incoming client request
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Skip host, connection, and host-related headers to let the fetch request set them dynamically
    if (
      lowerKey !== "host" &&
      lowerKey !== "connection" &&
      lowerKey !== "content-length"
    ) {
      headers.set(key, value);
    }
  });

  // 2. Attach the backend API key on the server side
  headers.set("x-api-key", apiKey);

  // 3. Extract the request body
  let body: any = null;
  const method = request.method;
  if (!["GET", "HEAD"].includes(method)) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // For file uploads and multipart/form-data, forward the stream directly
      body = request.body;
    } else {
      // Read JSON or plain text as ArrayBuffer
      body = await request.arrayBuffer();
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // @ts-ignore
      duplex: "half", // Required for streaming request bodies in Node/undici environment
    });

    // 4. Copy backend response headers to return to the client
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Do not forward cache-control if we want client-specific control, but in this case, forwarding is safe.
      // We skip content-encoding since Next.js/Vercel handles compression
      if (key.toLowerCase() !== "content-encoding") {
        responseHeaders.set(key, value);
      }
    });

    // 5. Stream the response body back to the client browser
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy connection error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend cinema service", details: error.message },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params);
}
