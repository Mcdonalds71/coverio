/**
 * COVERIO — Interactive Navigation & Pilot Intake Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const modalOverlay = document.getElementById('pilotModal');
  const openModalBtns = document.querySelectorAll('[data-open-modal]');
  const closeModalBtns = document.querySelectorAll('[data-close-modal]');
  const pilotForm = document.getElementById('pilotForm');
  const pilotFormSuccess = document.getElementById('pilotFormSuccess');

  // --- 1. Scrolled Header State ---
  function handleScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- 2. Mobile Menu Toggle ---
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.getAttribute('data-open') === 'true';
      mobileMenu.setAttribute('data-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.setAttribute('data-open', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // --- 3. Enterprise Pilot Modal ---
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalOverlay) modalOverlay.classList.add('is-active');
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('is-active');
    });
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('is-active');
      }
    });
  }

  if (pilotForm) {
    pilotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      pilotForm.style.display = 'none';
      if (pilotFormSuccess) pilotFormSuccess.style.display = 'block';
    });
  }
});
