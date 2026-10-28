(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const WA_FRANQUIA = '5511973117498';
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- INTRO: 1984 conta até hoje ---------- */
  const root = document.documentElement;
  const intro = $('#intro');
  let seen = false;
  try { seen = sessionStorage.getItem('patroni-intro') === '1'; } catch (e) {}
  if (new URLSearchParams(location.search).has('intro')) seen = false;
  if (!seen && !reduce) {
    root.classList.add('intro-on');
    document.body.style.overflow = 'hidden';
    let done = false;
    const close = () => {
      if (done) return; done = true;
      intro.classList.add('out');
      document.body.style.overflow = '';
      try { sessionStorage.setItem('patroni-intro', '1'); } catch (e) {}
      setTimeout(() => root.classList.remove('intro-on'), 950);
    };
    setTimeout(close, 2900);
    intro.addEventListener('click', close);
    addEventListener('keydown', close, { once: true });
  }

  /* ---------- MENU MOBILE ---------- */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- BRASAS (hero) ---------- */
  const ec = $('#embers'), ex = ec.getContext('2d');
  let EW, EH, embers = [], heroVisible = true;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const sizeEmbers = () => {
    EW = ec.clientWidth; EH = ec.clientHeight;
    ec.width = EW * dpr; ec.height = EH * dpr; ex.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(clamp(EW / 14, 30, 110));
    embers = Array.from({ length: n }, () => newEmber(true));
  };
  const newEmber = init => ({
    x: Math.random() * EW, y: init ? Math.random() * EH : EH + 10,
    r: Math.random() * 2.2 + .5, v: Math.random() * .9 + .35,
    w: Math.random() * Math.PI * 2, ws: Math.random() * .02 + .005,
    life: Math.random() * .6 + .4, hue: 25 + Math.random() * 20
  });
  const drawEmbers = () => {
    if (heroVisible) {
      ex.clearRect(0, 0, EW, EH);
      ex.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        e.y -= e.v; e.w += e.ws; e.x += Math.sin(e.w) * .5;
        const a = clamp(e.y / EH) * e.life;
        if (e.y < -10) Object.assign(e, newEmber(false));
        const g = ex.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
        g.addColorStop(0, `hsla(${e.hue},100%,65%,${a})`);
        g.addColorStop(1, `hsla(${e.hue},100%,50%,0)`);
        ex.fillStyle = g; ex.beginPath(); ex.arc(e.x, e.y, e.r * 4, 0, 7); ex.fill();
      }
      ex.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(drawEmbers);
  };
  sizeEmbers();
  if (!reduce) requestAnimationFrame(drawEmbers);

  /* ---------- SCROLL (um só handler) ---------- */
  const hd = $('#hd');
  const hero = $('#hero'), plate = $('#plate'), hwL = $('.hw-l'), hwR = $('.hw-r');
  const heroCopy = $('.hero-copy');
  const story = $('#historia'), track = $('#storyTrack'), bar = $('#storyBar');
  const isMobile = () => innerWidth <= 760;
  let lastY = scrollY, ticking = false;

  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    hd.classList.toggle('solid', y > 40);
    hd.classList.toggle('hide', y > lastY && y > vh * 1.2 && menu.hidden);
    lastY = y;

    // hero: o prato cresce, PATRÃO se abre
    const hr = hero.getBoundingClientRect();
    heroVisible = hr.bottom > 0;
    const hp = clamp(-hr.top / (hero.offsetHeight - vh));
    if (!reduce) {
      const s = 1 + hp * (isMobile() ? .18 : .32);
      plate.style.transform = `scale(${s}) rotate(${hp * -12}deg)`;
      hwL.style.transform = `translateX(${-hp * 30}vw)`;
      hwR.style.transform = `translateX(${hp * 30}vw)`;
      heroCopy.style.opacity = 1 - clamp(hp * 2.2);
      heroCopy.style.transform = `translateY(${hp * -40}px)`;
    }

    // história: trilho horizontal
    if (!isMobile()) {
      const sr = story.getBoundingClientRect();
      const sp = clamp(-sr.top / (story.offsetHeight - vh));
      const max = track.scrollWidth - innerWidth + $('.story-head').offsetWidth;
      track.style.transform = `translateX(${-sp * Math.max(0, max)}px)`;
      bar.style.transform = `scaleX(${sp})`;
    }

    // eco: brasa vira folha
    const er = eco.getBoundingClientRect();
    ecoP = clamp(1 - (er.top + er.height * .35) / vh);
    ecoVisible = er.top < vh && er.bottom > 0;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { sizeEmbers(); sizeEco(); onScroll(); });

  /* ---------- REVEALS / CONTADORES / VÍDEOS ---------- */
  $$('.frame-txt, .frame-quote, .num, .menu-head, .don-copy, .eco-stat, .feed-head, .fran-head, .steps li, .fform, .fran-quote, .awards h2, .awards-row img, .ft-big').forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    const b = en.target.querySelector('[data-count]') || (en.target.matches('[data-count]') ? en.target : null);
    if (b && !b.dataset.done) countUp(b);
    io.unobserve(en.target);
  }), { threshold: .2 });
  $$('.rv').forEach(el => io.observe(el));

  function countUp(b) {
    b.dataset.done = 1;
    const to = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now(), d = 1600;
    const step = t => {
      const p = clamp((t - t0) / d), e = 1 - Math.pow(1 - p, 4);
      b.textContent = Math.round(to * e).toLocaleString('pt-BR') + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // odômetro 40.000.000
  const odo = $('#odo');
  const odoStr = (+odo.dataset.to).toLocaleString('pt-BR');
  odo.innerHTML = [...odoStr].map(ch => /\d/.test(ch)
    ? `<span class="dg"><span>${Array.from({ length: 20 }, (_, i) => `<i>${i % 10}</i>`).join('')}</span></span>`
    : `<span class="sep">${ch}</span>`).join('');
  new IntersectionObserver((en, o) => {
    if (!en[0].isIntersecting) return; o.disconnect();
    const digits = [...odoStr].filter(c => /\d/.test(c));
    $$('.dg > span', odo).forEach((s, i) => {
      s.style.transitionDelay = (i * 0.09) + 's';
      s.style.transform = `translateY(-${(10 + +digits[i])}em)`;
    });
  }, { threshold: .5 }).observe(odo);

  // vídeos: só tocam perto da tela
  const vio = new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) {
      if (v.dataset.lazy !== undefined && v.preload === 'none') { v.preload = 'auto'; v.load(); }
      v.play().catch(() => {});
    } else v.pause();
  }), { rootMargin: '200px' });
  $$('video').forEach(v => vio.observe(v));
  const donFrame = $('.don-frame');
  new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { donFrame.classList.add('in'); o.disconnect(); } }, { threshold: .3 }).observe($('#don'));

  /* ---------- CARDÁPIO: a pizza se monta ---------- */
  const CAT = {
    'Famosas': [
      ['Don Patroni', 'A pizza do Patrão: receita especialíssima de Mussarela Patroni, molho Patroni Salpicado, calabresa em rodelas, parmesão gratinado, manjericão fresco, azeitonas e orégano.', ['salpicado', 'calabresa', 'parmesao', 'manjericao', 'azeitona']],
      ['Don Patroni Bacon', 'Nossa pizza predileta para os amantes de bacon: Mussarela Patroni, bacon em cubos, molho Patroni Salpicado, parmesão gratinado, manjericão fresco, azeitonas e orégano.', ['salpicado', 'bacon', 'parmesao', 'manjericao', 'azeitona']],
      ['Super Don Patroni', 'Cream cheese, pepperoni, molho Patroni, parmesão gratinado, manjericão fresco, azeitonas e orégano.', ['creamcheese', 'pepperoni', 'parmesao', 'manjericao', 'azeitona']]
    ],
    'Favoritas': [
      ['Frango Mussarela', 'Peito de frango desfiado, coberto com Mussarela Patroni, azeitonas e orégano.', ['frango', 'azeitona']],
      ['Catupiresa', 'Especialmente preparada com Requeijão, calabresa em rodelas, azeitonas e orégano.', ['requeijao', 'calabresa', 'azeitona']],
      ['4 Queijos', 'Combinação de mussarela, provolone, parmesão, Requeijão, azeitonas e orégano.', ['provolone', 'parmesao', 'requeijao', 'azeitona']],
      ['Atum', 'Saudável combinação de atum sólido importado e cebola, azeitonas e orégano.', ['atum', 'cebola', 'azeitona'], true],
      ['Pepperoni', 'Mussarela Patroni, pepperoni em rodelas, azeitonas e orégano.', ['pepperoni', 'azeitona']],
      ['Peppecheese', 'Cream Cheese, pepperoni em rodelas, azeitonas e orégano.', ['creamcheese', 'pepperoni', 'azeitona']],
      ['Peruana', 'Atum sólido importado, coberto com tomates frescos fatiados e Mussarela Patroni, azeitonas e orégano.', ['atum', 'tomate', 'azeitona']],
      ['Frango com Requeijão', 'Peito de frango desfiado Patroni coberto com requeijão, azeitonas e orégano.', ['frango', 'requeijao', 'azeitona']]
    ],
    'Clássicas': [
      ['Calabresa Carioca', 'Mussarela Patroni, calabresa em rodelas, azeitonas e orégano.', ['calabresa', 'azeitona']],
      ['Portuguesa Paulista', 'Irresistível! Feita com Mussarela Patroni, presunto picado, ovos, cebola, azeitonas e orégano.', ['presunto', 'ovo', 'cebola', 'azeitona']],
      ['Americana', 'Mussarela Patroni, bacon, ovos, azeitonas e orégano.', ['bacon', 'ovo', 'azeitona']],
      ['Portuguesa Carioca', 'Preparada com Mussarela Patroni, calabresa, ovos, pimentão, tomate em cubos, cebola, azeitonas e orégano.', ['calabresa', 'ovo', 'pimentao', 'tomatecubo', 'cebola', 'azeitona']],
      ['Napolitana', 'Receita de Napoli! Mussarela Patroni, tomates frescos fatiados, parmesão gratinado, azeitonas e orégano.', ['tomate', 'parmesao', 'azeitona']],
      ['Toscana', 'Direto da região da Toscana! Mussarela Patroni, linguiça calabresa moída, parmesão gratinado, azeitonas e orégano.', ['moida', 'parmesao', 'azeitona']],
      ['Margherita', 'Italianíssima: Mussarela Patroni, molho salpicado, parmesão, manjericão fresco, azeitonas e orégano.', ['salpicado', 'parmesao', 'manjericao', 'azeitona']]
    ],
    'Tradicionais': [
      ['Mussarela', 'Simplesmente Mussarela Patroni, azeitonas e orégano.', ['azeitona']],
      ['Calabresa Paulista', 'Feita com calabresa cortada em rodelas, sobre molho de pizza Patroni, cebola, azeitonas e orégano.', ['calabresa', 'cebola', 'azeitona'], true],
      ['Bauru', 'Feita com presunto picado, tomates fresquinhos fatiados, Mussarela Patroni, azeitonas e orégano.', ['presunto', 'tomate', 'azeitona']],
      ['Baiana', 'Preparada com calabresa moída, ovos, cebola, pimenta calabresa em flocos, azeitonas e orégano.', ['moida', 'ovo', 'cebola', 'pimenta', 'azeitona']]
    ],
    'Vegetarianas': [
      ['Brócolis', 'Brócolis temperado, alho crocante coberto com Mussarela Patroni, azeitonas e orégano.', ['brocolis', 'alho', 'azeitona']],
      ['Vegetariana', 'Pimentão, brócolis, tomate-cereja, alho crocante, azeitonas e orégano.', ['pimentao', 'brocolis', 'cereja', 'alho', 'azeitona']]
    ]
  };

  const cv = $('#pizza'), cx = cv.getContext('2d');
  const S = cv.width, C = S / 2, R = S * .44;
  // aleatório com semente, pra mesma pizza sair sempre igual
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7) || 1;

  // base (massa, molho, queijo) desenhada uma vez
  const base = document.createElement('canvas'); base.width = base.height = S;
  (() => {
    const b = base.getContext('2d'), r = rng(42);
    // borda
    let g = b.createRadialGradient(C, C, R * .82, C, C, R);
    g.addColorStop(0, '#e9b56b'); g.addColorStop(.6, '#d4904a'); g.addColorStop(1, '#a8622c');
    b.fillStyle = g; b.beginPath(); b.arc(C, C, R, 0, 7); b.fill();
    for (let i = 0; i < 90; i++) { // pintas de forno a lenha
      const a = r() * 7, d = R * (.86 + r() * .12);
      b.fillStyle = `rgba(${60 + r() * 40},${25 + r() * 15},10,${.25 + r() * .4})`;
      b.beginPath(); b.ellipse(C + Math.cos(a) * d, C + Math.sin(a) * d, 3 + r() * 9, 2 + r() * 5, a, 0, 7); b.fill();
    }
    // molho
    b.fillStyle = '#b8321c'; b.beginPath(); b.arc(C, C, R * .86, 0, 7); b.fill();
    // queijo
    g = b.createRadialGradient(C, C, 0, C, C, R * .84);
    g.addColorStop(0, '#fbe3a2'); g.addColorStop(.85, '#f3c86f'); g.addColorStop(1, '#e8ad4e');
    b.fillStyle = g; b.beginPath();
    for (let i = 0; i <= 72; i++) {
      const a = i / 72 * Math.PI * 2, d = R * (.8 + Math.sin(i * 1.7) * .02 + r() * .025);
      i ? b.lineTo(C + Math.cos(a) * d, C + Math.sin(a) * d) : b.moveTo(C + Math.cos(a) * d, C + Math.sin(a) * d);
    }
    b.fill();
    for (let i = 0; i < 140; i++) { // bolhas gratinadas
      const a = r() * 7, d = Math.sqrt(r()) * R * .76;
      b.fillStyle = `rgba(${200 + r() * 30},${120 + r() * 30},40,${.15 + r() * .3})`;
      b.beginPath(); b.arc(C + Math.cos(a) * d, C + Math.sin(a) * d, 3 + r() * 10, 0, 7); b.fill();
    }
  })();

  const DRAW = {
    calabresa(c, r) { c.fillStyle = '#b54a3c'; c.beginPath(); c.arc(0, 0, 26, 0, 7); c.fill(); c.fillStyle = '#d97a6a'; c.beginPath(); c.arc(0, 0, 20, 0, 7); c.fill(); for (let i = 0; i < 6; i++) { c.fillStyle = '#f2c3b4'; c.beginPath(); c.arc((r() - .5) * 26, (r() - .5) * 26, 2.5, 0, 7); c.fill(); } },
    pepperoni(c, r) { c.fillStyle = '#9e1e14'; c.beginPath(); c.arc(0, 0, 28, 0, 7); c.fill(); c.fillStyle = '#c3301f'; c.beginPath(); c.arc(-2, -2, 23, 0, 7); c.fill(); for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(80,10,5,.45)'; c.beginPath(); c.arc((r() - .5) * 30, (r() - .5) * 30, 3, 0, 7); c.fill(); } },
    azeitona(c) { c.fillStyle = '#1b1414'; c.beginPath(); c.ellipse(0, 0, 13, 11, 0, 0, 7); c.fill(); c.fillStyle = '#5a1f2b'; c.beginPath(); c.arc(0, 0, 4.5, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-5, -5, 3, 1.6, -.6, 0, 7); c.fill(); },
    manjericao(c) { c.fillStyle = '#2f7d32'; c.beginPath(); c.ellipse(0, 0, 22, 11, 0, 0, 7); c.fill(); c.strokeStyle = '#7fbf66'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-20, 0); c.lineTo(20, 0); c.stroke(); },
    parmesao(c, r) { for (let i = 0; i < 7; i++) { c.fillStyle = r() > .5 ? '#fff6d6' : '#f1dc9c'; c.fillRect((r() - .5) * 40, (r() - .5) * 40, 5, 3); } },
    bacon(c) { c.fillStyle = '#9b3a2e'; c.fillRect(-11, -11, 22, 22); c.fillStyle = '#e8b8a4'; c.fillRect(-11, -3, 22, 6); },
    creamcheese(c, r) { c.fillStyle = '#fffaf2'; c.beginPath(); for (let i = 0; i < 4; i++) c.arc((r() - .5) * 26, (r() - .5) * 20, 12 + r() * 6, 0, 7); c.fill(); },
    requeijao(c, r) { c.strokeStyle = '#fffdf6'; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, -10); c.bezierCurveTo(-15, -30 + r() * 20, 10, 30, 40, 0); c.stroke(); },
    frango(c, r) { c.strokeStyle = '#e7c99a'; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { c.lineWidth = 5 + r() * 3; c.beginPath(); const a = r() * 3; c.moveTo(Math.cos(a) * -18, Math.sin(a) * -18); c.quadraticCurveTo(r() * 10, r() * 10, Math.cos(a) * 18, Math.sin(a) * 18); c.stroke(); } },
    provolone(c) { c.fillStyle = 'rgba(255,240,190,.9)'; c.beginPath(); c.ellipse(0, 0, 30, 20, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(214,150,60,.35)'; c.beginPath(); c.ellipse(4, 3, 18, 10, 0, 0, 7); c.fill(); },
    atum(c, r) { for (let i = 0; i < 5; i++) { c.fillStyle = r() > .5 ? '#b98a6e' : '#d0a688'; c.beginPath(); c.ellipse((r() - .5) * 26, (r() - .5) * 22, 9, 6, r() * 3, 0, 7); c.fill(); } },
    cebola(c) { c.strokeStyle = 'rgba(250,240,245,.9)'; c.lineWidth = 3.5; c.beginPath(); c.ellipse(0, 0, 22, 15, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(0, 0, 14, 9, 0, 0, 7); c.stroke(); },
    tomate(c) { c.fillStyle = '#d42a1d'; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fill(); c.fillStyle = '#f0624e'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(Math.cos(i * 1.57) * 13, Math.sin(i * 1.57) * 13, 8, 5, i * 1.57, 0, 7); c.fill(); } c.fillStyle = '#f7d36a'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(Math.cos(i * 1.57) * 13, Math.sin(i * 1.57) * 13, 2, 0, 7); c.fill(); } },
    tomatecubo(c) { c.fillStyle = '#d42a1d'; c.fillRect(-9, -9, 18, 18); c.fillStyle = '#f0624e'; c.fillRect(-5, -5, 10, 10); },
    cereja(c) { c.fillStyle = '#d82a1e'; c.beginPath(); c.arc(0, 0, 13, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(-4, -4, 3, 0, 7); c.fill(); },
    presunto(c) { c.fillStyle = '#e99a98'; c.fillRect(-12, -10, 24, 20); c.fillStyle = '#f4c0bc'; c.fillRect(-12, -10, 24, 5); },
    ovo(c, r) { for (let i = 0; i < 3; i++) { c.fillStyle = r() > .4 ? '#fffdf5' : '#f7c844'; c.beginPath(); c.ellipse((r() - .5) * 22, (r() - .5) * 22, 8, 6, r() * 3, 0, 7); c.fill(); } },
    pimentao(c) { c.strokeStyle = '#3c8c2c'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(0, 18, 24, -2.4, -.7); c.stroke(); },
    brocolis(c, r) { c.fillStyle = '#3c7f2a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc((r() - .5) * 22, (r() - .5) * 18 - 4, 8, 0, 7); c.fill(); } c.fillStyle = '#9cc56b'; c.fillRect(-4, 4, 8, 14); },
    moida(c, r) { for (let i = 0; i < 6; i++) { c.fillStyle = r() > .5 ? '#8f3a2c' : '#b0503e'; c.beginPath(); c.arc((r() - .5) * 30, (r() - .5) * 30, 4 + r() * 4, 0, 7); c.fill(); } },
    alho(c, r) { for (let i = 0; i < 6; i++) { c.fillStyle = '#e6b24a'; c.beginPath(); c.arc((r() - .5) * 30, (r() - .5) * 30, 3, 0, 7); c.fill(); } },
    pimenta(c, r) { for (let i = 0; i < 8; i++) { c.fillStyle = '#c2190f'; c.fillRect((r() - .5) * 40, (r() - .5) * 40, 4, 2); } },
    salpicado(c, r) { c.fillStyle = 'rgba(190,40,20,.75)'; c.beginPath(); for (let i = 0; i < 3; i++) c.arc((r() - .5) * 30, (r() - .5) * 30, 10 + r() * 8, 0, 7); c.fill(); }
  };
  const COUNT = { calabresa: 16, pepperoni: 15, azeitona: 9, manjericao: 8, parmesao: 26, bacon: 30, creamcheese: 9, requeijao: 6, frango: 28, provolone: 9, atum: 22, cebola: 14, tomate: 9, tomatecubo: 22, cereja: 14, presunto: 26, ovo: 20, pimentao: 14, brocolis: 14, moida: 26, alho: 18, pimenta: 22, salpicado: 12 };
  const ORDER = ['salpicado', 'requeijao', 'creamcheese', 'provolone', 'frango', 'atum', 'presunto', 'moida', 'tomate', 'tomatecubo', 'calabresa', 'pepperoni', 'bacon', 'brocolis', 'pimentao', 'cebola', 'ovo', 'cereja', 'parmesao', 'alho', 'manjericao', 'azeitona', 'pimenta'];

  let pieces = [], spin = 0, spinV = .0012, dragging = false, lastA = 0, startT = 0;
  const build = (name, tops) => {
    const r = rng(hash(name));
    const out = [];
    tops.slice().sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).forEach((t, ti) => {
      const n = COUNT[t] || 10;
      for (let i = 0; i < n; i++) {
        // espalha com espiral dourada + ruído, pra cobrir a pizza toda
        const k = (i + .5) / n, a = i * 2.39996 + r() * .8 + ti, d = Math.sqrt(k) * R * .7 + (r() - .5) * 18;
        out.push({ t, x: Math.cos(a) * d, y: Math.sin(a) * d, rot: r() * 6.28, s: .85 + r() * .4, seed: Math.floor(r() * 1e6) + 1, delay: ti * 120 + r() * 380 });
      }
    });
    // orégano por cima de tudo
    for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * R * .78; out.push({ t: 'oregano', x: Math.cos(a) * d, y: Math.sin(a) * d, rot: r() * 3, s: 1, seed: 1, delay: 700 + r() * 300 }); }
    return out;
  };
  const drawPizza = now => {
    if (!dragging && !reduce) spin += spinV;
    cx.clearRect(0, 0, S, S);
    cx.save(); cx.translate(C, C); cx.rotate(spin);
    cx.shadowColor = 'rgba(60,20,0,.35)'; cx.shadowBlur = 30; cx.shadowOffsetY = 14;
    cx.drawImage(base, -C, -C); cx.shadowColor = 'transparent';
    const el = now - startT;
    for (const p of pieces) {
      const k = reduce ? 1 : clamp((el - p.delay) / 380);
      if (k <= 0) continue;
      const e = 1 - Math.pow(1 - k, 3), drop = (1 - e) * 1.6 + 1;
      cx.save(); cx.globalAlpha = e;
      cx.translate(p.x, p.y - (1 - e) * 40); cx.rotate(p.rot); cx.scale(p.s * drop, p.s * drop);
      if (p.t === 'oregano') { cx.fillStyle = '#4c6b2a'; cx.fillRect(0, 0, 3, 2); }
      else { cx.shadowColor = 'rgba(0,0,0,.25)'; cx.shadowBlur = 4; cx.shadowOffsetY = 2; DRAW[p.t](cx, rng(p.seed)); }
      cx.restore();
    }
    // linhas do corte em 8
    cx.strokeStyle = 'rgba(120,60,20,.22)'; cx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; cx.beginPath(); cx.moveTo(Math.cos(a) * -R * .98, Math.sin(a) * -R * .98); cx.lineTo(Math.cos(a) * R * .98, Math.sin(a) * R * .98); cx.stroke(); }
    cx.restore();
    if (pizzaVisible) requestAnimationFrame(drawPizza); else pizzaRaf = false;
  };
  let pizzaVisible = false, pizzaRaf = false;
  new IntersectionObserver(en => {
    pizzaVisible = en[0].isIntersecting;
    if (pizzaVisible && !pizzaRaf) { pizzaRaf = true; requestAnimationFrame(drawPizza); }
  }).observe(cv);

  // girar a pizza com o dedo/mouse
  const angle = e => { const b = cv.getBoundingClientRect(); return Math.atan2(e.clientY - b.top - b.height / 2, e.clientX - b.left - b.width / 2); };
  cv.addEventListener('pointerdown', e => { dragging = true; lastA = angle(e); cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
  cv.addEventListener('pointermove', e => { if (!dragging) return; const a = angle(e); let d = a - lastA; if (d > Math.PI) d -= 6.283; if (d < -Math.PI) d += 6.283; spin += d; spinV = clamp(d * .3, -.02, .02) || .0012; lastA = a; });
  const up = () => { dragging = false; cv.style.cursor = ''; setTimeout(() => { spinV = .0012; }, 1500); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  const tabs = $('#tabs'), list = $('#flavors'), tag = $('#pizzaTag');
  const fcName = $('#fcName'), fcDesc = $('#fcDesc');
  const choose = ([name, desc, tops]) => {
    pieces = build(name, tops); startT = performance.now();
    fcName.textContent = name; fcDesc.textContent = desc;
    tag.textContent = name; tag.classList.remove('pop'); void tag.offsetWidth; tag.classList.add('pop');
    $$('button', list).forEach(b => b.setAttribute('aria-pressed', b.textContent === name));
  };
  const showCat = cat => {
    $$('button', tabs).forEach(b => b.setAttribute('aria-selected', b.textContent === cat));
    list.innerHTML = '';
    CAT[cat].forEach(f => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = f[0]; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => choose(f));
      li.appendChild(b); list.appendChild(li);
    });
    choose(CAT[cat][0]);
  };
  Object.keys(CAT).forEach(cat => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = cat;
    b.addEventListener('click', () => showCat(cat));
    tabs.appendChild(b);
  });
  showCat('Famosas');

  /* ---------- ECO: brasa que vira folha ---------- */
  const eco = $('#eco'), ecv = $('#ecoCanvas'), ecx = ecv.getContext('2d');
  let ecoP = 0, ecoVisible = false, EWc, EHc, parts = [];
  const sizeEco = () => {
    EWc = ecv.clientWidth; EHc = ecv.clientHeight;
    ecv.width = EWc * dpr; ecv.height = EHc * dpr; ecx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = Array.from({ length: Math.round(clamp(EWc / 22, 24, 70)) }, () => ({ x: Math.random() * EWc, y: Math.random() * EHc, v: Math.random() * .6 + .2, r: Math.random() * 6 + 3, a: Math.random() * 6.28, s: (Math.random() - .5) * .02 }));
  };
  sizeEco();
  const drawEco = () => {
    if (ecoVisible) {
      ecx.clearRect(0, 0, EWc, EHc);
      const p = ecoP;
      for (const q of parts) {
        // embaixo, brasa que sobe; com o scroll, folha que cai
        q.a += q.s;
        q.y += p < .5 ? -q.v : q.v * .8; q.x += Math.sin(q.a) * .4;
        if (q.y < -20) q.y = EHc + 20; if (q.y > EHc + 20) q.y = -20;
        const leaf = clamp((p - .3) * 2.5);
        ecx.save(); ecx.translate(q.x, q.y); ecx.rotate(q.a);
        ecx.globalAlpha = .55;
        const rr = 255 + (124 - 255) * leaf, gg = 140 + (195 - 140) * leaf, bb = 20 + (91 - 20) * leaf;
        ecx.fillStyle = `rgb(${rr | 0},${gg | 0},${bb | 0})`;
        ecx.beginPath();
        const w = q.r * (.5 + leaf * .9), h = q.r * (.5 + leaf * .35);
        ecx.ellipse(0, 0, w, h, 0, 0, 7); ecx.fill();
        ecx.restore();
      }
      eco.style.background = `rgb(${18 + (14 - 18) * ecoP | 0},${13 + (26 - 13) * ecoP | 0},${12 + (15 - 12) * ecoP | 0})`;
    }
    requestAnimationFrame(drawEco);
  };
  if (!reduce) requestAnimationFrame(drawEco);

  /* ---------- FEED: arrastar ---------- */
  const ft = $('#feedTrack');
  let fx = 0, fs = 0, fdown = false, moved = false;
  ft.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; fdown = true; moved = false; fx = e.clientX; fs = ft.scrollLeft; });
  addEventListener('pointermove', e => { if (!fdown) return; const d = e.clientX - fx; if (Math.abs(d) > 5) { moved = true; ft.classList.add('drag'); } ft.scrollLeft = fs - d; });
  addEventListener('pointerup', () => { fdown = false; ft.classList.remove('drag'); });
  ft.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

  /* ---------- MODELOS DE FRANQUIA ---------- */
  $$('.model').forEach(m => {
    const open = () => $$('.model').forEach(o => o.classList.toggle('is-open', o === m));
    m.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) open(); });
    m.addEventListener('click', open);
  });

  /* ---------- FORM FRANQUIA → WhatsApp ---------- */
  const form = $('#fform'), err = $('#fformErr');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const nome = (d.get('nome') || '').trim(), cidade = (d.get('cidade') || '').trim();
    if (!nome || !cidade) { err.hidden = false; return; }
    err.hidden = true;
    let msg = `Olá! Quero ser um franqueado Patroni.\n\nNome: ${nome}\nCidade: ${cidade}\nModelo de interesse: ${d.get('modelo')}`;
    const extra = (d.get('msg') || '').trim();
    if (extra) msg += `\n\n${extra}`;
    window.open(`https://wa.me/${WA_FRANQUIA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  onScroll();
})();
