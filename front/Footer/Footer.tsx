import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="column">
          <div className="conpany">
            <div className="logo">
              <img src="/assets/logo.svg" alt="지란지교소프트" />
            </div>
            <p className="text text-sm">Copyright JIRANSOFT. All rights reserved.</p>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <div className="row">
              <h4 className="title title-sm">ESG 경영 문의</h4>
              <p className="text text-md">지란지교소프트</p>
              <p className="text text-sm">
                김선영 브랜딩경영실장<br />
                sykim@jiran.com
              </p>
            </div>
            <div className="row">
              <h4 className="title title-sm">윤리경영 상담센터</h4>
              <p className="text text-md">지란지교소프트</p>
              <p className="text text-sm">
                박승애 대표이사<br />
                psa@jiran.com
              </p>
              <p className="text text-sm">
                오수연이사<br />
                syoh21@jiran.com
              </p>
            </div>
          </div>
          <div className="row">
            <h4 className="title title-sm">지란지교소프트</h4>
            <p className="text text-sm">
              대전광역시 유성구 테크노중앙로74. 201<br />
              경기도 성남시 수정구 금토로80번길37, W동 11층
            </p>
            <a className="link" href="https://www.jiransoft.co.kr" target="_blank" rel="noopener noreferrer">
              www.jiransoft.co.kr
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
