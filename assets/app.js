/**
 * COVERIO — Interactive Navigation, Live Telemetry & Enterprise Flow
 * Built for Microsoft Azure SaaS Enterprise Benchmark
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
      header.classList.remove('over-hero');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('over-hero');
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

  // --- 4. Live Submission Ticker Increment Simulation ---
  const liveCountEl = document.getElementById('liveCountToday');
  if (liveCountEl) {
    let baseCount = 1420;
    setInterval(() => {
      if (Math.random() > 0.45) {
        baseCount += 1;
        liveCountEl.textContent = baseCount.toLocaleString();
      }
    }, 4500);
  }

  // --- 5. Interactive Pricing Billing Toggle (if present) ---
  const billingToggle = document.getElementById('billingToggle');
  if (billingToggle) {
    billingToggle.addEventListener('change', (e) => {
      const isAnnual = e.target.checked;
      document.querySelectorAll('[data-price-monthly]').forEach(el => {
        const monthly = el.getAttribute('data-price-monthly');
        const annual = el.getAttribute('data-price-annual');
        el.textContent = isAnnual ? annual : monthly;
      });
    });
  }
});

// Global Calendly Interactive Scheduler Handlers
let selectedSlotTime = "Tomorrow, 11:00 AM WAT";

function selectSlot(btn, time) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('is-selected'));
  btn.classList.add('is-selected');
  selectedSlotTime = time;
}

function handleCalendlySubmit(e) {
  e.preventDefault();
  const step1 = document.getElementById('bookingSlotStep');
  const step2 = document.getElementById('bookingSuccessStep');
  const slotText = document.getElementById('confirmedSlotText');
  
  if (slotText) slotText.textContent = selectedSlotTime;
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';
}
