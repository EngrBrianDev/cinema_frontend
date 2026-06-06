// Helper to convert hex string to Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
  const match = hexString.match(/.{1,2}/g);
  if (!match) return new Uint8Array(0);
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
}

// Helper to convert Uint8Array to hex string
function uint8ArrayToHex(byteArray: Uint8Array): string {
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const keyHex = process.env.NEXT_PUBLIC_API_ENCRYPTION_KEY || "";

// Cache the imported CryptoKey
let cachedKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  if (!keyHex || keyHex.length !== 64) {
    throw new Error("NEXT_PUBLIC_API_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }

  const rawKey = hexToUint8Array(keyHex);
  cachedKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey as any,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

  return cachedKey;
}

/**
 * Encrypts a payload into AES-256-GCM hex fields compatible with NestJS backend.
 */
export async function encryptPayload(payload: any): Promise<{
  ciphertext: string;
  iv: string;
  tag: string;
}> {
  try {
    const cryptoKey = await getCryptoKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV is standard for GCM
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(payload));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as any,
        tagLength: 128, // 16-byte authentication tag
      },
      cryptoKey,
      encodedData as any
    );

    // Web Crypto API appends the 16-byte auth tag at the end of the ciphertext array buffer.
    // We split it to match the backend's { ciphertext, iv, tag } separation.
    const fullBuffer = new Uint8Array(encryptedBuffer);
    const ciphertextPart = fullBuffer.slice(0, fullBuffer.length - 16);
    const tagPart = fullBuffer.slice(fullBuffer.length - 16);

    return {
      ciphertext: uint8ArrayToHex(ciphertextPart),
      iv: uint8ArrayToHex(iv),
      tag: uint8ArrayToHex(tagPart),
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Payload encryption failed.");
  }
}

/**
 * Decrypts a NestJS AES-256-GCM response payload.
 */
export async function decryptPayload(encrypted: {
  ciphertext: string;
  iv: string;
  tag: string;
}): Promise<any> {
  try {
    const cryptoKey = await getCryptoKey();
    const ciphertextBytes = hexToUint8Array(encrypted.ciphertext);
    const tagBytes = hexToUint8Array(encrypted.tag);
    const ivBytes = hexToUint8Array(encrypted.iv);

    // Concatenate ciphertext and tag back into a single buffer for Web Crypto API
    const fullBuffer = new Uint8Array(ciphertextBytes.length + tagBytes.length);
    fullBuffer.set(ciphertextBytes, 0);
    fullBuffer.set(tagBytes, ciphertextBytes.length);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes as any,
        tagLength: 128,
      },
      cryptoKey,
      fullBuffer as any
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);

    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Payload decryption failed.");
  }
}
