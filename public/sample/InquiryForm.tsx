import React, { useState, useEffect, FormEvent } from 'react';

// CSS는 위젯 설정에서 별도로 추가하세요
// inquiry-encrypt.js는 HTML에서 먼저 로드해야 합니다
// <script src="https://cherish-jiran.vercel.app/inquiry-encrypt.js"></script>
declare global {
  interface Window {
    InquiryEncryptor: any;
  }
}

interface FormData {
  title: string;
  content: string;
  name: string;
  email: string;
  phone: string;
}

const SUPABASE_URL = 'https://domjuxvrnglsohyqdzmi.supabase.co';

export default function InquiryForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [ready, setReady] = useState(false);

  // 전역 스크립트 로딩 대기 (동적 로딩 X, 폴링만 사용)
  useEffect(() => {
    console.log('[InquiryForm] 스크립트 로딩 체크 시작');

    const checkScript = () => {
      if (window.InquiryEncryptor) {
        console.log('[InquiryForm] ✅ InquiryEncryptor 로드 완료!', window.InquiryEncryptor);
        setReady(true);
        return true;
      }
      return false;
    };

    // 이미 로드되었는지 확인
    if (checkScript()) return;

    console.log('[InquiryForm] InquiryEncryptor 대기 중...');

    // 100ms마다 확인 (최대 10초)
    const interval = setInterval(() => {
      console.log('[InquiryForm] 폴링 중... window.InquiryEncryptor:', typeof window.InquiryEncryptor);
      if (checkScript()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.InquiryEncryptor) {
        console.error('[InquiryForm] ❌ 암호화 라이브러리 로딩 타임아웃');
        console.error('[InquiryForm] 전역 스크립트 설정에서 https://cherish-jiran.vercel.app/inquiry-encrypt.js 를 추가했는지 확인해주세요.');
        setErrorMessage('암호화 라이브러리 로딩에 실패했습니다. 페이지를 새로고침해주세요.');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 메시지 초기화
    setShowSuccess(false);
    setErrorMessage('');

    // 스크립트 로드 확인
    if (!ready || !window.InquiryEncryptor) {
      setErrorMessage('암호화 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const encryptor = new window.InquiryEncryptor(SUPABASE_URL);

      // 암호화 및 전송
      await encryptor.submit({
        title: formData.title,
        content: formData.content,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
      });

      // 성공
      setShowSuccess(true);
      setFormData({
        title: '',
        content: '',
        name: '',
        email: '',
        phone: '',
      });

      // 페이지 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('제보 제출 실패:', err);
      setErrorMessage(
        err instanceof Error ? err.message : '제보 제출에 실패했습니다. 다시 시도해주세요.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inquiry-container">
      <h1>윤리경영 제보</h1>
      <p className="description">
        지란지교패밀리 윤리경영 제보관리센터에 제보해주시면 빠른 시일 내에 답변 드리겠습니다.
      </p>

      {showSuccess && (
        <div className="success-message">
          제보가 접수되었습니다! 인증 코드를 이메일로 보내드렸습니다.
        </div>
      )}

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="제보 제목을 입력해주세요"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            required
            placeholder="제보 내용을 상세히 입력해주세요..."
            value={formData.content}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="성함을 입력해주세요"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            전화번호
            <span className="optional">(선택)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="010-1234-5678"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loading"></span>
              제출 중...
            </>
          ) : (
            '제보 제출'
          )}
        </button>
      </form>
    </div>
  );
}
