import { encryptPayload, decryptPayload } from "./crypto";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CLIENT_API_KEY || "";
const DISABLE_API_ENCRYPTION = process.env.NEXT_PUBLIC_DISABLE_API_ENCRYPTION === "true";

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const url = `${API_URL}${endpoint}`;
  
  // 1. Prepare default headers
  const headers = new Headers(options.headers || {});
  headers.set("x-api-key", CLIENT_API_KEY);
  
  // 2. Attach JWT bearer token if exists in local storage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const method = (options.method || "GET").toUpperCase();
  let requestBody = options.body;

  // 3. Encrypt payload for write requests if not bypassed
  if (["POST", "PUT", "PATCH"].includes(method) && requestBody) {
    headers.set("Content-Type", "application/json");
    
    if (!DISABLE_API_ENCRYPTION) {
      // Encrypt the request payload
      const encrypted = await encryptPayload(requestBody);
      requestBody = JSON.stringify(encrypted);
    } else {
      // Send plain JSON
      requestBody = JSON.stringify(requestBody);
    }
  }

  // 4. Execute fetch
  const response = await fetch(url, {
    ...options,
    method,
    headers,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type");
  let data: any = null;

  if (contentType && contentType.includes("application/json")) {
    const rawJson = await response.json();

    // 5. Decrypt response payload if encrypted
    if (rawJson && typeof rawJson === "object" && "ciphertext" in rawJson && "iv" in rawJson && "tag" in rawJson) {
      data = await decryptPayload(rawJson);
    } else {
      data = rawJson;
    }
  } else {
    const textData = await response.text();
    try {
      data = JSON.parse(textData);
    } catch {
      data = textData;
    }
  }

  // 6. Handle HTTP errors
  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
