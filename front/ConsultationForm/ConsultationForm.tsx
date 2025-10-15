import React, { useState, useEffect, FormEvent } from "react";

// inquiry-encrypt 라이브러리는 전역 스크립트에서 로드해야 합니다
// <script src="https://cherish-jiran.vercel.app/api/inquiry-encrypt"></script>

interface FormData {
  title: string;
  content: string;
  email: string;
  name: string;
  phone: string;
}

const API_URL = "https://cherish-jiran.vercel.app/api";

export default function ConsultationForm() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    email: "",
    name: "",
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ready, setReady] = useState(false);

  // 전역 스크립트 로딩 대기 (동적 로딩 X, 폴링만 사용)
  useEffect(() => {
    console.log("[ConsultationForm] 스크립트 로딩 체크 시작");

    const checkScript = () => {
      if ((window as any).InquiryEncryptor) {
        console.log(
          "[ConsultationForm] ✅ InquiryEncryptor 로드 완료!",
          (window as any).InquiryEncryptor
        );
        setReady(true);
        return true;
      }
      return false;
    };

    // 이미 로드되었는지 확인
    if (checkScript()) return;

    console.log("[ConsultationForm] InquiryEncryptor 대기 중...");

    // 100ms마다 확인 (최대 10초)
    const interval = setInterval(() => {
      console.log(
        "[ConsultationForm] 폴링 중... window.InquiryEncryptor:",
        typeof (window as any).InquiryEncryptor
      );
      if (checkScript()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!(window as any).InquiryEncryptor) {
        console.error("[ConsultationForm] ❌ 암호화 라이브러리 로딩 타임아웃");
        console.error(
          "[ConsultationForm] 전역 스크립트 설정에서 https://cherish-jiran.vercel.app/inquiry-encrypt.js 를 추가했는지 확인해주세요."
        );
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 메시지 초기화
    setSuccessMessage("");
    setErrorMessage("");

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

      // 암호화 및 전송
      await encryptor.submit({
        title: formData.title,
        content: formData.content,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
      });

      // 성공 - 메시지 표시 후 /finish로 이동
      setSuccessMessage("제보가 성공적으로 접수되었습니다. 잠시 후 결과 페이지로 이동합니다.");
      setTimeout(() => {
        window.location.href = "/finish";
      }, 2000);
    } catch (err) {
      console.error("제보 제출 실패:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "제보 제출에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="consultationForm" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          제목 <span className="required-dot"></span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="제목을 써주세요"
          required
        />
      </div>
      <div className="form-group">
        <label>
          내용 <span className="required-dot"></span>
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={7}
          placeholder="상담 or 제보 내용을 써주세요.&#10;제보의 경우, 제보 대상자, 대상자의 소속&#10;사건의 경위(날짜, 시간, 장소, 행동 등)를 자세히 적어주세요"
          required
        />
      </div>
      <div className="form-group">
        <label>
          이메일 주소 <span className="required-dot"></span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jiranin@jiran.com"
          required
        />
      </div>
      <div className="form-group">
        <label>이름</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>연락처</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      <div className="form-notice">
        <ul>
          <li>처리 결과 확인을 위한 접수번호가 이메일로 발송됩니다.</li>
          <li>이름/연락처는 선택 기재 사항입니다.</li>
          <li>
            개인정보는 민원 처리 및 결과 회신을 위해서만 수집하며, 사건 처리
            완료 후 정보는 폐기 됩니다.
          </li>
          <li>개인정보 수집에 동의합니다.</li>
        </ul>
      </div>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "제출 중..." : "제출"}
      </button>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="alert alert-error">{errorMessage}</div>
      )}
    </form>
  );
}
