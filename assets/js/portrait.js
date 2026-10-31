/* =============================================================================
 * portrait.js — 首页「活的人像」
 * -----------------------------------------------------------------------------
 * 一张图铺在一块 72×72 的软皮网格上，用阻尼波动方程模拟皮肤：
 *   · 鼠标划过 → 轻轻蹭动边缘
 *   · 按住拖动 → 像面团一样被拉起来，松手回弹、抖动
 *   · 光标移动 → 整个头轻微朝光标方向偏
 * 没有表情包序列（那需要 59 张对齐的同一张脸），只有单张图的可形变网格。
 * ========================================================================== */

(function () {
  'use strict';

  var wrap = document.getElementById('portraitWrap');
  var canvas = document.getElementById('portraitGl');
  var fallback = document.getElementById('portraitFallback');

  if (!wrap || !canvas) {
    return;
  }

  var gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true
  });

  if (!gl) {
    return;
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 网格 ---------- */
  var OVER = 1.7;
  var N = 72;
  var M = N + 1;
  var SPAN = OVER / N;
  var ORIGIN = 0.5 - OVER / 2;
  var WOBBLE = 2.3 * 2 * Math.PI;
  var REACH = 0.085 / SPAN;
  var C = REACH * WOBBLE;
  var GAMMA = 2 * 0.14 * WOBBLE;
  var NU = 0.2 * C;

  var VS = [
    'attribute vec2 a, d;',
    'attribute float s;',
    'varying vec2 vUv;',
    'varying float vS;',
    'uniform vec2 lean;',
    'uniform float overS;',
    'void main(){',
    '  vUv = a; vS = s;',
    '  vec2 p = a + d + lean;',
    '  gl_Position = vec4(vec2(p.x - .5, .5 - p.y) * 2.0 / overS, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FS = [
    'precision highp float;',
    'varying vec2 vUv;',
    'varying float vS;',
    'uniform sampler2D face;',
    'void main(){',
    '  if (vUv.x < 0.0 || vUv.y < 0.0 || vUv.x > 1.0 || vUv.y > 1.0) { gl_FragColor = vec4(0.0); return; }',
    '  vec4 c = texture2D(face, vUv);',
    '  if (c.a < .004) { gl_FragColor = vec4(0.0); return; }',
    '  gl_FragColor = vec4(c.rgb * vS, c.a);',
    '}'
  ].join('\n');

  function shader(type, source) {
    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  var program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  gl.useProgram(program);

  var U = {
    over: gl.getUniformLocation(program, 'overS'),
    lean: gl.getUniformLocation(program, 'lean'),
    face: gl.getUniformLocation(program, 'face')
  };
  gl.uniform1f(U.over, OVER);
  gl.uniform1i(U.face, 0);

  /* ---------- 顶点与索引 ---------- */
  var count = M * M;
  var ux = new Float32Array(count);
  var uy = new Float32Array(count);
  var vx = new Float32Array(count);
  var vy = new Float32Array(count);
  var rest = new Float32Array(count * 2);
  var dyn = new Float32Array(count * 3);
  var sx = new Float32Array(count);
  var sy = new Float32Array(count);
  var restX = new Float32Array(count);
  var restY = new Float32Array(count);

  for (var j = 0, k = 0; j < M; j++) {
    for (var i = 0; i < M; i++) {
      rest[k++] = ORIGIN + i * SPAN;
      rest[k++] = ORIGIN + j * SPAN;
    }
  }
  for (var n = 0; n < count; n++) {
    restX[n] = rest[n * 2];
    restY[n] = rest[n * 2 + 1];
  }

  var idx = new Uint16Array(N * N * 6);
  for (var jj = 0, kk = 0; jj < N; jj++) {
    for (var ii = 0; ii < N; ii++) {
      var a0 = jj * M + ii;
      var b0 = a0 + 1;
      var c0 = a0 + M;
      var d0 = c0 + 1;
      idx[kk++] = a0; idx[kk++] = c0; idx[kk++] = b0;
      idx[kk++] = b0; idx[kk++] = c0; idx[kk++] = d0;
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, rest, gl.STATIC_DRAW);
  var aAttr = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(aAttr);
  gl.vertexAttribPointer(aAttr, 2, gl.FLOAT, false, 0, 0);

  var dynBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
  gl.bufferData(gl.ARRAY_BUFFER, dyn, gl.DYNAMIC_DRAW);

  var dAttr = gl.getAttribLocation(program, 'd');
  var sAttr = gl.getAttribLocation(program, 's');
  gl.enableVertexAttribArray(dAttr);
  gl.vertexAttribPointer(dAttr, 2, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(sAttr);
  gl.vertexAttribPointer(sAttr, 1, gl.FLOAT, false, 12, 8);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  /* ---------- 抓住一小片皮肤 ---------- */
  var brush = null;

  function takeHold(u, v, radius) {
    radius = radius || 0.22;
    var list = [];
    for (var n = 0; n < count; n++) {
      var dx = rest[n * 2] + ux[n] - u;
      var dy = rest[n * 2 + 1] + uy[n] - v;
      var w = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
      if (w > 0.02) {
        list.push([n, w, ux[n], uy[n]]);
      }
    }
    brush = { u: u, v: v, list: list, px: 0, py: 0 };
  }

  /* ---------- 不许折叠：每帧把行列重新排好序 ---------- */
  var GAP = SPAN * 0.34;
  var lineA = new Float32Array(M);
  var lineB = new Float32Array(M);
  var lineP = new Float32Array(M);

  function order(start, stride, field, base) {
    for (var i = 0; i < M; i++) {
      var n = start + i * stride;
      lineP[i] = base[n] + field[n];
    }
    lineA[0] = lineP[0];
    for (var i2 = 1; i2 < M; i2++) {
      lineA[i2] = Math.max(lineP[i2], lineA[i2 - 1] + GAP);
    }
    lineB[N] = lineP[N];
    for (var i3 = N - 1; i3 >= 0; i3--) {
      lineB[i3] = Math.min(lineP[i3], lineB[i3 + 1] - GAP);
    }
    for (var i4 = 0; i4 < M; i4++) {
      var n2 = start + i4 * stride;
      field[n2] = (lineA[i4] + lineB[i4]) / 2 - base[n2];
    }
  }

  function untangle() {
    for (var pass = 0; pass < 2; pass++) {
      for (var j = 0; j < M; j++) {
        order(j * M, 1, sx, restX);
      }
      for (var i = 0; i < M; i++) {
        order(i, M, sy, restY);
      }
    }
  }

  /* ---------- 物理 ---------- */
  var H = 1 / 240;
  var simLeft = 0;

  function step(dt) {
    var c2 = C * C;
    var wo2 = WOBBLE * WOBBLE;
    for (var j = 1; j < N; j++) {
      for (var i = 1; i < N; i++) {
        var k = j * M + i;
        var l = k - 1, r = k + 1, t = k - M, b = k + M;
        var lx = ux[l] + ux[r] + ux[t] + ux[b] - 4 * ux[k];
        var ly = uy[l] + uy[r] + uy[t] + uy[b] - 4 * uy[k];
        var lvx = vx[l] + vx[r] + vx[t] + vx[b] - 4 * vx[k];
        var lvy = vy[l] + vy[r] + vy[t] + vy[b] - 4 * vy[k];
        vx[k] += (c2 * lx - wo2 * ux[k] - GAMMA * vx[k] + NU * lvx) * dt;
        vy[k] += (c2 * ly - wo2 * uy[k] - GAMMA * vy[k] + NU * lvy) * dt;
      }
    }
    if (brush) {
      for (var q = 0; q < brush.list.length; q++) {
        var item = brush.list[q];
        var node = item[0];
        var w = item[1];
        var K = 3000 * w;
        var D = 90 * w;
        vx[node] += ((item[2] + brush.px * w - ux[node]) * K - vx[node] * D) * dt;
        vy[node] += ((item[3] + brush.py * w - uy[node]) * K - vy[node] * D) * dt;
      }
    }
    for (var z = 0; z < count; z++) {
      ux[z] += vx[z] * dt;
      uy[z] += vy[z] * dt;
    }
  }

  function poke(u, v, dx, dy, radius) {
    radius = radius || 0.09;
    for (var n = 0; n < count; n++) {
      var ax = rest[n * 2] - u;
      var ay = rest[n * 2 + 1] - v;
      var w = Math.exp(-(ax * ax + ay * ay) / (radius * radius));
      if (w > 0.01) {
        vx[n] += dx * w;
        vy[n] += dy * w;
      }
    }
  }

  /* ---------- 贴图 ---------- */
  var texture = null;
  var alphaMap = null;
  var ready = false;

  function hitMap(img) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, 128, 128);
    alphaMap = ctx.getImageData(0, 0, 128, 128).data;
  }

  var img = new Image();
  img.decoding = 'async';
  img.onload = function () {
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(U.face, 0);
    hitMap(img);
    ready = true;
    if (fallback) {
      fallback.style.visibility = 'hidden';
    }
    if (reduced) {
      drawOnce();
    }
  };
  img.src = 'assets/img/portrait-square.webp';

  /* ---------- 输入 ---------- */
  var pu = 0.5;
  var pv = 0.5;
  var pressed = false;
  var onHead = false;
  var lastX = 0;
  var lastY = 0;
  var leanX = 0;
  var leanY = 0;
  var targetLeanX = 0;
  var targetLeanY = 0;

  function toUv(x, y) {
    var r = canvas.getBoundingClientRect();
    return [
      ((x - r.left) / r.width - 0.5) * OVER + 0.5,
      ((y - r.top) / r.height - 0.5) * OVER + 0.5
    ];
  }

  function solid(u, v) {
    if (!alphaMap) {
      return true;
    }
    if (u < 0 || v < 0 || u >= 1 || v >= 1) {
      return false;
    }
    return alphaMap[(((v * 128) | 0) * 128 + ((u * 128) | 0)) * 4 + 3] > 40;
  }

  window.addEventListener('pointermove', function (e) {
    var uv = toUv(e.clientX, e.clientY);
    pu = uv[0];
    pv = uv[1];

    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    onHead = solid(pu, pv);
    wrap.style.cursor = pressed ? 'grabbing' : onHead ? 'grab' : '';

    if (ready && !reduced) {
      if (onHead && !pressed) {
        poke(pu, pv, dx * 0.00032, dy * 0.00032, 0.07);
      }
      if (pressed && brush) {
        var px = pu - brush.u;
        var py = pv - brush.v;
        var len = Math.sqrt(px * px + py * py);
        var lim = 0.24;
        if (len > 0) {
          var f = (lim * (1 - Math.exp(-len / lim))) / len;
          px *= f;
          py *= f;
        }
        brush.px = px;
        brush.py = py;
      }
    }
  }, { passive: true });

  wrap.addEventListener('pointerdown', function (e) {
    var uv = toUv(e.clientX, e.clientY);
    if (!solid(uv[0], uv[1])) {
      return;
    }
    pressed = true;
    lastX = e.clientX;
    lastY = e.clientY;
    takeHold(uv[0], uv[1]);
    wrap.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  function release() {
    if (!pressed) {
      return;
    }
    pressed = false;
    brush = null;
    wrap.style.cursor = onHead ? 'grab' : '';
  }

  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  /* ---------- 绘制 ---------- */
  function uploadMesh() {
    for (var j = 0; j < M; j++) {
      for (var i = 0; i < M; i++) {
        var k = j * M + i;
        var edge = i === 0 || j === 0 || i === N || j === N;
        sx[k] = edge ? ux[k] : (ux[k] * 4 + ux[k - 1] + ux[k + 1] + ux[k - M] + ux[k + M]) / 8;
        sy[k] = edge ? uy[k] : (uy[k] * 4 + uy[k - 1] + uy[k + 1] + uy[k - M] + uy[k + M]) / 8;
      }
    }
    untangle();
    for (var n = 0, o = 0; n < count; n++) {
      dyn[o++] = sx[n];
      dyn[o++] = sy[n];
      var r = n % M;
      var c = (n / M) | 0;
      var shade = 1;
      if (r > 0 && r < N && c > 0 && c < N) {
        shade = Math.max(0.86, Math.min(1.16, 1 - ((sx[n + 1] - sx[n - 1]) + (sy[n + M] - sy[n - M])) * 1.8));
      }
      dyn[o++] = shade;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn);
  }

  function paint() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!texture) {
      return;
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform2f(U.lean, leanX, leanY);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
  }

  function drawOnce() {
    uploadMesh();
    paint();
  }

  /* ---------- 尺寸 ---------- */
  var dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) {
      return;
    }
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (ready) {
      drawOnce();
    }
  }

  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  /* ---------- 循环 ---------- */
  var visible = true;
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(canvas);
  }

  var last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    if (!ready || !visible || document.hidden) {
      return;
    }
    var f = 1 - Math.exp(-dt * 6);

    leanX += (targetLeanX - leanX) * f;
    leanY += (targetLeanY - leanY) * f;

    simLeft += dt;
    var steps = 0;
    while (simLeft >= H && steps < 9) {
      step(H);
      simLeft -= H;
      steps++;
    }
    if (steps === 9) {
      simLeft = 0;
    }

    uploadMesh();
    paint();
  }

  if (!reduced) {
    requestAnimationFrame(frame);
  }

  /* 光标位置换成轻微的「头部朝向」 */
  window.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    var nx = (e.clientX - (r.left + r.width / 2)) / (r.width || 1);
    var ny = (e.clientY - (r.top + r.height / 2)) / (r.height || 1);
    targetLeanX = Math.max(-1, Math.min(1, nx)) * 0.006;
    targetLeanY = Math.max(-1, Math.min(1, ny)) * 0.004;
  }, { passive: true });
})();
