document.addEventListener('DOMContentLoaded', () => {

  // ===== MOBILE MENU =====
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('headerNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== HEADER SCROLL =====
  const header = document.getElementById('header');
  const progress = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');

  function onScroll() {
    const y = window.pageYOffset;
    const h = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('scrolled', y > 60);

    if (progress) progress.style.width = (y / h * 100) + '%';
    if (backTop) backTop.classList.toggle('visible', y > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===== REVEAL ON SCROLL =====
  const revealEls = document.querySelectorAll('[data-reveal]');
  const staggerEls = document.querySelectorAll('.stagger');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
  staggerEls.forEach(el => observer.observe(el));

  // ===== COUNTER ANIMATION =====
  function countUp(el, target, suffix = '', duration = 2000) {
    const start = performance.now();
    function update(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('.hero-stat-block h3, .about-years h4');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const n = parseInt(el.textContent.replace(/\D/g, ''));
        const s = el.textContent.replace(/[\d]/g, '');
        if (!isNaN(n)) { el.textContent = '0'; countUp(el, n, s); }
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObs.observe(el));

  // ===== GLARE ON SERVICE ITEMS =====
  if (window.innerWidth > 1024) {
    document.querySelectorAll('.service-item').forEach(card => {
      const g = document.createElement('div');
      g.style.cssText = 'position:absolute;inset:0;pointer-events:none;border-radius:inherit;opacity:0;transition:opacity .4s ease;z-index:2';
      card.appendChild(g);

      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        g.style.background = `radial-gradient(circle at ${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%, rgba(255,255,255,0.08) 0%, transparent 70%)`;
        g.style.opacity = '1';
      });
      card.addEventListener('mouseleave', () => { g.style.opacity = '0'; });
    });
  }

  // ===== FORM =====
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('.btn');
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Mensagem enviada!';
        btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
        setTimeout(() => {
          btn.textContent = 'Enviar mensagem';
          btn.style.background = '';
          btn.disabled = false;
          this.reset();
        }, 2500);
      }, 1200);
    });
  }

  // ===== YOUTUBE VIDEOS =====
  (function() {
    const grid = document.getElementById('yt-videos');
    if (!grid) return;

    const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCC8u-c_DXTQfzCAlFBIXIhQ';

    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(RSS_URL))
      .then(r => r.json())
      .then(data => {
        if (data.status !== 'ok' || !data.items) throw new Error('Invalid response');
        let html = '';
        let count = 0;

        data.items.forEach(item => {
          if (count >= 4) return;
          if (item.link.includes('/shorts/')) return;

          const date = new Date(item.pubDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

          html += '<a href="' + item.link + '" target="_blank" class="yt-card" rel="noopener">' +
            '<div class="yt-card-thumb"><img src="' + item.thumbnail + '" alt="" loading="lazy"></div>' +
            '<div class="yt-card-body">' +
            '<h4>' + item.title + '</h4>' +
            '<span class="yt-meta">' + date + '</span>' +
            '</div></a>';
          count++;
        });

        grid.innerHTML = html || '<p style="grid-column:1/-1;text-align:center;color:var(--gray)">Nenhum episódio encontrado.</p>';
      })
      .catch(() => {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gray)">Não foi possível carregar os episódios. <a href="https://www.youtube.com/@ComunicandoeAndando/videos" target="_blank" style="color:var(--yellow)">Ver no YouTube →</a></p>';
      });
  })();

  // ===== ACTIVE NAV LINK =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header-nav a[href^="#"]');

  window.addEventListener('scroll', () => {
    const y = window.pageYOffset + 100;
    sections.forEach(s => {
      const id = s.id;
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        navLinks.forEach(l => {
          l.style.color = l.getAttribute('href') === '#' + id ? '#F6B80C' : '';
        });
      }
    });
  }, { passive: true });

  // force initial reveal check
  setTimeout(() => {
    [revealEls, staggerEls].forEach(group => {
      group.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed');
      });
    });
  }, 150);

});
