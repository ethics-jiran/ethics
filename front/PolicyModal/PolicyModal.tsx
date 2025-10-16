import React, { useState } from "react";

interface PolicyData {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

const API_URL = "https://esg-admin.jiran.com/api";

export default function PolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPolicy = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/policy`);

      if (!response.ok) {
        throw new Error("정책을 불러오는데 실패했습니다");
      }

      const result = await response.json();
      setPolicy(result.data);
    } catch (err) {
      console.error("정책 조회 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "정책을 불러오는데 실패했습니다. 나중에 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!policy) {
      fetchPolicy();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Link */}
      <a onClick={handleOpen} style={{ cursor: "pointer" }}>
        상담자 보호정책 →
      </a>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={handleClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
              animation: "fadeIn 0.2s ease-out",
            }}
          />

          {/* Modal Content */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              borderRadius: "16px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              zIndex: 9999,
              animation: "slideUp 0.3s ease-out",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
            }}>
            {/* Close Button */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                lineHeight: 1,
              }}
              aria-label="닫기">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/sunbisites.firebasestorage.app/o/sites%2Fb55f167418bf439e86b7%2Fassets%2Fclose.svg?alt=media"
                alt="닫기"
                className="close-icon"
              />
            </button>

            {/* Loading State */}
            {loading && (
              <div
                className="text text-md"
                style={{ textAlign: "center", padding: "40px 0" }}>
                불러오는 중...
              </div>
            )}

            {/* Error State */}
            {error && (
              <div
                className="alert alert-error"
                style={{ marginBottom: "20px" }}>
                {error}
              </div>
            )}

            {/* Policy Content */}
            {policy && (
              <>
                <div className="text-wrapper" style={{ padding: "32px" }}>
                  <h2 className="title title-lg" style={{ marginBottom: "24px" }}>
                    {policy.title}
                  </h2>
                  <div
                    className="text text-md pre-wrap"
                    style={{ lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {policy.content}
                  </div>
                  <div
                    className="text text-sm"
                    style={{
                      marginTop: "24px",
                      color: "#999",
                      textAlign: "right",
                    }}>
                    마지막 업데이트: {formatDate(policy.updated_at)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Animations */}
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translate(-50%, -45%);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%);
              }
            }

            /* Scrollbar styles */
            div[style*="overflowY: auto"]::-webkit-scrollbar {
              width: 8px;
            }

            div[style*="overflowY: auto"]::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }

            div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;
            }

            div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
              background: #555;
            }

            @media (max-width: 768px) {
              div[style*="maxWidth: 800px"] {
                width: 95% !important;
                padding: 24px !important;
                max-height: 90vh !important;
              }
            }
          `}</style>
        </>
      )}
    </>
  );
}
