import React, { useState, useEffect, FormEvent } from 'react';

// CSS는 위젯 설정에서 별도로 추가하세요
// inquiry-encrypt 라이브러리는 전역 스크립트에서 로드해야 합니다
// <script src="https://cherish-jiran.vercel.app/api/inquiry-encrypt"></script>
declare global {
  interface Window {
    InquiryEncryptor: any;
  }
}

interface InquiryData {
  id: string;
  title: string;
  content: string;
  email: string;
  name: string;
  phone: string | null;
  status: 'pending' | 'processing' | 'completed';
  created_at: string;
  reply_title: string | null;
  reply_content: string | null;
  replied_at: string | null;
}

const SUPABASE_URL = 'https://domjuxvrnglsohyqdzmi.supabase.co';

const STATUS_LABELS = {
  pending: '접수됨',
  processing: '처리중',
  completed: '완료',
};

export default function InquiryCheckForm() {
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inquiryData, setInquiryData] = useState<InquiryData | null>(null);
  const [ready, setReady] = useState(false);

  // 전역 스크립트 로딩 대기 (동적 로딩 X, 폴링만 사용)
  useEffect(() => {
    console.log('[InquiryCheckForm] 스크립트 로딩 체크 시작');

    const checkScript = () => {
      if (window.InquiryEncryptor) {
        console.log('[InquiryCheckForm] ✅ InquiryEncryptor 로드 완료!', window.InquiryEncryptor);
        setReady(true);
        return true;
      }
      return false;
    };

    // 이미 로드되었는지 확인
    if (checkScript()) return;

    console.log('[InquiryCheckForm] InquiryEncryptor 대기 중...');

    // 100ms마다 확인 (최대 10초)
    const interval = setInterval(() => {
      console.log('[InquiryCheckForm] 폴링 중... window.InquiryEncryptor:', typeof window.InquiryEncryptor);
      if (checkScript()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.InquiryEncryptor) {
        console.error('[InquiryCheckForm] ❌ 암호화 라이브러리 로딩 타임아웃');
        console.error('[InquiryCheckForm] 전역 스크립트 설정에서 https://cherish-jiran.vercel.app/api/inquiry-encrypt 를 추가했는지 확인해주세요.');
        setErrorMessage('암호화 라이브러리 로딩에 실패했습니다. 페이지를 새로고침해주세요.');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 메시지 초기화
    setErrorMessage('');
    setInquiryData(null);

    // 스크립트 로드 확인
    if (!ready || !window.InquiryEncryptor) {
      setErrorMessage('암호화 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const encryptor = new window.InquiryEncryptor(SUPABASE_URL);

      // 제보 조회
      const result = await encryptor.verify(email, authCode);

      // 성공
      setInquiryData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('제보 조회 실패:', err);
      setErrorMessage(
        err instanceof Error ? err.message : '제보 조회에 실패했습니다. 이메일과 인증 코드를 확인해주세요.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="check-container">
        <h1>제보 조회</h1>
        <p className="description">
          이메일과 인증 코드를 입력하여 제보 내역을 확인하세요.
        </p>

        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="authCode">인증 코드</label>
            <input
              type="text"
              id="authCode"
              name="authCode"
              required
              placeholder="6자리 코드"
              maxLength={6}
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading"></span>
                조회 중...
              </>
            ) : (
              '제보 조회'
            )}
          </button>
        </form>
      </div>

      {inquiryData && (
        <div className="result-container">
          <div className="inquiry-header">
            <div>
              <div className="inquiry-title">{inquiryData.title}</div>
              <div className="inquiry-date">{formatDate(inquiryData.created_at)}</div>
            </div>
            <div className={`badge badge-${inquiryData.status}`}>
              {STATUS_LABELS[inquiryData.status]}
            </div>
          </div>

          <div className="inquiry-section">
            <h3>제보 내용</h3>
            <div className="inquiry-content">{inquiryData.content}</div>
          </div>

          {inquiryData.reply_content && (
            <div className="reply-section">
              <h3>{inquiryData.reply_title || '답변'}</h3>
              <div className="inquiry-content">{inquiryData.reply_content}</div>
              {inquiryData.replied_at && (
                <div className="reply-date">{formatDate(inquiryData.replied_at)}</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
