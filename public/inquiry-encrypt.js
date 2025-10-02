/**
 * Inquiry Encryption Library
 * 외부 사이트에서 제보 데이터를 암호화하여 전송하기 위한 라이브러리
 */

class InquiryEncryptor {
  constructor(apiBaseUrl = 'https://yoursite.com') {
    this.apiBaseUrl = apiBaseUrl;
    this.publicKey = null;
  }

  /**
   * 공개키를 가져와서 초기화
   */
  async init() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/public-key`);
      const data = await response.json();
      this.publicKey = data.publicKey;
      return true;
    } catch (error) {
      console.error('Failed to fetch public key:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * PEM 형식의 공개키를 CryptoKey 객체로 변환
   */
  async importPublicKey(pem) {
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

  /**
   * Base64 문자열을 ArrayBuffer로 변환
   */
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * ArrayBuffer를 Base64 문자열로 변환
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * 텍스트를 RSA 공개키로 암호화
   */
  async encryptText(text) {
    if (!this.publicKey) {
      throw new Error('Encryptor not initialized. Call init() first.');
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

  /**
   * 제보 데이터를 암호화
   * @param {Object} formData - { title, content, name, phone, email }
   * @returns {Object} - 암호화된 데이터
   */
  async encrypt(formData) {
    const encryptedTitle = await this.encryptText(formData.title);
    const encryptedContent = await this.encryptText(formData.content);
    const encryptedEmail = await this.encryptText(formData.email);
    const encryptedName = await this.encryptText(formData.name);
    const encryptedPhone = formData.phone
      ? await this.encryptText(formData.phone)
      : null;

    return {
      encrypted_title: encryptedTitle,
      encrypted_content: encryptedContent,
      encrypted_email: encryptedEmail,
      encrypted_name: encryptedName,
      encrypted_phone: encryptedPhone,
    };
  }

  /**
   * 암호화된 데이터를 API로 전송
   */
  async submit(formData) {
    const encrypted = await this.encrypt(formData);

    const response = await fetch(`${this.apiBaseUrl}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encrypted),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit inquiry');
    }

    return await response.json();
  }
}

// 사용 예제:
/*
const encryptor = new InquiryEncryptor('https://yoursite.com');
await encryptor.init();

const result = await encryptor.submit({
  title: '제보 제목',
  content: '제보 내용',
  name: '제보자 이름',
  phone: '010-1234-5678',
  email: 'reporter@example.com'
});

console.log('제보 완료:', result);
*/
