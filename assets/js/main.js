/**
 * main.js — 内容渲染 + 单页交互
 * -----------------------------------------------------------------------------
 * 内容全部来自 window.SITE（assets/js/site-data.js），这里只负责：
 *   1. 把数据渲染成 DOM（首页信息、关于我卡片、作品、联系方式）
 *   2. 滚动监听：导航高亮、标题切换、粒子模式切换、阅读进度
 *   3. 作品卡片的展开 / 收起、联系我弹窗、复制到剪贴板
 */
(function () {
  'use strict';

  var SITE = window.SITE || {};
  var reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  var ROUTES = ['home', 'about', 'works'];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function get(path, fallback) {
    var parts = path.split('.');
    var cur = SITE;
    for (var i = 0; i < parts.length; i += 1) {
      if (cur === null || cur === undefined) {
        return fallback;
      }
      cur = cur[parts[i]];
    }
    return cur === undefined || cur === null ? fallback : cur;
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var brandName = get('brand.name', '');
  var brandRole = get('brand.role', '');
  var TITLES = {
    home: brandName + ' · ' + brandRole,
    about: '关于我 · ' + brandName,
    works: '我的作品 · ' + brandName
  };

  /* ==========================================================================
     渲染
     ========================================================================== */

  function renderText() {
    $$('[data-bind]').forEach(function (el) {
      var value = get(el.getAttribute('data-bind'), null);
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });

    // 用数据里的描述同步 <meta>，方便分享和搜索
    var description = get('meta.description', '');
    if (description) {
      ['meta[name="description"]', 'meta[property="og:description"]'].forEach(function (sel) {
        var tag = document.head.querySelector(sel);
        if (tag) {
          tag.setAttribute('content', description);
        }
      });
      var ogTitle = document.head.querySelector('meta[property="og:title"]');
      if (ogTitle && brandName) {
        ogTitle.setAttribute('content', brandName + ' · ' + brandRole);
      }
    }

    var mark = get('brand.mark', '');
    $$('[data-mark]').forEach(function (el) {
      el.innerHTML = mark;
    });

    var meta = get('hero.meta', []);
    var metaBox = $('#hero-meta');
    if (metaBox && meta.length) {
      metaBox.innerHTML = meta
        .map(function (item) {
          return '<li>' + esc(item) + '</li>';
        })
        .join('');
    }

    var facts = get('about.facts', []);
    var factsBox = $('#about-facts');
    if (factsBox && facts.length) {
      factsBox.innerHTML = facts
        .map(function (f) {
          return (
            '<div class="fact"><strong>' +
            esc(f.value) +
            '</strong><span>' +
            esc(f.label) +
            '</span></div>'
          );
        })
        .join('');
    }

    var skills = get('about.skills', []);
    var skillsBox = $('#about-skills');
    if (skillsBox && skills.length) {
      skillsBox.innerHTML = skills
        .map(function (s) {
          return '<li>' + esc(s) + '</li>';
        })
        .join('');
    }
  }

  function renderAboutCards() {
    var grid = $('.about-grid');
    var cards = get('about.cards', []);
    if (!grid || !cards.length) {
      return;
    }
    cards.forEach(function (card, i) {
      var el = document.createElement('article');
      el.className = 'glass-card';
      el.setAttribute('data-reveal', '');
      el.innerHTML =
        '<span class="card-num">' +
        String(i + 1).padStart(2, '0') +
        '</span>' +
        '<h3>' +
        esc(card.title) +
        '</h3>' +
        '<p>' +
        esc(card.text) +
        '</p>';
      grid.appendChild(el);
    });
  }

  function renderProjects() {
    var gallery = $('#gallery');
    var projects = get('works.projects', []);
    if (!gallery || !projects.length) {
      return;
    }

    gallery.innerHTML = projects
      .map(function (p, i) {
        var id = 'proj-panel-' + i;
        var links = (p.links || [])
          .map(function (l) {
            return (
              '<a href="' +
              esc(l.href || '#') +
              '" target="_blank" rel="noopener noreferrer">' +
              esc(l.label || '查看') +
              '</a>'
            );
          })
          .join('');
        var tags = (p.tags || [])
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('');

        return (
          '<article class="project-card" style="--card-bg:' +
          esc(p.bg || '#1a1a1e') +
          ';--card-ink:' +
          esc(p.ink || '#ffffff') +
          ';">' +
          '<button class="card-hit" type="button" aria-expanded="false" aria-controls="' +
          id +
          '" aria-label="展开作品：' +
          esc(p.title) +
          '">' +
          '<span class="card-index">' +
          String(i + 1).padStart(2, '0') +
          '</span>' +
          '<span class="card-mark" aria-hidden="true">' +
          (p.mark || '') +
          '</span>' +
          '<span class="card-name">' +
          esc(p.title) +
          '</span>' +
          '</button>' +
          '<div class="card-panel" id="' +
          id +
          '">' +
          '<span class="card-panel-label">' +
          esc(p.type || '') +
          (p.year ? ' · ' + esc(p.year) : '') +
          '</span>' +
          '<h3>' +
          esc(p.title) +
          '</h3>' +
          '<p>' +
          esc(p.summary || '') +
          '</p>' +
          (tags ? '<ul class="card-tags">' + tags + '</ul>' : '') +
          (links ? '<div class="card-links">' + links + '</div>' : '') +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderContact() {
    var list = $('#contact-list');
    var items = get('contact.items', []);
    if (!list || !items.length) {
      return;
    }
    list.innerHTML = items
      .map(function (item) {
        return (
          '<button class="contact-row" type="button" data-copy="' +
          esc(item.value) +
          '">' +
          '<span class="contact-row-label">' +
          esc(item.label) +
          '</span>' +
          '<span class="contact-row-value">' +
          esc(item.value) +
          '</span>' +
          '</button>'
        );
      })
      .join('');
  }

  renderText();
  renderAboutCards();
  renderProjects();
  renderContact();

  /* ==========================================================================
     滚动：导航高亮 / 标题 / 粒子模式 / 进度条
     ========================================================================== */

  var header = $('#site-header');
  var progressBar = $('#progress-bar');
  var nav = $('#site-nav');
  var navPill = $('#nav-pill');
  var navLinks = $$('.nav-link');
  var currentRoute = null;
  var scrollTicking = false;

  function sectionAt() {
    var line = window.innerHeight * 0.35;
    var active = ROUTES[0];
    ROUTES.forEach(function (route) {
      var el = document.getElementById(route);
      if (el && el.getBoundingClientRect().top <= line) {
        active = route;
      }
    });
    return active;
  }

  function movePill() {
    if (!nav || !navPill) {
      return;
    }
    var active = $('.nav-link.is-active', nav);
    if (!active || window.innerWidth <= 860) {
      navPill.classList.remove('is-on');
      return;
    }
    var navRect = nav.getBoundingClientRect();
    var linkRect = active.getBoundingClientRect();
    navPill.style.width = linkRect.width + 'px';
    navPill.style.transform =
      'translateX(' + (linkRect.left - navRect.left - nav.clientLeft) + 'px)';
    navPill.classList.add('is-on');
  }

  function applyRoute(route, updateTitle) {
    if (route === currentRoute) {
      return;
    }
    currentRoute = route;

    navLinks.forEach(function (link) {
      var on = link.getAttribute('data-route') === route;
      link.classList.toggle('is-active', on);
      if (on) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (updateTitle !== false && TITLES[route]) {
      document.title = TITLES[route];
    }

    if (window.Particles && window.Particles.setMode) {
      window.Particles.setMode(route === 'works' ? 'dust' : 'plexus');
    }

    movePill();
  }

  function updateScrollUI() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.transform = 'scaleX(' + (max > 8 ? Math.min(1, y / max) : 0) + ')';
    }
    if (header) {
      header.classList.toggle('is-scrolled', y > 12);
    }
    applyRoute(sectionAt());
  }

  function onScroll() {
    if (scrollTicking) {
      return;
    }
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      scrollTicking = false;
      updateScrollUI();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('resize', movePill);

  /* ==========================================================================
     导航点击 / 深链接
     ========================================================================== */

  function scrollToRoute(route) {
    var el = document.getElementById(route);
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function routeFromHash() {
    var hash = (window.location.hash || '').replace(/^#\/?/, '');
    return ROUTES.indexOf(hash) !== -1 ? hash : null;
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-route]');
    if (link) {
      e.preventDefault();
      var route = link.getAttribute('data-route');
      applyRoute(route);
      scrollToRoute(route);
      setMenu(false);
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + route);
      }
    }
  });

  window.addEventListener('hashchange', function () {
    var route = routeFromHash();
    if (route) {
      applyRoute(route);
      scrollToRoute(route);
    }
  });

  /* 首页人像的浮动与悬停放大都在 CSS 里完成（.hero-stage / .hero-portrait），这里不需要 JS */

  /* ==========================================================================
     移动端菜单
     ========================================================================== */

  var menuBtn = $('#menu-btn');

  function setMenu(open) {
    if (!menuBtn) {
      return;
    }
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
  }

  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('menu-open')) {
      return;
    }
    if (e.target.closest('#site-nav') || e.target.closest('#menu-btn')) {
      return;
    }
    setMenu(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) {
      setMenu(false);
    }
  });

  /* ==========================================================================
     作品卡片：展开 / 收起
     ========================================================================== */

  var gallery = $('#gallery');

  function collapseAll() {
    $$('.project-card', gallery).forEach(function (card) {
      card.classList.remove('is-active');
      var hit = $('.card-hit', card);
      if (hit) {
        hit.setAttribute('aria-expanded', 'false');
      }
    });
    gallery.classList.remove('has-active');
  }

  if (gallery) {
    gallery.addEventListener('click', function (e) {
      var hit = e.target.closest('.card-hit');
      if (!hit) {
        return;
      }
      var card = hit.closest('.project-card');
      var wasActive = card.classList.contains('is-active');
      collapseAll();
      if (!wasActive) {
        card.classList.add('is-active');
        hit.setAttribute('aria-expanded', 'true');
        gallery.classList.add('has-active');
      }
    });

    // 柔光跟随鼠标
    gallery.addEventListener(
      'pointermove',
      function (e) {
        var card = e.target.closest('.project-card');
        if (!card) {
          return;
        }
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - rect.left + 'px');
        card.style.setProperty('--my', e.clientY - rect.top + 'px');
      },
      { passive: true }
    );
  }

  /* ==========================================================================
     联系我弹窗 + 复制
     ========================================================================== */

  var modal = $('#contact-modal');
  var toast = $('#toast');
  var lastFocused = null;
  var toastTimer = null;

  function setBodyLock(on) {
    document.body.classList.toggle('is-locked', on);
  }

  function openModal() {
    if (!modal) {
      return;
    }
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setBodyLock(true);
    var card = $('.modal-card', modal);
    if (card) {
      card.focus({ preventScroll: true });
    }
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('is-open')) {
      return;
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    setBodyLock(false);
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  function showToast(message) {
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add('is-shown');
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-shown');
    }, 2200);
  }

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-9999px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      /* 复制失败不阻断流程 */
    }
    document.body.removeChild(area);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        legacyCopy(text);
      });
    }
    legacyCopy(text);
    return Promise.resolve();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-contact]')) {
      openModal();
      return;
    }
    if (e.target.closest('[data-close]')) {
      closeModal();
      return;
    }
    var copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      var value = copyBtn.getAttribute('data-copy');
      copyText(value).then(function () {
        showToast('已复制：' + value);
      });
    }
  });

  if (modal) {
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') {
        return;
      }
      var focusable = $$('button, [href]', modal).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusable.length) {
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') {
      return;
    }
    if (modal && modal.classList.contains('is-open')) {
      closeModal();
    } else if (document.body.classList.contains('menu-open')) {
      setMenu(false);
    } else if (gallery && gallery.classList.contains('has-active')) {
      collapseAll();
    }
  });

  /* ==========================================================================
     滚动进入动画
     ========================================================================== */

  var revealEls = $$('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  /* ==========================================================================
     初始化
     ========================================================================== */

  (function init() {
    var route = routeFromHash();
    if (route) {
      applyRoute(route);
      var el = document.getElementById(route);
      if (el) {
        el.scrollIntoView({ block: 'start' });
      }
    } else {
      applyRoute('home');
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#home');
      }
    }

    updateScrollUI();
    movePill();

    window.addEventListener('load', function () {
      updateScrollUI();
      movePill();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(movePill);
    }
  })();
})();
