/**
 * End-to-End Encryption (E2EE) and Local Data Vault
 * Uses Web Cryptography API (SubtleCrypto) with AES-256-GCM and PBKDF2 key derivation.
 * Compatible with modern browsers, PWAs, and Node.js >= 19 test environments.
 */

const getSubtleCrypto = (): SubtleCrypto => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Cryptography API is not available in this environment');
};

const getRandomValues = (array: Uint8Array): Uint8Array => {
  if (typeof window !== 'undefined' && window.crypto) {
    return (window.crypto.getRandomValues(array as any) as unknown) as Uint8Array;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return (globalThis.crypto.getRandomValues(array as any) as unknown) as Uint8Array;
  }
  throw new Error('crypto.getRandomValues is not available');
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Derives an AES-GCM 256-bit CryptoKey from a user passphrase using PBKDF2 with SHA-256.
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  cipher: string; // Base64
  iv: string; // Base64
  salt: string; // Base64
  version: number;
}

/**
 * Encrypts arbitrary plain text or JSON string with AES-256-GCM.
 */
export async function encryptData(plainText: string, passphrase: string): Promise<EncryptedPayload> {
  const subtle = getSubtleCrypto();
  const salt = getRandomValues(new Uint8Array(16));
  const iv = getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const encodedText = enc.encode(plainText);

  const encryptedBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encodedText
  );

  return {
    cipher: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    version: 1,
  };
}

/**
 * Decrypts an EncryptedPayload using the provided passphrase.
 * Throws an error if the passphrase is wrong or the ciphertext was tampered with.
 */
export async function decryptData(payload: EncryptedPayload, passphrase: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const salt = new Uint8Array(base64ToArrayBuffer(payload.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
  const cipherBuffer = base64ToArrayBuffer(payload.cipher);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    cipherBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
