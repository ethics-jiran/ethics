import React, { useState, useEffect } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hamburger = document.querySelector(".hamburger-menu");
      const navButtons = document.querySelector(".btn-group");

      if (
        hamburger &&
        navButtons &&
        !hamburger.contains(target) &&
        !navButtons.contains(target)
      ) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <nav className="nav">
      <div className="container">
        <div className="company">
          <div className="logo">
            <a href="/">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/sunbisites.firebasestorage.app/o/sites%2Fb55f167418bf439e86b7%2Fassets%2Flogo.svg?alt=media&token=aa212072-2e31-4a0e-bc38-764b620c0730"
                alt="지란지교소프트"
              />
            </a>
          </div>
        </div>

        <button
          className={`hamburger-menu ${isMenuOpen ? "active" : ""}`}
          aria-label="메뉴"
          onClick={toggleMenu}>
          <img
            src="https://firebasestorage.googleapis.com/v0/b/sunbisites.firebasestorage.app/o/sites%2Fb55f167418bf439e86b7%2Fassets%2Fmenu.svg?alt=media"
            alt="메뉴"
            className="menu-icon"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/sunbisites.firebasestorage.app/o/sites%2Fb55f167418bf439e86b7%2Fassets%2Fclose.svg?alt=media"
            alt="닫기"
            className="close-icon"
          />
        </button>

        <nav className={`btn-group ${isMenuOpen ? "active" : ""}`}>
          <a href="/" className="link" onClick={closeMenu}>
            About
          </a>

          <div className={`dropdown ${isDropdownOpen ? "active" : ""}`}>
            <button className="link dropdown-trigger" onClick={toggleDropdown}>
              ESG정책
            </button>
            <div className="dropdown-menu">
              <a href="/esg1" className="dropdown-item" onClick={closeMenu}>
                환경관리지침
              </a>
              <a href="/esg2" className="dropdown-item" onClick={closeMenu}>
                사회관리지침
              </a>
              <a href="/esg3" className="dropdown-item" onClick={closeMenu}>
                윤리경영지침
              </a>
            </div>
          </div>

          <a href="/result" className="link" onClick={closeMenu}>
            처리 결과 확인
          </a>

          <a href="/#ethics" className="btn btn-primary" onClick={closeMenu}>
            상담 & 제보
          </a>
        </nav>
      </div>
    </nav>
  );
}
