/* Kambium-Schody - skrypt strony */
(function () {
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var spokojnie = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js-on');

  /* --- wielki napis w hero: dopasowanie do szerokosci --- */
  function dopasujNapis() {
    var box = $('.mast-word'); if (!box) return;
    var s = $('span', box); if (!s || !box.clientWidth) return;
    s.style.fontSize = '';
    var cs = getComputedStyle(box);
    var miejsce = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var baza = parseFloat(getComputedStyle(s).fontSize);
    s.style.display = 'inline-block';
    var w = s.getBoundingClientRect().width;
    s.style.display = '';
    if (!w) return;
    var cel = baza * miejsce / w * 0.985;
    var sufit = window.innerHeight * 0.3;
    s.style.fontSize = Math.max(40, Math.min(cel, sufit)) + 'px';
  }
  dopasujNapis();
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(dopasujNapis);
  window.addEventListener('resize', dopasujNapis);

  /* --- pasek nawigacji --- */
  var bar = $('.bar');
  if (bar) {
    var hero = $('.hero');
    var tyk = false;
    var stanPaska = function () {
      tyk = false;
      if (hero) bar.classList.toggle('is-on', (window.scrollY || 0) > hero.offsetHeight - 140);
    };
    if (hero) {
      window.addEventListener('scroll', function () { if (!tyk) { tyk = true; requestAnimationFrame(stanPaska); } }, { passive: true });
      stanPaska();
    }
    var guzik = $('.mtoggle', bar);
    if (guzik) {
      guzik.addEventListener('click', function () {
        var otwarte = bar.classList.toggle('is-open');
        guzik.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
      });
      $$('.mpanel a', bar).forEach(function (a) {
        a.addEventListener('click', function () { bar.classList.remove('is-open'); guzik.setAttribute('aria-expanded', 'false'); });
      });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { bar.classList.remove('is-open'); guzik.setAttribute('aria-expanded', 'false'); }
      });
    }
  }

  /* --- rodzaje schodow: zakladki --- */
  var viewer = $('.viewer');
  if (viewer) {
    var taby = $$('.tab', viewer), kadry = $$('.stage img', viewer), zestawy = $$('.spec-set', viewer);
    var licznik = $('.stage-nr', viewer), podpis = $('.stage-txt', viewer), chip = $('.chip', viewer);
    var dwa = function (n) { return (n < 10 ? '0' : '') + n; };
    var pokaz = function (i) {
      taby.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      kadry.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      zestawy.forEach(function (z, k) { z.hidden = k !== i; });
      if (licznik) licznik.textContent = dwa(i + 1) + ' / ' + dwa(taby.length);
      if (podpis) podpis.textContent = taby[i].getAttribute('data-opis') || '';
      if (chip) chip.textContent = 'Typ /' + dwa(i + 1);
    };
    taby.forEach(function (t, i) {
      t.addEventListener('click', function () { pokaz(i); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        var n = (i + d + taby.length) % taby.length;
        pokaz(n); taby[n].focus(); e.preventDefault();
      });
    });
  }

  /* --- wstega zdjec w perspektywie --- */
  var ribbon = $('.ribbon');
  if (ribbon) {
    var tor = $('.ribbon-track', ribbon), wzor = $$('.rt', tor);
    if (wzor.length > 2) {
      for (var r = 0; r < 2; r++) wzor.forEach(function (f) {
        var k = f.cloneNode(true); k.setAttribute('aria-hidden', 'true');
        var im = $('img', k); if (im) im.alt = '';
        tor.appendChild(k);
      });
      var plytki = $$('.rt', tor), ile = plytki.length;
      ribbon.classList.add('is-3d');
      var przes = 0, krok = 0, widac = true, ost = 0;
      var mierz = function () { krok = plytki[0].offsetWidth * 1.085; };
      var uloz = function () {
        var calosc = ile * krok, pol = calosc / 2;
        for (var i = 0; i < ile; i++) {
          var x = ((i * krok + przes) % calosc + calosc) % calosc - pol;
          var n = x / krok;
          var z = Math.min(n * n * 19, 470);
          plytki[i].style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + (-n * 7.4).toFixed(2) + 'deg)';
          plytki[i].style.visibility = Math.abs(n) > 7.5 ? 'hidden' : '';
        }
      };
      var klatka = function (t) {
        if (widac) {
          var dt = ost ? Math.min(t - ost, 60) : 16;
          przes -= dt * 0.022;
          uloz();
        }
        ost = t;
        requestAnimationFrame(klatka);
      };
      mierz(); uloz();
      window.addEventListener('resize', function () { mierz(); uloz(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (w) { widac = w[0].isIntersecting; }, { rootMargin: '120px' }).observe(ribbon);
      }
      if (!spokojnie) requestAnimationFrame(klatka);
    }
  }

  /* --- galeria: filtry --- */
  var filtry = $$('.filtr');
  if (filtry.length) {
    var figury = $$('.mur figure'), wynik = $('.filtry output');
    var filtruj = function (f) {
      var n = 0;
      figury.forEach(function (fig) {
        var ok = f === 'all' || fig.getAttribute('data-k') === f;
        fig.hidden = !ok; if (ok) n++;
      });
      filtry.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
      if (wynik) wynik.textContent = dwaZ(n) + ' / ' + dwaZ(figury.length);
    };
    var dwaZ = function (n) { return (n < 10 ? '0' : '') + n; };
    filtry.forEach(function (b) { b.addEventListener('click', function () { filtruj(b.getAttribute('data-f')); }); });
  }

  /* --- pas z biegiem schodow: linia rysuje sie razem z przewijaniem i zostaje --- */
  var bieg = $('.bieg');
  if (bieg) {
    var rysunek = $('svg', bieg), etykiety = $$('span', bieg), postep = -1;
    var rysuj = function () {
      var r = bieg.getBoundingClientRect(), vh = window.innerHeight;
      var p = spokojnie ? 1 : (vh - r.top) / (vh * 0.5 + r.height);
      p = Math.max(0, Math.min(1, p));
      if (p <= postep) return;
      postep = p;
      rysunek.style.clipPath = 'inset(-20% ' + ((1 - p) * 100).toFixed(1) + '% -20% 0)';
      etykiety.forEach(function (e, i) { if (p > 0.16 + i * 0.36) e.classList.add('in'); });
    };
    window.addEventListener('scroll', rysuj, { passive: true });
    window.addEventListener('resize', rysuj, { passive: true });
    rysuj();
  }

  /* --- odslanianie przy przewijaniu (z bezpiecznikiem) --- */
  var rv = $$('.rv');
  var odslon = function (el) { el.classList.add('in'); };
  if (!('IntersectionObserver' in window) || spokojnie) {
    rv.forEach(odslon);
  } else {
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { if (w.isIntersecting) { odslon(w.target); io.unobserve(w.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
    var bezpiecznik = function () {
      var h = window.innerHeight;
      rv.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var b = el.getBoundingClientRect();
        if (b.top < h * 1.1 && b.bottom > -40) { odslon(el); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', bezpiecznik, { passive: true });
    window.addEventListener('resize', bezpiecznik, { passive: true });
    doc.addEventListener('visibilitychange', bezpiecznik);
    setTimeout(bezpiecznik, 900);
    window.addEventListener('beforeprint', function () { rv.forEach(odslon); });
  }

  /* --- dolny pasek na telefonie: chowa sie przy stopce --- */
  var dolny = $('.sticky-reserve');
  if (dolny && 'IntersectionObserver' in window) {
    var cele = $$('.foot, .closing'), widoczne = 0, mapa = [];
    var obs = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) {
        var i = cele.indexOf(w.target);
        mapa[i] = w.isIntersecting;
      });
      widoczne = mapa.filter(Boolean).length;
      dolny.classList.toggle('schowany', widoczne > 0);
    }, { threshold: 0.12 });
    cele.forEach(function (c) { obs.observe(c); });
  }
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08: pełne odliczanie dni/godzin/minut/sekund).
// Element wstrzykuje multipage TYLKO w dema. Nie wita klienta przy wejściu - wjeżdża
// po zejściu z pierwszego ekranu i chowa się po powrocie na górę.
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };

  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);   // dni; 0 = brak wznowienia
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    // po wygaśnięciu licznik rusza od nowa (K. 10.08) - dema i tak zostają, a odliczanie
    // ma dawać klientowi realne poczucie, że sprawa ma termin.
    while (ms <= 0 && cykl > 0) {
      koniec = new Date(koniec.getTime() + cykl * 86400000);
      ms = koniec - teraz;
    }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;

  var tick = false;
  function stan() {
    el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true; requestAnimationFrame(stan);
  }, { passive: true });
  stan();
})();

/* === licznik otwarć demo (buy-signal) v3 — geo po stronie serwera === */
(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
