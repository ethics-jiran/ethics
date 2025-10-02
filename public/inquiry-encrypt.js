/**
 * Inquiry Encryption Library (AES-GCM)
 * 외부 사이트에서 제보 데이터를 암호화하여 전송하기 위한 라이브러리
 */

class InquiryEncryptor {
  constructor(supabaseUrl = 'https://domjuxvrnglsohyqdzmi.supabase.co') {
    this.supabaseUrl = supabaseUrl;
    this.functionsUrl = `${supabaseUrl}/functions/v1`;
  }

  /**
   * 일회성 AES 키 요청
   */
  async getEncryptionKey() {
    const response = await fetch(`${this.functionsUrl}/aes-key`);
    if (!response.ok) {
      throw new Error('Failed to get encryption key');
    }
    return await response.json();
  }

  /**
   * Hex 문자열을 Uint8Array로 변환
   */
  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * AES-GCM으로 텍스트 암호화
   */
  async encryptText(text, keyHex) {
    // Hex 키를 바이트로 변환
    const keyBytes = this.hexToBytes(keyHex);

    // 키 가져오기
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // 랜덤 IV 생성
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // 텍스트 인코딩
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // 암호화
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Base64 변환
    const encryptedArray = new Uint8Array(encrypted);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    return {
      iv: ivBase64,
      encrypted: encryptedBase64,
    };
  }

  /**
   * 제보 데이터를 암호화
   * @param {Object} formData - { title, content, name, phone, email }
   * @returns {Object} - 암호화된 데이터
   */
  async encrypt(formData) {
    // 일회성 키 받기
    const { keyId, key } = await this.getEncryptionKey();

    // 각 필드 암호화
    const title = await this.encryptText(formData.title, key);
    const content = await this.encryptText(formData.content, key);
    const email = await this.encryptText(formData.email, key);
    const name = await this.encryptText(formData.name, key);
    const phone = formData.phone
      ? await this.encryptText(formData.phone, key)
      : null;

    return {
      keyId,
      title,
      content,
      email,
      name,
      phone,
    };
  }

  /**
   * 암호화된 데이터를 API로 전송
   */
  async submit(formData) {
    const encrypted = await this.encrypt(formData);

    const response = await fetch(`${this.functionsUrl}/submit-inquiry`, {
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

  /**
   * 제보 조회 (이메일 + 인증 코드)
   */
  async verify(email, authCode) {
    // 일회성 키 받기
    const { keyId, key } = await this.getEncryptionKey();

    // 이메일과 인증 코드 암호화
    const encryptedEmail = await this.encryptText(email, key);
    const encryptedAuthCode = await this.encryptText(authCode.toUpperCase(), key);

    const response = await fetch(`${this.functionsUrl}/verify-inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyId,
        email: encryptedEmail,
        authCode: encryptedAuthCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid email or verification code');
    }

    const result = await response.json();

    // 응답 복호화
    const decryptedInquiry = {
      id: result.data.id,
      title: await this.decryptText(result.data.title.encrypted, result.aesKey, result.data.title.iv),
      content: await this.decryptText(result.data.content.encrypted, result.aesKey, result.data.content.iv),
      email: await this.decryptText(result.data.email.encrypted, result.aesKey, result.data.email.iv),
      name: await this.decryptText(result.data.name.encrypted, result.aesKey, result.data.name.iv),
      phone: result.data.phone ? await this.decryptText(result.data.phone.encrypted, result.aesKey, result.data.phone.iv) : null,
      status: result.data.status,
      created_at: result.data.created_at,
      reply_title: result.data.reply_title ? await this.decryptText(result.data.reply_title.encrypted, result.aesKey, result.data.reply_title.iv) : null,
      reply_content: result.data.reply_content ? await this.decryptText(result.data.reply_content.encrypted, result.aesKey, result.data.reply_content.iv) : null,
      replied_at: result.data.replied_at,
    };

    return decryptedInquiry;
  }

  /**
   * AES-GCM으로 텍스트 복호화
   */
  async decryptText(encryptedBase64, keyHex, ivBase64) {
    // Hex 키를 바이트로 변환
    const keyBytes = this.hexToBytes(keyHex);

    // 키 가져오기
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Base64 디코딩
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    // 복호화
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    // 문자열로 변환
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}

// 전역으로 export
if (typeof window !== 'undefined') {
  window.InquiryEncryptor = InquiryEncryptor;
}
