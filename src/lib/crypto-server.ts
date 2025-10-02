import crypto from 'crypto';

// RSA key pair generation (run once and save to env)
export function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { publicKey, privateKey };
}

// Decrypt data using private key
export function decrypt(encryptedData: string, privateKey: string): string {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Get keys from environment
export function getKeys() {
  const publicKey = process.env.RSA_PUBLIC_KEY;
  const privateKey = process.env.RSA_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('RSA keys not found in environment variables');
  }

  return { publicKey, privateKey };
}
