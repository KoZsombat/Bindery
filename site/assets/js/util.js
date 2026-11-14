/* Shared utilities: icons, DOM, math answer checking, storage */
(function () {
  const MB = (window.MB = window.MB || {});

  const ICONS = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    sigma: '<path d="M17 5H7l6 7-6 7h10"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    alert: '<path d="M12 4 3 20h18z"/><path d="M12 9v5M12 17h.01"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M8 14a6 6 0 1 1 8 0c-1 .8-1 2-1 2H9s0-1.2-1-2Z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    grid: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M7 14h10v6H7z"/>',
    home: '<path d="m4 11 8-7 8 7"/><path d="M6 10v10h12V10"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M12 12v5M9 21h6M10 17h4"/>',
    send: '<path d="M21 3 10 14"/><path d="M21 3 14 21l-4-7-7-4z"/>'
  };

  MB.icon = function (name, cls) {
    return '<span class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg></span>';
  };
  MB.hydrateIcons = function (root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      const n = el.getAttribute('data-icon');
      if (ICONS[n]) el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[n] + '</svg>';
    });
  };

  MB.lang = 'hu';
  MB.t = function (s) {
    if (MB.lang === 'en' && MB.i18n && MB.i18n.en && MB.i18n.en[s] != null) return MB.i18n.en[s];
    return s;
  };
  MB.tag = function (s) {
    if (MB.lang === 'en' && MB.i18n && MB.i18n.en && MB.i18n.en[s]) return MB.i18n.en[s];
    return s;
  };
  MB.sTitle = function (s) {
    const e = MB.lang === 'en' && MB.en && MB.en.sections[s.id];
    return e ? e.title : s.title;
  };
  MB.sSub = function (s) {
    const e = MB.lang === 'en' && MB.en && MB.en.sections[s.id];
    return e ? e.subtitle : s.subtitle;
  };
  MB.sIntro = function (s) {
    const e = MB.lang === 'en' && MB.en && MB.en.sections[s.id];
    return e ? e.intro : s.intro;
  };
  MB.cTitle = function (c) {
    const e = MB.lang === 'en' && MB.en && MB.en.chapters[c.sectionId + '/' + c.id];
    return e ? e.title : c.title;
  };
  MB.cLead = function (c) {
    const e = MB.lang === 'en' && MB.en && MB.en.chapters[c.sectionId + '/' + c.id];
    return e ? e.lead : c.lead;
  };
  MB.cSummary = function (c) {
    const e = MB.lang === 'en' && MB.en && MB.en.chapters[c.sectionId + '/' + c.id];
    return e ? e.summary : '';
  };

  MB.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };
  MB.strip = function (s) {
    return String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\$[^$]*\$/g, ' ').replace(/\s+/g, ' ').trim();
  };
  MB.slug = function (s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };
  MB.fold = function (s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };
  MB.byId = function (arr, key, val) {
    return arr.find(function (x) { return x[key] === val; });
  };

  MB.store = {
    key: 'matekbazis.v1',
    get: function () {
      try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { return {}; }
    },
    set: function (v) {
      try { localStorage.setItem(this.key, JSON.stringify(v)); } catch (e) {}
    }
  };

  MB.toast = function (msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };


  /* Translate exact standalone UI labels after render. Skips math, code and inputs. */
  MB.translateDOM = function (root) {
    if (MB.lang !== 'en' || !MB.i18n || !MB.i18n.en) return;
    const dict = MB.i18n.en;
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest('.katex, code, pre, textarea, script, style, [data-no-translate]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = walker.nextNode())) {
      const raw = n.nodeValue;
      const key = raw.trim();
      if (dict[key]) {
        const lead = raw.match(/^\s*/)[0];
        const trail = raw.match(/\s*$/)[0];
        n.nodeValue = lead + dict[key] + trail;
      }
    }
  };

  /* Escape HTML-breaking characters inside math delimiters, without touching tags. */
  MB.protectMath = function (html) {
    function esc(s) { return s.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    let out = '', i = 0;
    while (i < html.length) {
      if (html.startsWith('$$', i)) {
        const e = html.indexOf('$$', i + 2);
        if (e < 0) { out += html.slice(i); break; }
        out += '$$' + esc(html.slice(i + 2, e)) + '$$';
        i = e + 2;
      } else if (html[i] === '$') {
        const e = html.indexOf('$', i + 1);
        if (e < 0) { out += html.slice(i); break; }
        out += '$' + esc(html.slice(i + 1, e)) + '$';
        i = e + 1;
      } else {
        out += html[i++];
      }
    }
    return out;
  };

  /* ---------- answer checking ---------- */
  function toNumberString(s) {
    return String(s).replace(/\s+/g, '').replace(/\u2212/g, '-').replace(/,/g, '.');
  }

  function safeEval(expr) {
    let e = toNumberString(expr);
    e = e.replace(/\\left|\\right|\\,|\\;/g, '');
    e = e.replace(/\\pi/g, 'pi').replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
    e = e.replace(/\^/g, '**');
    e = e.replace(/sqrt/gi, 'Math.sqrt').replace(/\bpi\b/gi, 'Math.PI').replace(/\be\b/g, 'Math.E');
    e = e.replace(/\bln\b/gi, 'Math.log').replace(/\blog10\b/gi, 'Math.log10').replace(/\blog\b/gi, 'Math.log10');
    e = e.replace(/\bsin\b/gi, 'Math.sin').replace(/\bcos\b/gi, 'Math.cos').replace(/\btan\b/gi, 'Math.tan');
    e = e.replace(/\babs\b/gi, 'Math.abs').replace(/\bexp\b/gi, 'Math.exp');
    e = e.replace(/\barcsin\b/gi, 'Math.asin').replace(/\barccos\b/gi, 'Math.acos').replace(/\barctg\b/gi, 'Math.atan');
    if (!/^[-+*/().\d\sMathsqrtPIElogasincoetanbexp]*$/.test(e)) return NaN;
    try {
      const v = Function('"use strict";return (' + e + ')')();
      return typeof v === 'number' && isFinite(v) ? v : NaN;
    } catch (err) { return NaN; }
  }

  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/\u2212/g, '-')
      .replace(/[{}]/g, '')
      .replace(/\\left|\\right|\\cdot|\\times/g, '')
      .replace(/[·×]/g, '*')
      .replace(/\s+/g, '')
      .replace(/,$/, '')
      .replace(/^\+/, '');
  }

  MB.check = function (user, expected, type, alts) {
    if (user == null || String(user).trim() === '') return false;
    const variants = [expected].concat(alts || []);
    if (type === 'number') {
      const u = safeEval(user);
      return variants.some(function (v) {
        const x = safeEval(v);
        if (isNaN(u) || isNaN(x)) return false;
        return Math.abs(u - x) <= Math.max(1e-7, Math.abs(x) * 1e-6);
      });
    }
    const un = norm(user);
    if (!un) return false;
    return variants.some(function (v) {
      if (norm(v) === un) return true;
      const x = safeEval(v), u = safeEval(user);
      return !isNaN(x) && !isNaN(u) && Math.abs(u - x) <= Math.max(1e-7, Math.abs(x) * 1e-6);
    });
  };

  /* ---------- tiny DOM helpers ---------- */
  MB.qs = function (sel, root) { return (root || document).querySelector(sel); };
  MB.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  MB.on = function (root, ev, sel, fn) {
    (root || document).addEventListener(ev, function (e) {
      const t = e.target.closest(sel);
      if (t && (root || document).contains(t)) fn(e, t);
    });
  };
})();
