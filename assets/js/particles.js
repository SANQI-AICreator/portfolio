/**
 * particles.js — 背景粒子画布
 * -----------------------------------------------------------------------------
 * 两种模式，随页面滚动到的板块自动切换：
 *   plexus  星座连线（首页 / 关于我）—— 粒子之间与鼠标之间连线
 *   dust    星尘（我的作品）—— 稀疏、闪烁、缓慢漂移
 *
 * 细节：devicePixelRatio 适配（上限 2）、离屏光晕贴图、按屏幕面积自适应数量、
 *       帧率归一、窗口尺寸变化防抖重建、页面不可见时暂停、
 *       系统开启「减少动态效果」时只静态绘制一帧。
 * 对外 API：window.Particles.setMode('plexus' | 'dust')
 */
(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  if (!canvas || !canvas.getContext) {
    return;
  }

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  var MODES = {
    plexus: {
      count: 110,
      minR: 0.7,
      maxR: 1.7,
      minA: 0.22,
      maxA: 0.9,
      linkDist: 118,
      speed: 0.16,
      maxSpeed: 0.5,
      pointerRadius: 150,
      pointerForce: 0.05,
      pointerLinkDist: 150,
      links: true,
      twinkle: false,
      breathe: false,
      glow: 3.4
    },
    dust: {
      count: 160,
      minR: 0.5,
      maxR: 1.3,
      minA: 0.14,
      maxA: 0.75,
      linkDist: 0,
      speed: 0.09,
      maxSpeed: 0.22,
      pointerRadius: 0,
      pointerForce: 0,
      pointerLinkDist: 0,
      links: false,
      twinkle: true,
      breathe: true,
      glow: 3.0
    }
  };

  var width = 0;
  var height = 0;
  var dpr = 1;
  var particles = [];
  var mode = 'plexus';
  var rafId = null;
  var running = false;
  var lastTime = 0;
  var resizeTimer = null;
  var pointer = { x: -1e5, y: -1e5, active: false };

  /* 离屏光晕贴图：一次生成，反复绘制，比逐个粒子创建渐变便宜得多 */
  var GLOW = 64;
  var glowSprite = (function () {
    var c = document.createElement('canvas');
    c.width = c.height = GLOW;
    var g = c.getContext('2d');
    var half = GLOW / 2;
    var grad = g.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.32, 'rgba(255,255,255,0.5)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, GLOW, GLOW);
    return c;
  })();

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function desiredCount(cfg) {
    // 以 1440×900 为基准，按面积在 55% ~ 135% 之间缩放
    var ratio = (width * height) / (1440 * 900);
    ratio = Math.max(0.55, Math.min(1.35, ratio));
    return Math.round(cfg.count * ratio);
  }

  function createParticle(cfg) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rand(-cfg.speed, cfg.speed),
      vy: rand(-cfg.speed, cfg.speed),
      r: rand(cfg.minR, cfg.maxR),
      a: rand(cfg.minA, cfg.maxA),
      phase: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.4, 1.4),
      breatheSpeed: rand(0.5, 1.3)
    };
  }

  function build() {
    var cfg = MODES[mode];
    var total = desiredCount(cfg);
    particles = [];
    for (var i = 0; i < total; i += 1) {
      particles.push(createParticle(cfg));
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (!running) {
      draw(performance.now());
    }
  }

  function draw(now) {
    var cfg = MODES[mode];
    var i;
    var j;
    var p;
    var q;
    var dx;
    var dy;
    var d2;
    var dist;
    var alpha;

    ctx.clearRect(0, 0, width, height);

    if (cfg.links) {
      var linkD2 = cfg.linkDist * cfg.linkDist;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.6;

      for (i = 0; i < particles.length; i += 1) {
        p = particles[i];
        for (j = i + 1; j < particles.length; j += 1) {
          q = particles[j];
          dx = p.x - q.x;
          dy = p.y - q.y;
          d2 = dx * dx + dy * dy;
          if (d2 < linkD2) {
            dist = Math.sqrt(d2);
            alpha = 1 - dist / cfg.linkDist;
            alpha = alpha * alpha * 0.5;
            if (alpha < 0.02) {
              continue;
            }
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // 鼠标周围拉出一张跟随的网
      if (pointer.active && cfg.pointerLinkDist > 0) {
        var pd2 = cfg.pointerLinkDist * cfg.pointerLinkDist;
        ctx.lineWidth = 0.7;
        for (i = 0; i < particles.length; i += 1) {
          p = particles[i];
          dx = p.x - pointer.x;
          dy = p.y - pointer.y;
          d2 = dx * dx + dy * dy;
          if (d2 < pd2) {
            dist = Math.sqrt(d2);
            alpha = 1 - dist / cfg.pointerLinkDist;
            alpha = alpha * alpha * 0.5;
            if (alpha < 0.03) {
              continue;
            }
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }
    }

    ctx.fillStyle = '#fff';
    for (i = 0; i < particles.length; i += 1) {
      p = particles[i];
      alpha = p.a;

      if (cfg.twinkle) {
        alpha *= 0.55 + 0.45 * Math.sin(now * 0.001 * p.twinkleSpeed + p.phase);
      }
      if (alpha < 0.02) {
        continue;
      }

      var r = p.r;
      if (cfg.breathe) {
        r *= 1 + 0.22 * Math.sin(now * 0.0009 * p.breatheSpeed + p.phase * 1.7);
      }

      var glowR = r * cfg.glow;
      ctx.globalAlpha = alpha;
      ctx.drawImage(glowSprite, p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);

      ctx.globalAlpha = Math.min(1, alpha + 0.18);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(r * 0.8, 0.5), 0, 6.283185);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function update(dt) {
    var cfg = MODES[mode];
    var damp = Math.pow(0.985, dt);
    var i;
    var p;
    var dx;
    var dy;
    var dist;
    var force;
    var speed2;

    for (i = 0; i < particles.length; i += 1) {
      p = particles[i];

      if (cfg.pointerRadius > 0 && pointer.active) {
        dx = p.x - pointer.x;
        dy = p.y - pointer.y;
        dist = dx * dx + dy * dy;
        if (dist < cfg.pointerRadius * cfg.pointerRadius && dist > 0.001) {
          dist = Math.sqrt(dist);
          force = (1 - dist / cfg.pointerRadius) * cfg.pointerForce * dt;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.vx *= damp;
      p.vy *= damp;

      // 限速，避免被鼠标甩飞
      speed2 = p.vx * p.vx + p.vy * p.vy;
      if (speed2 > cfg.maxSpeed * cfg.maxSpeed) {
        speed2 = Math.sqrt(speed2);
        p.vx = (p.vx / speed2) * cfg.maxSpeed;
        p.vy = (p.vy / speed2) * cfg.maxSpeed;
      }

      // 保留一点基础漂移，停不下来
      if (Math.abs(p.vx) < cfg.speed * 0.35) {
        p.vx += rand(-0.008, 0.008) * dt;
      }
      if (Math.abs(p.vy) < cfg.speed * 0.35) {
        p.vy += rand(-0.008, 0.008) * dt;
      }

      // 出界后从另一侧回来
      if (p.x < -30) {
        p.x = width + 30;
      } else if (p.x > width + 30) {
        p.x = -30;
      }
      if (p.y < -30) {
        p.y = height + 30;
      } else if (p.y > height + 30) {
        p.y = -30;
      }
    }
  }

  function loop(now) {
    if (!running) {
      return;
    }
    var dt = lastTime ? (now - lastTime) / 16.667 : 1;
    lastTime = now;
    dt = Math.min(Math.max(dt, 0.05), 2.5);
    update(dt);
    draw(now);
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion) {
      draw(performance.now());
      return;
    }
    if (running) {
      return;
    }
    running = true;
    lastTime = 0;
    rafId = window.requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  window.Particles = {
    setMode: function (next) {
      if ((next !== 'plexus' && next !== 'dust') || next === mode) {
        return;
      }
      mode = next;
      build();
      if (!running) {
        draw(performance.now());
      }
    }
  };

  window.addEventListener('resize', function () {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }
    resizeTimer = window.setTimeout(resize, 160);
  });

  window.addEventListener(
    'pointermove',
    function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true }
  );

  window.addEventListener('pointerdown', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  });

  document.addEventListener('mouseleave', function () {
    pointer.active = false;
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  resize();
  start();
})();
