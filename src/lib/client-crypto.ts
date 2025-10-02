/**
 * Client-side encryption utilities
 */

export class ClientCrypto {
  private publicKey: string | null = null;

  async init() {
    const response = await fetch('/api/public-key');
    const data = await response.json();
    this.publicKey = data.publicKey;
  }

  private async importPublicKey(pem: string): Promise<CryptoKey> {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');

    const binaryDer = this.base64ToArrayBuffer(pemContents);

    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async encrypt(text: string): Promise<string> {
    if (!this.publicKey) {
      throw new Error('Crypto not initialized. Call init() first.');
    }

    const cryptoKey = await this.importPublicKey(this.publicKey);
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      cryptoKey,
      data
    );

    return this.arrayBufferToBase64(encrypted);
  }
}
