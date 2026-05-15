const MAIL_TO = 'ludovicapangrazio@gmail.com';

function el(tag, options = {}) {
  const node = document.createElement(tag);

  if (options.class) node.className = options.class;
  if (options.text != null) node.textContent = options.text;
  if (options.href) node.href = options.href;

  return node;
}

function isSafeUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    return (
      u.protocol === 'https:' ||
      u.protocol === 'http:' ||
      u.protocol === 'mailto:' ||
      url.startsWith('/')
    );
  } catch {
    return false;
  }
}

(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let mx = 0, my = 0;
  const trails = [];
  const TRAIL_COUNT = 10;

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    dot.style.opacity = (1 - i / TRAIL_COUNT) * 0.6;
    dot.style.width = dot.style.height = (4 - i * 0.3) + 'px';
    document.body.appendChild(dot);
    trails.push({ el: dot, x: 0, y: 0 });
  }

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animate() {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';

    let px = mx, py = my;

    trails.forEach((t, i) => {
      const speed = 0.45 - i * 0.02;
      t.x += (px - t.x) * speed;
      t.y += (py - t.y) * speed;
      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
      px = t.x;
      py = t.y;
    });

    requestAnimationFrame(animate);
  })();
})();


const CURSORS = document.querySelectorAll('.blink, .typing-cursor');
let cursorVisible = true;

setInterval(() => {
  cursorVisible = !cursorVisible;

  CURSORS.forEach(c => {
    if (c.classList.contains('blink')) {
      c.style.opacity = cursorVisible ? '1' : '0';
    } else {
      c.style.color = cursorVisible ? 'var(--green)' : 'transparent';
    }
  });
}, 900);


(function initTyping() {
  const elTyping = document.getElementById('typingText');
  if (!elTyping) return;

  const text = 'whoami';
  let i = 0;

  setTimeout(() => {
    const interval = setInterval(() => {
      elTyping.textContent += text[i];
      i++;
      if (i === text.length) clearInterval(interval);
    }, 180);
  }, 1200);
})();


(function initScrollReveal() {
  const elements = document.querySelectorAll('.job, .contact-row');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
})();


(function initSkillBars() {
  const items = document.querySelectorAll('.skill-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-bar-fill');
        const pct  = entry.target.dataset.pct;

        if (fill && pct) {
          fill.style.setProperty('--pct', pct / 100);
        }

        requestAnimationFrame(() => {
          entry.target.classList.add('visible');
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach((el) => observer.observe(el));
})();


(function initNavHighlight() {
  const sections = document.querySelectorAll('section[id], div[id].section-wrap, div[id]');
  const links = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 140) {
        current = sec.id;
      }
    });

    links.forEach(a => {
      const href = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', href === current);
    });
  }, { passive: true });
})();


(function initTerminalForm() {
  const btn = document.getElementById('termSubmit');
  const output = document.getElementById('termOutput');
  const sending = document.getElementById('termSending');

  if (!btn || !output) return;

  function termLine(text, extraClass = '') {
    const div = document.createElement('div');
    div.className = 'term-line' + (extraClass ? ' ' + extraClass : '');
    div.textContent = text;
    output.appendChild(div);
  }

  function clearOutput() {
    output.innerHTML = '';
  }

  function validate(name, email, msg) {
    if (!name) return 'ERR: field "name" required';
    if (!email) return 'ERR: field "email" required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'ERR: wrong email format';
    if (!msg) return 'ERR: field "message" required';
    return null;
  }

  function sendMail(name, email, msg) {
    const subject = `New message from ${name}`;

    const body = `Name: ${name}
    Email: ${email}

    Message:
    ${msg}`;

        const mailtoLink =
          `mailto:${MAIL_TO}` +
          `?subject=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
  }

  btn.addEventListener('click', () => {
    const name = document.getElementById('tName').value.trim();
    const email = document.getElementById('tEmail').value.trim();
    const msg = document.getElementById('tMsg').value.trim();

    clearOutput();

    const error = validate(name, email, msg);
    if (error) {
      termLine(error, 'is-error');
      return;
    }

    btn.disabled = true;
    sending.classList.add('visible');

    sendMail(name, email, msg);

    const msgId = Math.random().toString(36).slice(2, 9);

    const steps = [
      'preparing email...',
      'email ready',
      'opening mail client',
      `Message ID: msg_${msgId}`,
      'ready to send'
    ];

    steps.forEach((text, i) => {
      setTimeout(() => {
        termLine(text, i === steps.length - 1 ? 'is-success' : '');

        if (i === steps.length - 1) {
          btn.disabled = false;
          sending.classList.remove('visible');

          document.getElementById('tName').value = '';
          document.getElementById('tEmail').value = '';
          document.getElementById('tMsg').value = '';
        }
      }, 300 + i * 500);
    });
  });
})();


(function initProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || typeof PROJECTS === 'undefined') return;

  const statusMap = {
    online: { label: 'online', color: 'var(--green)', dot: 'online' },
    wip: { label: 'wip', color: '#ffbd2e', dot: 'work in progress' },
    archived: { label: 'archived', color: '#818181', dot: 'archived' },
    learning: { label: 'learning', color: 'var(--purple)', dot: 'learning' },
  };

  grid.innerHTML = '';

  PROJECTS.forEach(p => {
    const s = statusMap[p.status] || statusMap.wip;

    const card = el('div', { class: 'project-card' });

    const top = el('div', { class: 'project-card-top' });

    const status = el('span', { class: 'project-status' });
    status.style.color = s.color;

    const dot = el('span', { class: `status-dot ${s.dot}` });

    status.appendChild(dot);
    status.append(` ${s.label}`);

    top.appendChild(status);

    if (p.url && isSafeUrl(p.url)) {
      const link = el('a', {
        class: 'project-link',
        text: 'view →'
      });
      link.href = p.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      top.appendChild(link);
    }

    card.appendChild(top);

    const nameRow = el('div', { class: 'project-name-row' });

    if (p.icon) {
      nameRow.appendChild(el('i', { class: `${p.icon} project-icon` }));
    }

    nameRow.appendChild(el('h3', {
      class: 'project-name',
      text: p.name
    }));

    card.appendChild(nameRow);

    card.appendChild(el('p', {
      class: 'project-desc',
      text: p.description
    }));

    const tags = el('div', { class: 'job-tags' });

    p.tags.forEach(t => {
      tags.appendChild(el('span', {
        class: 'tag',
        text: t
      }));
    });

    card.appendChild(tags);

    grid.appendChild(card);
  });

  const cards = grid.querySelectorAll('.project-card');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => obs.observe(c));
})();


(function initExperience() {
  const timeline = document.getElementById('experienceTimeline');
  if (!timeline || typeof EXPERIENCE === 'undefined') return;

  timeline.innerHTML = '';

  EXPERIENCE.forEach(e => {
    const job = el('div', { class: 'job' });

    const header = el('div', { class: 'job-header' });

    const left = el('div', { class: 'job-header-left' });

    left.appendChild(el('h3', {
      class: 'job-title',
      text: e.role
    }));

    left.appendChild(el('p', {
      class: 'job-company-box',
      text: `${e.company} · ${e.area}`
    }));

    const right = el('div', { class: 'job-header-right' });

    right.appendChild(el('p', {
      class: 'job-period',
      text: e.period
    }));

    right.appendChild(el('p', {
      class: 'job-location',
      text: e.location
    }));

    header.appendChild(left);
    header.appendChild(right);

    job.appendChild(header);

    job.appendChild(el('p', {
      class: 'job-desc',
      text: e.description
    }));

    const tags = el('div', { class: 'job-tags' });

    e.tags.forEach(t => {
      tags.appendChild(el('span', {
        class: 'tag',
        text: t
      }));
    });

    job.appendChild(tags);

    timeline.appendChild(job);
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  timeline.querySelectorAll('.job').forEach(el => obs.observe(el));
})();


(function initMesh() {
  const blobs = [
    { x: 15, y: 25, vx: 0.06, vy: 0.04, prop: ['--bx1', '--by1'] },
    { x: 85, y: 75, vx: -0.05, vy: -0.07, prop: ['--bx2', '--by2'] },
    { x: 75, y: 15, vx: -0.04, vy: 0.06, prop: ['--bx3', '--by3'] },
  ];

  function animate() {
    blobs.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;

      if (b.x <= 5 || b.x >= 95) b.vx *= -1;
      if (b.y <= 5 || b.y >= 95) b.vy *= -1;

      document.documentElement.style.setProperty(b.prop[0], b.x + '%');
      document.documentElement.style.setProperty(b.prop[1], b.y + '%');
    });

    requestAnimationFrame(animate);
  }

  animate();
})();