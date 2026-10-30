/* DOLO CAR DETAILING — Smooth Clean Interactions & Reveal Engine */
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Accessible Mobile Navigation Toggle
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const navLinks = [...document.querySelectorAll('.nav-link')];

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
      });
    });
  }

  // 2. Smooth Scrolling for In-Page Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();

      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  // 3. Header Scrolled State (Smooth Glassmorphic Navbar)
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY > 40) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 4. Smooth Reveal Animation Observer for Headings & Columns
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // 5. Scrollspy: Highlight Active Nav Section
  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // 6. Dynamic Copyright Year
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();

  // 7. Typing Words / Headings Engine (Zero Layout Shift)
  const initTypewriterHeadings = () => {
    const headings = document.querySelectorAll('[data-typing]');
    if (!headings.length) return;

    const prepareHeading = (heading) => {
      if (!heading.getAttribute('aria-label')) {
        heading.setAttribute('aria-label', heading.textContent.trim());
      }

      const charSpans = [];

      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (!text) return document.createTextNode('');
          const frag = document.createDocumentFragment();
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '\n' || char === '\r') continue;
            const span = document.createElement('span');
            span.className = 'type-char';
            span.textContent = char;
            charSpans.push(span);
            frag.appendChild(span);
          }
          return frag;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName.toLowerCase() === 'br') {
            return node.cloneNode();
          }
          const clone = node.cloneNode(false);
          Array.from(node.childNodes).forEach(child => {
            clone.appendChild(processNode(child));
          });
          return clone;
        }
        return node.cloneNode(true);
      };

      const childNodes = Array.from(heading.childNodes);
      const newFragment = document.createDocumentFragment();
      childNodes.forEach(child => {
        newFragment.appendChild(processNode(child));
      });

      heading.innerHTML = '';
      heading.appendChild(newFragment);

      const cursor = document.createElement('span');
      cursor.className = 'type-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      heading.appendChild(cursor);

      return { heading, charSpans, cursor };
    };

    const typeSequence = (bundle, speed = 28) => {
      const { charSpans, cursor } = bundle;
      if (prefersReducedMotion) {
        charSpans.forEach(s => s.classList.add('is-typed'));
        cursor.classList.add('is-done');
        return;
      }

      let index = 0;
      const total = charSpans.length;

      const typeNext = () => {
        if (index < total) {
          const charSpan = charSpans[index];
          charSpan.classList.add('is-typed');

          if (charSpan.nextSibling) {
            charSpan.parentNode.insertBefore(cursor, charSpan.nextSibling);
          } else {
            charSpan.parentNode.appendChild(cursor);
          }

          index++;
          const char = charSpan.textContent;
          let delay = speed;
          if (char === '.' || char === '?' || char === '!') delay = speed * 4;
          else if (char === ',') delay = speed * 2.5;
          else if (char === ' ') delay = speed * 1.1;

          setTimeout(typeNext, delay);
        } else {
          setTimeout(() => {
            cursor.classList.add('is-done');
          }, 1400);
        }
      };

      typeNext();
    };

    const bundles = [];
    headings.forEach(h => {
      bundles.push(prepareHeading(h));
    });

    const heroBundle = bundles.find(b => b.heading.classList.contains('hero-title'));
    if (heroBundle) {
      setTimeout(() => {
        typeSequence(heroBundle, 32);
      }, 350);
    }

    if ('IntersectionObserver' in window) {
      const typeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bundle = bundles.find(b => b.heading === entry.target);
            if (bundle && bundle !== heroBundle) {
              typeSequence(bundle, 26);
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

      bundles.forEach(b => {
        if (b !== heroBundle) {
          typeObserver.observe(b.heading);
        }
      });
    } else {
      bundles.forEach(b => {
        if (b !== heroBundle) typeSequence(b, 26);
      });
    }
  };

  initTypewriterHeadings();

  // 8. 3D Hover Tilt & Specular Glare Engine
  const init3DTiltCards = () => {
    if (prefersReducedMotion) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
      if (!card.querySelector('.card-glare')) {
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        glare.setAttribute('aria-hidden', 'true');
        card.appendChild(glare);
      }

      const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 10;
      let bounds = null;
      let isHovered = false;
      let rafId = null;

      const onMouseEnter = () => {
        isHovered = true;
        bounds = card.getBoundingClientRect();
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
      };

      const onMouseMove = (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xNorm = (mouseX / bounds.width) * 2 - 1;
        const yNorm = (mouseY / bounds.height) * 2 - 1;

        const rotateX = (-yNorm * maxTilt).toFixed(2);
        const rotateY = (xNorm * maxTilt).toFixed(2);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`;
          card.style.setProperty('--glare-x', `${((mouseX / bounds.width) * 100).toFixed(1)}%`);
          card.style.setProperty('--glare-y', `${((mouseY / bounds.height) * 100).toFixed(1)}%`);
        });
      };

      const onMouseLeave = () => {
        isHovered = false;
        bounds = null;
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        setTimeout(() => {
          if (!isHovered) {
            card.style.transform = '';
            card.style.transition = '';
          }
        }, 500);
      };

      card.addEventListener('mouseenter', onMouseEnter, { passive: true });
      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave, { passive: true });
    });
  };

  init3DTiltCards();

  // 9. Trending Appointment Booking Form Controller
  const initAppointmentForm = () => {
    const form = document.getElementById('appointment-form');
    const successCard = document.getElementById('booking-success');
    const dateInput = document.getElementById('booking-date');
    if (!form || !successCard) return;

    // Set minimum date to today, default to tomorrow
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tY = tomorrow.getFullYear();
      const tM = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const tD = String(tomorrow.getDate()).padStart(2, '0');
      dateInput.value = `${tY}-${tM}-${tD}`;
    }

    const submitBtn = document.getElementById('booking-submit-btn');
    const bookAnotherBtn = document.getElementById('book-another-btn');
    const whatsappBtn = document.getElementById('whatsapp-direct-btn');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('booking-name');
      const phoneInput = document.getElementById('booking-phone');
      const emailInput = document.getElementById('booking-email');
      const vehicleInput = document.getElementById('booking-vehicle');
      const timeSelect = document.getElementById('booking-time');
      const serviceRadio = form.querySelector('input[name="service"]:checked');

      const inputs = [nameInput, phoneInput, emailInput, vehicleInput, dateInput, timeSelect];
      let hasError = false;

      inputs.forEach(input => {
        if (!input) return;
        if (!input.value.trim()) {
          input.classList.add('is-invalid');
          if (!hasError) {
            input.focus();
            hasError = true;
          }
        } else {
          input.classList.remove('is-invalid');
        }
      });

      if (hasError) return;

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const vehicle = vehicleInput.value.trim();
      const service = serviceRadio ? serviceRadio.value : 'Paint Correction & Polish';
      const date = dateInput.value;
      const time = timeSelect.value;
      const notes = (document.getElementById('booking-notes')?.value || '').trim();

      if (submitBtn) {
        submitBtn.disabled = true;
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Securing Studio Bay...</span> <span aria-hidden="true">⏳</span>`;

        setTimeout(() => {
          const summaryName = document.getElementById('summary-name');
          const summaryVehicle = document.getElementById('summary-vehicle');
          const summaryService = document.getElementById('summary-service');
          const summarySlot = document.getElementById('summary-slot');
          const summaryContact = document.getElementById('summary-contact');

          if (summaryName) summaryName.textContent = name;
          if (summaryVehicle) summaryVehicle.textContent = vehicle;
          if (summaryService) summaryService.textContent = service;
          if (summarySlot) summarySlot.textContent = `${date} · ${time}`;
          if (summaryContact) summaryContact.textContent = `${phone} · ${email}`;

          if (whatsappBtn) {
            const waMsg = encodeURIComponent(
              `Hello Dolo Car Detailing!\n\nI have requested an appointment:\n• Name: ${name}\n• Vehicle: ${vehicle}\n• Service: ${service}\n• Date: ${date}\n• Slot: ${time}${notes ? '\n• Note: ' + notes : ''}\n\nPlease confirm my studio bay.`
            );
            whatsappBtn.href = `https://wa.me/919876543210?text=${waMsg}`;
          }

          form.style.display = 'none';
          successCard.classList.add('is-active');

          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }, 550);
      }
    });

    if (bookAnotherBtn) {
      bookAnotherBtn.addEventListener('click', () => {
        form.reset();
        successCard.classList.remove('is-active');
        form.style.display = 'block';

        if (dateInput) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tY = tomorrow.getFullYear();
          const tM = String(tomorrow.getMonth() + 1).padStart(2, '0');
          const tD = String(tomorrow.getDate()).padStart(2, '0');
          dateInput.value = `${tY}-${tM}-${tD}`;
        }

        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    form.querySelectorAll('.form-input, .form-select').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
    });
  };

  initAppointmentForm();

  // 10. Luxury Hero Showcase Slider Controller
  const initHeroSlider = () => {
    const sliderWrap = document.getElementById('hero-slider-wrap');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('slider-prev-btn');
    const nextBtn = document.getElementById('slider-next-btn');
    const numDisplay = document.getElementById('slider-current-num');
    const progressBar = document.getElementById('slider-progress-fill');

    const tagService = document.getElementById('slider-tag-service');
    const tagVehicle = document.getElementById('slider-tag-vehicle');
    const badgeIcon = document.getElementById('badge-icon');
    const badgeTitle = document.getElementById('badge-title');
    const badgeSub = document.getElementById('badge-sub');

    if (!sliderWrap || !slides.length) return;

    let currentIndex = 0;
    const total = slides.length;
    const intervalDuration = 5500;
    let progressStartTime = Date.now();
    let elapsedBeforePause = 0;
    let isPaused = false;

    const updateSlideContent = (index) => {
      const activeSlide = slides[index];
      if (!activeSlide) return;

      const tag = activeSlide.getAttribute('data-tag') || 'DETAILING';
      const vehicle = activeSlide.getAttribute('data-vehicle') || 'STUDIO BUILD';
      const icon = activeSlide.getAttribute('data-badge-icon') || '✳';
      const title = activeSlide.getAttribute('data-badge-title') || 'THE DOLO FINISH';
      const sub = activeSlide.getAttribute('data-badge-sub') || 'Every detail matters.';

      if (tagService) tagService.textContent = tag;
      if (tagVehicle) tagVehicle.textContent = vehicle;
      if (badgeIcon) badgeIcon.textContent = icon;
      if (badgeTitle) badgeTitle.textContent = title;
      if (badgeSub) badgeSub.textContent = sub;
      if (numDisplay) numDisplay.textContent = String(index + 1).padStart(2, '0');
    };

    const goToSlide = (index) => {
      if (index === currentIndex && slides[index].classList.contains('is-active')) {
        return;
      }

      slides.forEach((s, i) => {
        s.classList.toggle('is-active', i === index);
      });

      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
      });

      currentIndex = index;
      updateSlideContent(index);

      progressStartTime = Date.now();
      elapsedBeforePause = 0;
      if (progressBar) progressBar.style.width = '0%';
    };

    const nextSlide = () => {
      goToSlide((currentIndex + 1) % total);
    };

    const prevSlide = () => {
      goToSlide((currentIndex - 1 + total) % total);
    };

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetIndex = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(targetIndex)) goToSlide(targetIndex);
      });
    });

    const progressLoop = () => {
      if (!isPaused && !prefersReducedMotion) {
        const now = Date.now();
        const totalElapsed = elapsedBeforePause + (now - progressStartTime);
        const progressPct = Math.min(100, (totalElapsed / intervalDuration) * 100);

        if (progressBar) {
          progressBar.style.width = `${progressPct}%`;
        }

        if (totalElapsed >= intervalDuration) {
          nextSlide();
        }
      }
      requestAnimationFrame(progressLoop);
    };

    sliderWrap.addEventListener('mouseenter', () => {
      isPaused = true;
      elapsedBeforePause += (Date.now() - progressStartTime);
    });

    sliderWrap.addEventListener('mouseleave', () => {
      isPaused = false;
      progressStartTime = Date.now();
    });

    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrap.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isPaused = true;
      elapsedBeforePause += (Date.now() - progressStartTime);
    }, { passive: true });

    sliderWrap.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isPaused = false;
      progressStartTime = Date.now();

      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    sliderWrap.setAttribute('tabindex', '0');
    sliderWrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
    });

    updateSlideContent(0);
    requestAnimationFrame(progressLoop);
  };

  initHeroSlider();
})();
