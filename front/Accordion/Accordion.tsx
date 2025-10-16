import React, { useState, useEffect } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content?: string[];
  display_order: number;
}

const API_URL = "https://esg-admin.jiran.com/api";

export default function Accordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [items, setItems] = useState<AccordionItem[]>([]);

  useEffect(() => {
    // Next.js API에서 FAQs 조회
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${API_URL}/faqs`);

        if (!response.ok) {
          return;
        }

        const result = await response.json();
        if (result.data) {
          setItems(result.data);
        }
      } catch (error) {
        // 에러 발생 시 기본 아이템 유지
      }
    };

    fetchFAQs();
  }, []);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`accordion-item ${activeIndex === index ? "active" : ""}`}>
          <button
            className="accordion-header"
            onClick={() => toggleItem(index)}>
            <span>{item.title}</span>
            <span className="accordion-icon icon">
              <img src="/assets/arrow-top.svg" alt="" />
            </span>
          </button>
          <div className="accordion-content">
            {item.content && item.content.length > 0 && (
              <>
                {item.content.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
