// Hamburger Menu
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger-menu");
  const navButtons = document.querySelector(".btn-group");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      this.classList.toggle("active");
      navButtons.classList.toggle("active");
    });

    // Close menu when clicking on nav items
    const navItems = navButtons.querySelectorAll(".link, .btn");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navButtons.classList.remove("active");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!hamburger.contains(e.target) && !navButtons.contains(e.target)) {
        hamburger.classList.remove("active");
        navButtons.classList.remove("active");
      }
    });
  }

  // accordion Accordion
  const accordionItems = document.querySelectorAll(".accordion-item");

  accordionItems.forEach((item) => {
    const button = item.querySelector(".accordion-header");

    button.addEventListener("click", function () {
      const isActive = item.classList.contains("active");

      // Close all items
      accordionItems.forEach((i) => i.classList.remove("active"));

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // Open first item by default
  if (accordionItems.length > 0) {
    accordionItems[0].classList.add("active");
  }

  // Dropdown Menu for Mobile/Tablet
  const dropdown = document.querySelector(".dropdown");
  const dropdownTrigger = document.querySelector(".dropdown-trigger");

  if (dropdown && dropdownTrigger) {
    // Only add click behavior on mobile/tablet
    if (window.innerWidth <= 1024) {
      dropdownTrigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle("active");
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", function (e) {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove("active");
        }
      });

      // Prevent dropdown links from closing the parent menu
      const dropdownItems = dropdown.querySelectorAll(".dropdown-item");
      dropdownItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      });
    }
  }

  // Form Submission
  const form = document.getElementById("consultationForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("제출이 완료되었습니다.\n접수번호가 이메일로 발송됩니다.");
      form.reset();
    });
  }

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const headerOffset = 95;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
});
