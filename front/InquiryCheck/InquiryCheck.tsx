import React, { useState, useEffect, FormEvent } from "react";

interface Reply {
  id: string;
  title: string;
  content: string;
  status: "pending" | "processing" | "completed";
  created_at: string;
}

interface InquiryData {
  id: string;
  title: string;
  content: string;
  email: string;
  name: string;
  phone: string | null;
  status: "pending" | "processing" | "completed";
  created_at: string;
  replies: Reply[];
}

const API_URL = "https://esg-admin.jiran.com/api";

// 상태 뱃지 정의
const statusConfig = {
  pending: {
    text: "대기중",
    className: "badge-white",
  },
  processing: {
    text: "처리중",
    className: "badge-blue",
  },
  completed: {
    text: "완료",
    className: "badge-green",
  },
};

export default function InquiryCheck() {
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [inquiry, setInquiry] = useState<InquiryData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ready, setReady] = useState(false);

  // 전역 스크립트 로딩 대기
  useEffect(() => {
    console.log("[InquiryCheck] 스크립트 로딩 체크 시작");

    const checkScript = () => {
      if ((window as any).InquiryEncryptor) {
        console.log(
          "[InquiryCheck] ✅ InquiryEncryptor 로드 완료!",
          (window as any).InquiryEncryptor
        );
        setReady(true);
        return true;
      }
      return false;
    };

    // 이미 로드되었는지 확인
    if (checkScript()) return;

    console.log("[InquiryCheck] InquiryEncryptor 대기 중...");

    // 100ms마다 확인 (최대 10초)
    const interval = setInterval(() => {
      console.log(
        "[InquiryCheck] 폴링 중... window.InquiryEncryptor:",
        typeof (window as any).InquiryEncryptor
      );
      if (checkScript()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!(window as any).InquiryEncryptor) {
        console.error("[InquiryCheck] ❌ 암호화 라이브러리 로딩 타임아웃");
        setErrorMessage(
          "암호화 라이브러리 로딩에 실패했습니다. 페이지를 새로고침해주세요."
        );
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
    setErrorMessage("");
    setInquiry(null);

    // 스크립트 로드 확인
    if (!ready || !(window as any).InquiryEncryptor) {
      setErrorMessage(
        "암호화 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const encryptor = new (window as any).InquiryEncryptor(API_URL);

      // 조회 및 복호화
      const result = await encryptor.verify(
        email.trim(),
        authCode.trim().toUpperCase()
      );

      console.log("=== 조회 결과 ===", result);
      console.log("답변 개수:", result.replies?.length || 0);
      if (result.replies) {
        console.log("답변 데이터:", result.replies);
      }

      setInquiry(result);
    } catch (err) {
      console.error("제보 조회 실패:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "제보 조회에 실패했습니다. 이메일과 인증 코드를 다시 확인해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusConfig = (status: InquiryData["status"]) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <>
      {/* Form - 조회 성공하면 숨김 */}
      {!inquiry && (
        <div className="text-wrapper">
          <form id="checkForm" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="alert alert-error">{errorMessage}</div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                이메일 <span className="required-dot"></span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="제보 시 입력하신 이메일을 입력해주세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="authCode">
                인증 코드 <span className="required-dot"></span>
              </label>
              <input
                type="text"
                id="authCode"
                name="authCode"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                required
                placeholder="이메일로 받으신 6자리 인증 코드를 입력해주세요."
                maxLength={6}
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div className="form-notice">
              <ul>
                <li>
                  제보 접수 완료 시 이메일로 발송된 6자리 인증 코드를
                  입력해주세요
                </li>
                <li>인증 코드는 대소문자를 구분하지 않습니다</li>
                <li>이메일과 인증 코드가 일치해야 조회가 가능합니다</li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}>
              {isSubmitting ? "조회 중..." : "조회하기"}
            </button>
          </form>
        </div>
      )}

      {/* Result */}
      {inquiry && (
        <div className="row text-box">
          {/* Inquiry Header */}
          <div className="column gap-14">
            <span
              className={`badge ${getStatusConfig(inquiry.status).className}`}>
              {getStatusConfig(inquiry.status).text}
            </span>
            <h3 className="title title-md">{inquiry.title}</h3>
          </div>

          {/* Inquiry Content */}
          <div className="text-wrapper">
            <h4 className="title title-sm">제보 내용</h4>
            <div className="text text-md pre-wrap">{inquiry.content}</div>
            <p className="text text-sm">
              제출일: {formatDate(inquiry.created_at)}
            </p>
          </div>

          <hr className="divider" />

          {/* Reply Section */}
          {inquiry.replies && inquiry.replies.length > 0 && (
            <div className="text-wrapper">
              <h4 className="title title-sm">
                답변 내역 ({inquiry.replies.length})
              </h4>
              {inquiry.replies.map((reply, index) => (
                <div
                  key={reply.id}
                  style={{ marginTop: index > 0 ? "24px" : "0" }}>
                  {index > 0 && (
                    <hr className="divider" style={{ margin: "24px 0" }} />
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "8px",
                    }}>
                    <h5
                      className="title title-sm"
                      style={{ fontSize: "16px", margin: 0, flex: 1 }}>
                      {reply.title}
                    </h5>
                    <span
                      className={`badge ${getStatusConfig(reply.status).className}`}>
                      {getStatusConfig(reply.status).text}
                    </span>
                  </div>
                  <div className="text text-md pre-wrap">{reply.content}</div>
                  <p className="text text-sm" style={{ marginTop: "8px" }}>
                    답변일: {formatDate(reply.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
