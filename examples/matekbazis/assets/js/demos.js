/* Interactive demos: unit circle, secant→tangent, Riemann sum */
(function () {
  const MB = window.MB;
  const NS = 'http://www.w3.org/2000/svg';
  function num(x, d) {
    const s = Number(x).toFixed(d == null ? 3 : d);
    return MB.lang === 'en' ? s : s.replace('.', ',');
  }

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, attrs) {
    const t = el('text', Object.assign({ x: x, y: y, fill: 'currentColor', 'font-size': 11, 'font-family': 'var(--font-ui)' }, attrs || {}), parent);
    t.textContent = s;
    return t;
  }
  function frame(host, w, h) {
    const svg = el('svg', { viewBox: '0 0 ' + w + ' ' + h, class: 'demo-canvas', role: 'img' }, host);
    svg.style.color = 'var(--ink-2)';
    return svg;
  }

  /* ---------- unit circle ---------- */
  function unitCircle(host) {
    host.classList.add('demo');
    host.innerHTML = '<div class="demo-head"><h3>' + MB.T('Az egységkör', 'The unit circle') + '</h3><span class="tag">' + MB.T('interaktív', 'interactive') + '</span></div>' +
      '<div class="demo-body"><div class="demo-stage"></div><div class="demo-panel">' +
      '<label>' + MB.T('Szög', 'Angle') + ' <span id="ucDeg">45°</span></label><input type="range" id="ucRange" min="0" max="360" value="45">' +
      '<div class="demo-readout" id="ucRead"></div>' +
      '<p style="font-size:.72rem;color:var(--muted);margin:0;font-family:var(--font-ui)">' + MB.T('A pont koordinátái $(\\cos\\alpha,\\sin\\alpha)$. A függőleges vetület a szinusz, a vízszintes a koszinusz.', 'The point has coordinates $(\\cos\\alpha,\\sin\\alpha)$. The vertical projection is the sine, the horizontal one the cosine.') + '</p></div></div>';
    const stage = host.querySelector('.demo-stage');
    const W = 360, H = 360, C = 180, R = 128;
    const svg = frame(stage, W, H);
    el('circle', { cx: C, cy: C, r: R, fill: 'none', stroke: 'var(--line)', 'stroke-width': 1.5 }, svg);
    el('line', { x1: C - R - 18, y1: C, x2: C + R + 18, y2: C, stroke: 'var(--line)', 'stroke-width': 1 }, svg);
    el('line', { x1: C, y1: C - R - 18, x2: C, y2: C + R + 18, stroke: 'var(--line)', 'stroke-width': 1 }, svg);
    txt(svg, C + R + 8, C + 14, '1', { fill: 'var(--muted)' });
    txt(svg, C - 12, C - R - 8, '1', { fill: 'var(--muted)' });
    txt(svg, C + R - 2, C + 14, 'x', { fill: 'var(--muted)' });
    txt(svg, C - 12, C - R + 2, 'y', { fill: 'var(--muted)' });
    const ray = el('line', { x1: C, y1: C, x2: C, y2: C, stroke: 'var(--bme-gold)', 'stroke-width': 2 }, svg);
    const sinLine = el('line', { x1: C, y1: C, x2: C, y2: C, stroke: 'var(--bme-blue)', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .9 }, svg);
    const cosLine = el('line', { x1: C, y1: C, x2: C, y2: C, stroke: 'var(--ok)', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .9 }, svg);
    const point = el('circle', { cx: C, cy: C, r: 6, fill: 'var(--bme-navy)', stroke: '#fff', 'stroke-width': 2 }, svg);
    const arc = el('path', { fill: 'none', stroke: 'var(--bme-gold)', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, svg);
    const range = host.querySelector('#ucRange');
    const read = host.querySelector('#ucRead');
    const degEl = host.querySelector('#ucDeg');

    function draw(deg) {
      const a = deg * Math.PI / 180;
      const x = C + R * Math.cos(a), y = C - R * Math.sin(a);
      ray.setAttribute('x2', x); ray.setAttribute('y2', y);
      point.setAttribute('cx', x); point.setAttribute('cy', y);
      sinLine.setAttribute('x1', x); sinLine.setAttribute('y1', C); sinLine.setAttribute('x2', x); sinLine.setAttribute('y2', y);
      cosLine.setAttribute('x1', C); cosLine.setAttribute('y1', C); cosLine.setAttribute('x2', x); cosLine.setAttribute('y2', C);
      const large = deg > 180 ? 1 : 0;
      arc.setAttribute('d', 'M ' + (C + 34) + ' ' + C + ' A 34 34 0 ' + large + ' 0 ' + (C + 34 * Math.cos(a)) + ' ' + (C - 34 * Math.sin(a)));
      degEl.textContent = deg + '°';
      const exact = {
        0: ['0', '1', '0'], 30: ['1/2', '√3/2', '1/√3'], 45: ['√2/2', '√2/2', '1'], 60: ['√3/2', '1/2', '√3'],
        90: ['1', '0', 'nincs'], 120: ['√3/2', '−1/2', '−√3'], 135: ['√2/2', '−√2/2', '−1'], 150: ['1/2', '−√3/2', '−1/√3'],
        180: ['0', '−1', '0'], 210: ['−1/2', '−√3/2', '1/√3'], 225: ['−√2/2', '−√2/2', '1'], 240: ['−√3/2', '−1/2', '√3'],
        270: ['−1', '0', 'nincs'], 300: ['−√3/2', '1/2', '−√3'], 315: ['−√2/2', '√2/2', '−1'], 330: ['−1/2', '√3/2', '−1/√3']
      }[((deg % 360) + 360) % 360];
      const s = Math.sin(a), c = Math.cos(a), t = Math.abs(c) < 1e-9 ? MB.T('nincs', 'undefined') : num(s / c, 3);
      read.innerHTML = (exact ? MB.T('pontos:', 'exact:') + ' sin = ' + exact[0] + ' · cos = ' + exact[1] + ' · tg = ' + (exact[2] === 'nincs' ? MB.T('nincs', 'undefined') : exact[2]) + '<br>' : '') +
        'sin = <b>' + num(s, 3) + '</b><br>cos = <b>' + num(c, 3) + '</b><br>tg = <b>' + t + '</b>';
    }
    range.addEventListener('input', function () { draw(+range.value); });
    let drag = false;
    function setFromEvent(e) {
      const rect = svg.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * W;
      const py = (e.clientY - rect.top) / rect.height * H;
      let a = Math.atan2(C - py, px - C) * 180 / Math.PI;
      if (a < 0) a += 360;
      range.value = Math.round(a);
      draw(Math.round(a));
    }
    svg.addEventListener('pointerdown', function (e) { drag = true; setFromEvent(e); });
    window.addEventListener('pointermove', function (e) { if (drag) setFromEvent(e); });
    window.addEventListener('pointerup', function () { drag = false; });
    draw(45);
  }

  /* ---------- secant → tangent ---------- */
  function secant(host) {
    host.classList.add('demo');
    host.innerHTML = '<div class="demo-head"><h3>' + MB.T('A szelőből lesz az érintő', 'The secant becomes the tangent') + '</h3><span class="tag">' + MB.T('interaktív', 'interactive') + '</span></div>' +
      '<div class="demo-body"><div class="demo-stage"></div><div class="demo-panel">' +
      '<label>h <span id="secH">1,00</span></label><input type="range" id="secRange" min="2" max="150" value="100">' +
      '<div class="demo-readout" id="secRead"></div>' +
      '<p style="font-size:.72rem;color:var(--muted);margin:0;font-family:var(--font-ui)">' + MB.T('$f(x)=x^2$, $x_0=1$. A szelő meredeksége $2+h$; ahogy $h\\to0$, a szelő az érintőhöz tart, meredeksége $2$.', '$f(x)=x^2$, $x_0=1$. The secant slope is $2+h$; as $h\\to0$, the secant approaches the tangent, whose slope is $2$.') + '</p></div></div>';
    const W = 420, H = 320, pad = 36;
    const stage = host.querySelector('.demo-stage');
    const svg = frame(stage, W, H);
    const xmin = -0.3, xmax = 2.6, ymin = -1.2, ymax = 6.4;
    function X(x) { return pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad); }
    function Y(y) { return H - pad - (y - ymin) / (ymax - ymin) * (H - 2 * pad); }
    el('line', { x1: X(xmin), y1: Y(0), x2: X(xmax), y2: Y(0), stroke: 'var(--line)', 'stroke-width': 1 }, svg);
    el('line', { x1: X(0), y1: Y(ymin), x2: X(0), y2: Y(ymax), stroke: 'var(--line)', 'stroke-width': 1 }, svg);
    for (let i = -1; i <= 6; i++) { txt(svg, X(0) - 20, Y(i) + 4, String(i), { fill: 'var(--muted)', 'font-size': 9 }); }
    let d = '';
    for (let i = 0; i <= 120; i++) {
      const x = xmin + (xmax - xmin) * i / 120;
      d += (i ? ' L ' : 'M ') + X(x) + ' ' + Y(x * x);
    }
    el('path', { d: d, fill: 'none', stroke: 'var(--bme-navy)', 'stroke-width': 2.5 }, svg);
    const tangent = el('line', { stroke: 'var(--bme-gold)', 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }, svg);
    const sec = el('line', { stroke: 'var(--bme-blue)', 'stroke-width': 1.8 }, svg);
    const p0 = el('circle', { r: 5, fill: 'var(--bme-navy)' }, svg);
    const p1 = el('circle', { r: 5, fill: 'var(--bme-blue)' }, svg);
    const range = host.querySelector('#secRange');
    const read = host.querySelector('#secRead');
    const hEl = host.querySelector('#secH');
    function draw() {
      const h = +range.value / 100;
      const x0 = 1, y0 = 1, x1 = 1 + h, y1 = x1 * x1;
      const m = (y1 - y0) / h;
      hEl.textContent = num(h, 2);
      p0.setAttribute('cx', X(x0)); p0.setAttribute('cy', Y(y0));
      p1.setAttribute('cx', X(x1)); p1.setAttribute('cy', Y(y1));
      sec.setAttribute('x1', X(x0 - 0.4)); sec.setAttribute('y1', Y(y0 - 0.4 * m));
      sec.setAttribute('x2', X(x1 + 0.4)); sec.setAttribute('y2', Y(y1 + 0.4 * m));
      tangent.setAttribute('x1', X(x0 - 1)); tangent.setAttribute('y1', Y(y0 - 2));
      tangent.setAttribute('x2', X(x0 + 1)); tangent.setAttribute('y2', Y(y0 + 2));
      read.innerHTML = MB.T('szelő meredeksége:', 'secant slope:') + ' <b>' + num(m, 3) + '</b><br>' + MB.T('érintő meredeksége:', 'tangent slope:') + ' <b>' + num(2, 3) + '</b><br>' + MB.T('különbség:', 'difference:') + ' <b>' + num(m - 2, 3) + '</b>';
    }
    range.addEventListener('input', draw);
    draw();
  }

  /* ---------- Riemann sum ---------- */
  function riemann(host) {
    host.classList.add('demo');
    host.innerHTML = '<div class="demo-head"><h3>' + MB.T('Riemann-összeg', 'Riemann sum') + '</h3><span class="tag">' + MB.T('interaktív', 'interactive') + '</span></div>' +
      '<div class="demo-body"><div class="demo-stage"></div><div class="demo-panel">' +
      '<label>' + MB.T('Osztások száma', 'Number of subdivisions') + ' <span id="riN">8</span></label><input type="range" id="riRange" min="1" max="50" value="8">' +
      '<div class="demo-readout" id="riRead"></div>' +
      '<p style="font-size:.72rem;color:var(--muted);margin:0;font-family:var(--font-ui)">' + MB.T('$f(x)=x^2$ a $[0,1]$ intervallumon. A téglalapok bal végponti összege a görbe alatti területhez tart; a pontos érték $1/3$.', '$f(x)=x^2$ on $[0,1]$. The left-endpoint sum of the rectangles approaches the area under the curve; the exact value is $1/3$.') + '</p></div></div>';
    const W = 420, H = 280, pad = 34;
    const stage = host.querySelector('.demo-stage');
    const svg = frame(stage, W, H);
    const xmin = -0.05, xmax = 1.05, ymin = -0.08, ymax = 1.15;
    function X(x) { return pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad); }
    function Y(y) { return H - pad - (y - ymin) / (ymax - ymin) * (H - 2 * pad); }
    el('line', { x1: X(xmin), y1: Y(0), x2: X(xmax), y2: Y(0), stroke: 'var(--line)' }, svg);
    el('line', { x1: X(0), y1: Y(ymin), x2: X(0), y2: Y(ymax), stroke: 'var(--line)' }, svg);
    const bars = el('g', {}, svg);
    let d = '';
    for (let i = 0; i <= 120; i++) { const x = i / 120; d += (i ? ' L ' : 'M ') + X(x) + ' ' + Y(x * x); }
    el('path', { d: d, fill: 'none', stroke: 'var(--bme-navy)', 'stroke-width': 2.5 }, svg);
    const range = host.querySelector('#riRange');
    const read = host.querySelector('#riRead');
    const nEl = host.querySelector('#riN');
    function draw() {
      const n = +range.value;
      nEl.textContent = n;
      bars.innerHTML = '';
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const x0 = i / n, x1 = (i + 1) / n, y = x0 * x0;
        sum += y / n;
        el('rect', { x: X(x0), y: Y(y), width: Math.max(0, X(x1) - X(x0) - 0.5), height: Math.max(0, Y(0) - Y(y)), fill: 'var(--bme-gold)', opacity: .28, stroke: 'var(--bme-gold)', 'stroke-width': .7 }, bars);
      }
      read.innerHTML = MB.T('Riemann-összeg:', 'Riemann sum:') + ' <b>' + num(sum, 4) + '</b><br>' + MB.T('pontos terület:', 'exact area:') + ' <b>' + num(1 / 3, 4) + '</b><br>' + MB.T('hiba:', 'error:') + ' <b>' + num(1 / 3 - sum, 4) + '</b>';
    }
    range.addEventListener('input', draw);
    draw();
  }

  MB.mountDemos = function (root) {
    MB.qsa('[data-demo]', root).forEach(function (host) {
      if (host.dataset.mounted) return;
      host.dataset.mounted = '1';
      const type = host.dataset.demo;
      if (type === 'unitcircle') unitCircle(host);
      else if (type === 'secant') secant(host);
      else if (type === 'riemann') riemann(host);
    });
  };
})();
