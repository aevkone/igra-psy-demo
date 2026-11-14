(() => {
  'use strict';
  const KEY = 'yulia-igra-v1';
  const $ = (s) => document.querySelector(s);
  const DECKS = window.DECKS;

  // ---------- Настройки: язык, цвета, звук ----------
  const PKEY = 'yulia-igra-prefs';
  let P = { lang: 'ru', skin: 'terra', sound: true };
  try { Object.assign(P, JSON.parse(localStorage.getItem(PKEY) || '{}')); } catch (e) {}
  const saveP = () => { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch (e) {} };

  const SKINS = [
    { id: 'terra', ru: 'Терракота', en: 'Terracotta', bg: '#0B0B0A', accent: '#D9714F',
      decks: { razo: '#E7E5E1', otn: '#D9714F', den: '#CFAE6B', real: '#8E9C82', sem: '#9E7A64', telo: '#D8A496', uver: '#A9472A' } },
    { id: 'milk', ru: 'Молоко', en: 'Milk', bg: '#F3F1EE', accent: '#C8603D',
      decks: { razo: '#E2DED8', otn: '#D9714F', den: '#CFAE6B', real: '#8E9C82', sem: '#9E7A64', telo: '#D8A496', uver: '#A9472A' } },
    { id: 'navy', ru: 'Ночь', en: 'Night', bg: '#0A0E14', accent: '#6FA3D9',
      decks: { razo: '#E4E8EE', otn: '#6FA3D9', den: '#D9C27A', real: '#7FB6A8', sem: '#8C93B8', telo: '#C9A3C4', uver: '#3F6FA6' } },
    { id: 'forest', ru: 'Лес', en: 'Forest', bg: '#0A0F0C', accent: '#8FB58A',
      decks: { razo: '#E6E8E0', otn: '#D98F5F', den: '#D3BF73', real: '#8FB58A', sem: '#A68B6A', telo: '#D9B3A0', uver: '#4F7A52' } },
    { id: 'rose', ru: 'Пудра', en: 'Blush', bg: '#F7EDEA', accent: '#C4566A',
      decks: { razo: '#E9DAD5', otn: '#C4566A', den: '#D2A86A', real: '#93A58C', sem: '#A77F78', telo: '#E0A9A6', uver: '#9C3B50' } },
    { id: 'violet', ru: 'Лаванда', en: 'Lavender', bg: '#0E0D13', accent: '#A493E0',
      decks: { razo: '#E7E5EE', otn: '#A493E0', den: '#D6BE7C', real: '#88B3A6', sem: '#9A86A8', telo: '#D7A6C4', uver: '#6F5BB8' } }
  ];
  const skin = () => SKINS.find((s) => s.id === P.skin) || SKINS[0];
  const isDark = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 150;
  };

  const STR = {
    ru: {
      title: 'Игра-знакомство · Юлия Павлова', brand: 'Юлия Павлова', label_game: 'Игра-знакомство',
      h1: 'Кто сегодня играет?', setup_sub: 'Впиши имена в том порядке, в котором будете ходить. Телефон передаётся по кругу.',
      ph_name: 'Имя участницы', add: 'Добавить', remove: 'Убрать', start: 'Начать игру', resume: 'Вернуться к игре',
      rules_title: 'Как играть',
      rules: ['Бросай кубик, фишка пройдёт по полю.', 'Цвет клетки — тема. Откроется карточка с началом фразы.',
        'Продолжи фразу вслух и расскажи, почему, как тебе кажется, она выпала именно тебе.',
        'Отметь, насколько фраза про тебя: «Точно нет», «И да, и нет» или «Точно да».',
        'Передай телефон следующей. В конце Юля увидит итоги.'],
      turn: 'Ходит', tap_dice: 'Нажми на кубик', rolled: 'Выпало', start_cell: 'Старт',
      card_hint: 'Продолжи фразу вслух и расскажи, почему она тебе выпала.',
      no: 'Точно нет', mid: 'И да, и нет', yes: 'Точно да', opt: 'Шкала по желанию', scale_aria: 'Насколько это про тебя',
      note_ph: 'Заметка Юли — по желанию', swap: 'Другая', next: 'Дальше',
      m_summary: 'Итоги игры', m_skip: 'Пропустить ход', m_players: 'Изменить участниц', m_settings: 'Настройки', m_new: 'Начать заново', m_close: 'Закрыть',
      sum_title: 'Итоги игры', copy: 'Скопировать итоги', newgame: 'Новая игра',
      empty: 'Пока ни одной карточки. Итоги появятся после первых ходов.',
      max: 'Не больше 10 участниц', dup: 'Такое имя уже есть', pass: 'Передай телефон: {n}',
      confirm_new: 'Начать новую игру? Итоги этой игры удалятся с телефона. Скопируй их заранее, если нужны.',
      focus: 'Сильнее отозвалось: ', not_played: 'Ещё не ходила', cards_n: '{n} карт.', note: 'Заметка: ',
      sum_head: 'Итоги игры-знакомства, {d}', sum_count: 'Участниц: {p}, карточек: {c}',
      copied: 'Итоги скопированы', copy_fail: 'Не получилось скопировать', nothing: 'Пока нечего копировать',
      set_lang: 'Язык', set_skin: 'Оформление', set_sound: 'Звук', on: 'Включён', off: 'Выключен', ok: 'Готово',
      a_menu: 'Меню', a_back: 'Назад к полю', a_dice: 'Бросить кубик', a_queue: 'Очередь ходов', a_set: 'Настройки',
      short: { razo: 'Разогрев', otn: 'Отношения', den: 'Деньги', real: 'Работа', sem: 'Семья', telo: 'Тело', uver: 'Уверенность' }
    },
    en: {
      title: 'Get-to-know game · Yulia Pavlova', brand: 'Yulia Pavlova', label_game: 'Get-to-know game',
      h1: 'Who’s playing today?', setup_sub: 'Add the names in the order you’ll take turns. The phone is passed around the circle.',
      ph_name: 'Player’s name', add: 'Add', remove: 'Remove', start: 'Start the game', resume: 'Back to the game',
      rules_title: 'How to play',
      rules: ['Roll the dice and your token moves along the board.', 'The colour of the square is the topic. A card opens with the start of a phrase.',
        'Finish the phrase out loud and say why you think it came to you.',
        'Mark how true it is for you: “Definitely not”, “Yes and no” or “Definitely yes”.',
        'Pass the phone to the next player. At the end the host sees the summary.'],
      turn: 'Now playing', tap_dice: 'Tap the dice', rolled: 'Rolled', start_cell: 'Start',
      card_hint: 'Finish the phrase out loud and say why you think it came to you.',
      no: 'Definitely not', mid: 'Yes and no', yes: 'Definitely yes', opt: 'The scale is optional', scale_aria: 'How true is this for you',
      note_ph: 'Host’s note — optional', swap: 'Another', next: 'Next',
      m_summary: 'Game summary', m_skip: 'Skip turn', m_players: 'Edit players', m_settings: 'Settings', m_new: 'Start over', m_close: 'Close',
      sum_title: 'Game summary', copy: 'Copy summary', newgame: 'New game',
      empty: 'No cards yet. The summary will appear after the first turns.',
      max: 'No more than 10 players', dup: 'That name is already taken', pass: 'Pass the phone to {n}',
      confirm_new: 'Start a new game? This game’s summary will be deleted from the phone. Copy it first if you need it.',
      focus: 'Resonated most: ', not_played: 'Hasn’t played yet', cards_n: '{n} cards', note: 'Note: ',
      sum_head: 'Get-to-know game summary, {d}', sum_count: 'Players: {p}, cards: {c}',
      copied: 'Summary copied', copy_fail: 'Couldn’t copy', nothing: 'Nothing to copy yet',
      set_lang: 'Language', set_skin: 'Colours', set_sound: 'Sound', on: 'On', off: 'Off', ok: 'Done',
      a_menu: 'Menu', a_back: 'Back to the board', a_dice: 'Roll the dice', a_queue: 'Turn order', a_set: 'Settings',
      short: { razo: 'Warm-up', otn: 'Relationships', den: 'Money', real: 'Work', sem: 'Family', telo: 'Body', uver: 'Confidence' }
    }
  };
  const L = () => STR[P.lang] || STR.ru;
  const t = (k, vars) => {
    let s = L()[k]; if (s == null) s = STR.ru[k] || k;
    if (vars) for (const v in vars) s = s.replace('{' + v + '}', () => vars[v]);
    return s;
  };
  const short = (th) => L().short[th];
  const deck = (th) => ((P.lang === 'en' && window.DECKS_EN && window.DECKS_EN[th]) || DECKS[th]);
  const entryText = (h) => (h.idx != null && deck(h.theme).cards[h.idx]) || h.text;

  // Цвета колод — в гамме сайта
  let THEME_COLOR = skin().decks;
  const ORDER = ['otn', 'den', 'real', 'sem', 'telo', 'uver', 'razo'];
  const TOKEN_COLORS = ['#F3F1EE', '#F0D59A', '#E9B89A', '#B9C7AE', '#BFB3D6', '#9FC1C9', '#E3A9A0', '#C9C3BA', '#F6E7C8', '#D4E2C6'];

  // Поле: 22 клетки по периметру сетки 6×7, по часовой от левого верхнего угла
  const CELLS = [];
  for (let c = 0; c < 6; c++) CELLS.push([0, c]);
  for (let r = 1; r < 7; r++) CELLS.push([r, 5]);
  for (let c = 4; c >= 0; c--) CELLS.push([6, c]);
  for (let r = 5; r >= 1; r--) CELLS.push([r, 0]);
  const N = CELLS.length;
  const themeOf = (i) => (i === 0 ? 'razo' : ORDER[(i * 3) % 7]);

  // ---------- Telegram ----------
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTg = !!(tg && tg.platform && tg.platform !== 'unknown');
  if (inTg) {
    try {
      tg.ready(); tg.expand();
      tg.setHeaderColor && tg.setHeaderColor('#0B0B0A');
      tg.setBackgroundColor && tg.setBackgroundColor('#0B0B0A');
      tg.disableVerticalSwipes && tg.disableVerticalSwipes();
    } catch (e) { /* старые версии Telegram */ }
  }
  const haptic = (kind) => {
    try {
      if (!inTg || !tg.HapticFeedback) return;
      if (kind === 'select') tg.HapticFeedback.selectionChanged();
      else if (kind === 'ok') tg.HapticFeedback.notificationOccurred('success');
      else tg.HapticFeedback.impactOccurred(kind || 'light');
    } catch (e) {}
  };
  const confirmAsk = (text) => new Promise((res) => {
    if (inTg && tg.showConfirm && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) tg.showConfirm(text, res);
    else res(window.confirm(text));
  });

  // ---------- Движение, звук, частицы ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.16,1,.3,1)';
  // WAAPI: идёт вне основного потока, при «уменьшении движения» не запускается
  const anim = (el, frames, opts) => {
    if (reduced || !el || !el.animate) return null;
    try { return el.animate(frames, Object.assign({ easing: EASE, duration: 300 }, opts)); } catch (e) { return null; }
  };
  const done = (a) => (a && a.finished ? a.finished.catch(() => {}) : Promise.resolve());

  let ac = null;
  function audio() {
    if (P.sound === false) return null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = ac || new AC();
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function tone(freq, dur, vol, when, type) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, vol, freq, when, sweepTo) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const len = Math.max(1, Math.floor(a.sampleRate * dur));
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t); src.stop(t + dur + 0.02);
  }
  const sfx = {
    dice() { let t = 0; for (let i = 0; i < 9; i++) { noise(0.035, 0.16 - i * 0.012, 1500 + Math.random() * 1400, t); t += 0.06 + i * 0.016; } },
    step(i) { tone(440 + i * 46, 0.09, 0.05, 0, 'triangle'); },
    land() { tone(392, 0.28, 0.06); tone(587.3, 0.36, 0.05, 0.08); },
    card() { noise(0.3, 0.05, 500, 0, 2400); },
    pick() { tone(660, 0.07, 0.04); },
    next() { tone(523.3, 0.1, 0.04); tone(784, 0.2, 0.04, 0.09); }
  };

  const fx = $('#fx');
  const fctx = fx.getContext && fx.getContext('2d');
  let parts = [], fxRun = false;
  function fxSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = Math.floor(innerWidth * dpr); fx.height = Math.floor(innerHeight * dpr);
    fctx && fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function burst(x, y, color) {
    if (reduced || !fctx) return;
    if (!fxRun) fxSize();
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, v = 1.6 + Math.random() * 3.6;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.6, r: 1.6 + Math.random() * 2.6, life: 1, k: 0.016 + Math.random() * 0.014, c: Math.random() < 0.25 ? '#F3F1EE' : color });
    }
    if (!fxRun) { fxRun = true; requestAnimationFrame(fxTick); }
  }
  function fxTick() {
    fctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.11; p.vx *= 0.985; p.life -= p.k;
      fctx.globalAlpha = Math.max(0, p.life);
      fctx.fillStyle = p.c;
      fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fctx.fill();
    }
    fctx.globalAlpha = 1;
    if (parts.length) requestAnimationFrame(fxTick); else fxRun = false;
  }

  // Фоновое свечение: два слоя, меняется только прозрачность
  const glows = [$('#glow-a'), $('#glow-b')];
  let glowOn = -1, glowColor = '';
  function setGlow(color) {
    if (color === glowColor) return;
    glowColor = color;
    const next = glowOn === 0 ? 1 : 0;
    glows[next].style.color = color;
    glows[next].classList.add('on');
    if (glowOn >= 0) glows[glowOn].classList.remove('on');
    glowOn = next;
  }

  // ---------- Состояние ----------
  let S = load() || fresh();
  function fresh() {
    return { players: [], pos: {}, turn: 0, decks: {}, history: [], pending: null, started: false, uid: 0 };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); return s && Array.isArray(s.players) ? s : null; }
    catch (e) { return null; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function draw(theme) {
    let d = S.decks[theme];
    if (!d || !d.length) {
      d = DECKS[theme].cards.map((_, i) => i);
      for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    }
    const idx = d.pop();
    S.decks[theme] = d;
    return idx;
  }
  const current = () => S.players[S.turn % S.players.length];

  // ---------- Экраны ----------
  function show(id) {
    for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id;
    window.scrollTo(0, 0);
    anim($('#' + id), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280 });
    if (id !== 's-game') setGlow(skin().accent);
  }

  // ---------- Участницы ----------
  const initial = (name) => (Array.from(String(name || '').trim())[0] || '?').toLocaleUpperCase();
  let lastRm = 0;
  function renderPlayers() {
    const ol = $('#players');
    ol.innerHTML = '';
    S.players.forEach((p, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="num">${i + 1}</span><span class="token-i" style="background:${p.color}"></span><span class="name"></span><button class="rm" aria-label="${t('remove')}">×</button>`;
      li.querySelector('.token-i').textContent = initial(p.name);
      li.querySelector('.name').textContent = p.name;
      li.querySelector('.rm').onclick = () => {
        if (busy || Date.now() - lastRm < 450) return;
        lastRm = Date.now();
        // очередь не должна сдвигаться: ходит та же участница, что и до удаления
        if (i < S.turn) S.turn--;
        S.players.splice(i, 1);
        delete S.pos[p.id];
        if (S.pending && S.pending.pid === p.id) S.pending = null;
        if (S.turn >= S.players.length) S.turn = 0;
        if (!S.players.length) S.started = false;
        save(); renderPlayers();
      };
      ol.appendChild(li);
    });
    $('#btn-start').disabled = S.players.length < 1;
    $('#btn-start').textContent = S.started ? t('resume') : t('start');
  }
  $('#add-form').onsubmit = (e) => {
    e.preventDefault();
    const inp = $('#add-name');
    const name = inp.value.trim().replace(/\s+/g, ' ');
    if (!name) return;
    if (S.players.length >= 10) { toast(t('max')); return; }
    if (S.players.some((p) => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { toast(t('dup')); return; }
    const used = new Set(S.players.map((p) => p.color));
    const color = TOKEN_COLORS.find((c) => !used.has(c)) || TOKEN_COLORS[S.players.length % TOKEN_COLORS.length];
    const id = 'p' + (++S.uid);
    S.players.push({ id, name, color });
    S.pos[id] = 0;
    inp.value = '';
    haptic('select');
    save(); renderPlayers();
    inp.focus();
  };
  $('#btn-start').onclick = () => {
    if (!S.players.length) return;
    S.started = true;
    if (!S.startedAt) S.startedAt = Date.now();
    save();
    audio(); keepAwake();
    openGame(true);
  };

  // ---------- Поле ----------
  const board = $('#board');
  const tokensLayer = document.createElement('div');
  tokensLayer.className = 'tokens';
  CELLS.forEach(([r, c], i) => {
    const el = document.createElement('div');
    el.className = 'cell' + (i === 0 ? ' start' : '');
    el.style.gridArea = `${r + 1}/${c + 1}`;
    el.dataset.i = i;
    el.style.animationDelay = i * 24 + 'ms';
    board.appendChild(el);
  });
  board.appendChild(tokensLayer);
  const cellEl = (i) => board.querySelector(`.cell[data-i="${i}"]`);

  function paintBoard() {
    for (const el of board.querySelectorAll('.cell')) {
      const i = +el.dataset.i, th = themeOf(i);
      el.style.background = THEME_COLOR[th];
      el.textContent = i === 0 ? t('start_cell') : '';
      el.title = deck(th).title;
    }
    $('#legend').innerHTML = ORDER.map((th) => `<li data-t="${th}"><i style="background:${THEME_COLOR[th]}"></i>${short(th)}</li>`).join('');
  }
  paintBoard();
  function pickLegend(theme) {
    const lg = $('#legend');
    lg.classList.toggle('pick', !!theme);
    for (const li of lg.children) li.classList.toggle('on', li.dataset.t === theme);
  }

  // Фишки живут постоянно и двигаются через transform, без пересчёта вёрстки
  const tokenEls = {};
  function renderTokens() {
    const ids = new Set(S.players.map((p) => p.id));
    for (const id of Object.keys(tokenEls)) if (!ids.has(id)) { tokenEls[id].remove(); delete tokenEls[id]; }
    const byCell = {};
    S.players.forEach((p) => { const i = S.pos[p.id] || 0; (byCell[i] = byCell[i] || []).push(p); });
    const me = current();
    Object.entries(byCell).forEach(([i, ps]) => {
      const el = cellEl(i);
      const cx = el.offsetLeft + el.offsetWidth / 2, cy = el.offsetTop + el.offsetHeight / 2;
      ps.forEach((p, k) => {
        const n = ps.length;
        const ang = (k / n) * Math.PI * 2 - Math.PI / 2;
        const rad = n > 1 ? Math.min(el.offsetWidth * (n > 4 ? 0.34 : 0.24), 6 + n * 2) : 0;
        let t = tokenEls[p.id];
        if (!t) {
          t = document.createElement('div');
          t.appendChild(document.createElement('b'));
          tokensLayer.appendChild(t);
          tokenEls[p.id] = t;
        }
        t.className = 'token' + (me && p.id === me.id ? ' me' : '') + (n > 4 ? ' sm' : '');
        t.firstChild.style.background = p.color;
        t.firstChild.textContent = initial(p.name);
        t.style.transform = `translate(${(cx + Math.cos(ang) * rad).toFixed(1)}px,${(cy + Math.sin(ang) * rad).toFixed(1)}px)`;
      });
    });
  }
  function hop(id) {
    const t = tokenEls[id];
    if (!t) return;
    anim(t.firstChild, [
      { transform: 'translateY(0) scale(1.18)', easing: 'cubic-bezier(.2,.8,.4,1)' },
      { transform: 'translateY(-11px) scale(1.36)', easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: 'translateY(0) scale(1.18)' }
    ], { duration: 260, easing: 'linear' });
  }
  function ripple(el, color) {
    if (reduced) return;
    const r = document.createElement('i');
    r.className = 'ripple';
    r.style.width = el.offsetWidth + 'px'; r.style.height = el.offsetHeight + 'px';
    r.style.boxShadow = `0 0 0 2px ${color}`;
    const base = `translate(${el.offsetLeft}px,${el.offsetTop}px)`;
    tokensLayer.appendChild(r);
    const a = anim(r, [{ transform: base + ' scale(1)', opacity: 0.9 }, { transform: base + ' scale(2.3)', opacity: 0 }], { duration: 620 });
    done(a).then(() => r.remove());
  }

  function renderQueue() {
    const q = $('#queue');
    q.innerHTML = '';
    const me = current();
    S.players.forEach((p) => {
      const b = document.createElement('span');
      b.className = 'q' + (me && p.id === me.id ? ' on' : '');
      b.innerHTML = `<span class="token-i" style="background:${p.color}"></span><span></span>`;
      b.firstChild.textContent = initial(p.name);
      b.lastChild.textContent = p.name;
      q.appendChild(b);
    });
    const on = q.querySelector('.on');
    on && on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }

  let lastTurnId = null;
  function setHint(html, pop) {
    const h = $('#dice-hint');
    h.innerHTML = html;
    h.classList.remove('pop');
    if (pop) { void h.offsetWidth; h.classList.add('pop'); }
  }
  function renderTurn() {
    const me = current();
    const tn = $('#turn-name');
    tn.textContent = me ? me.name : '';
    if (me && me.id !== lastTurnId) anim(tn, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 340 });
    lastTurnId = me ? me.id : null;
    $('#turn-label').textContent = t('turn');
    setHint(t('tap_dice'));
    $('#dice-btn').classList.add('wait');
    pickLegend(null);
    renderQueue(); renderTokens();
    if (me) setGlow(THEME_COLOR[themeOf(S.pos[me.id] || 0)]);
  }

  function openGame(intro) {
    show('s-game');
    if (intro && !reduced) {
      board.classList.add('intro');
      setTimeout(() => board.classList.remove('intro'), 1200);
    }
    renderTurn();
    if (S.pending) openCard(true);
  }

  // ---------- Кубик ----------
  const FACE = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
  let spin = 0, busy = false;
  const cube = $('#cube');

  async function roll() {
    if (busy || S.pending || !S.players.length) return;
    busy = true;
    const scene = $('#dice-btn');
    try { await rollInner(scene); }
    finally { scene.classList.remove('busy', 'roll'); board.classList.remove('focus'); busy = false; }
  }
  async function rollInner(scene) {
    scene.classList.remove('wait'); scene.classList.add('busy');
    setHint('');
    haptic('medium');
    sfx.dice();
    const v = 1 + Math.floor(Math.random() * 6);
    spin += 2 + (v % 2);
    const [rx, ry] = FACE[v];
    cube.style.transform = `rotateX(-18deg) rotateY(18deg) rotateX(${rx + spin * 360}deg) rotateY(${ry + spin * 360}deg)`;
    if (!reduced) { scene.classList.remove('roll'); void scene.offsetWidth; scene.classList.add('roll'); }
    await sleep(reduced ? 350 : 1150);
    scene.classList.remove('roll');
    haptic('light');
    setHint(`${t('rolled')} <b>${v}</b>`, true);

    const me = current();
    let p = S.pos[me.id] || 0;
    for (let s = 0; s < v; s++) {
      p = (p + 1) % N;
      S.pos[me.id] = p;
      renderTokens();
      hop(me.id);
      anim(cellEl(p), [{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }, { transform: 'scale(1)' }], { duration: 260 });
      sfx.step(s);
      haptic('select');
      await sleep(reduced ? 30 : 280);
    }
    const theme = themeOf(p);
    const land = cellEl(p);
    land.classList.add('land');
    board.classList.add('focus');
    pickLegend(theme);
    setGlow(THEME_COLOR[theme]);
    setHint(`${t('rolled')} <b>${v}</b> · ${short(theme)}`, true);
    ripple(land, THEME_COLOR[theme]);
    const lr = land.getBoundingClientRect();
    burst(lr.left + lr.width / 2, lr.top + lr.height / 2, THEME_COLOR[theme]);
    sfx.land();
    haptic('medium');
    await sleep(reduced ? 500 : 620);

    S.pending = { pid: me.id, theme, idx: draw(theme), answer: null, note: '' };
    save();
    await openCard(false, land);
    land.classList.remove('land');
  }
  $('#dice-btn').onclick = roll;
  $('#dice-btn').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); roll(); } };

  // ---------- Карточка ----------
  const flip = $('#card-flip');
  function fillCard() {
    const pd = S.pending;
    const me = S.players.find((x) => x.id === pd.pid);
    const chip = $('#card-theme');
    const dark = isDark(THEME_COLOR[pd.theme]);
    chip.textContent = deck(pd.theme).title;
    chip.style.background = THEME_COLOR[pd.theme];
    chip.style.color = dark ? '#fff' : '#121211';
    if (pd.theme === 'razo') chip.style.boxShadow = 'inset 0 0 0 1px rgba(18,18,17,.18)'; else chip.style.boxShadow = '';
    $('#card-who').textContent = me ? me.name : '';
    $('#card-note').value = pd.note || '';
    $('#scale-opt').hidden = pd.theme !== 'razo';
    // рубашка карточки — в цвете колоды
    const back = flip.querySelector('.back');
    back.style.background = THEME_COLOR[pd.theme];
    back.style.color = dark ? '#fff' : '#121211';
    back.querySelector('.dot').style.background = dark ? '#fff' : '#121211';
    syncScale();
  }
  function fillPhrase(animate, base) {
    const el = $('#card-phrase');
    const text = deck(S.pending.theme).cards[S.pending.idx];
    el.textContent = '';
    if (!animate || reduced) { el.textContent = text; return; }
    text.split(' ').forEach((w, i) => {
      if (i) el.appendChild(document.createTextNode(' '));
      const s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      s.style.animationDelay = (base + i * 38) + 'ms';
      el.appendChild(s);
    });
  }
  function syncScale() {
    const pd = S.pending;
    for (const b of $('#scale').querySelectorAll('button')) b.setAttribute('aria-checked', String(b.dataset.v === pd.answer));
    $('#thumb').dataset.v = pd.answer || '';
    updateDone();
  }
  function updateDone() {
    const pd = S.pending;
    $('#btn-done').disabled = !(pd && (pd.answer || pd.theme === 'razo'));
  }
  async function openCard(instant, fromEl) {
    const layer = $('#card-layer');
    fillCard();
    flip.classList.remove('open', 'fresh');
    layer.hidden = false;
    if (instant || reduced) { fillPhrase(false); flip.classList.add('open'); return; }
    fillPhrase(true, 560);
    // карточка вылетает из клетки, на которую встала фишка
    if (fromEl) {
      const c = fromEl.getBoundingClientRect(), f = flip.getBoundingClientRect();
      const dx = c.left + c.width / 2 - (f.left + f.width / 2), dy = c.top + c.height / 2 - (f.top + f.height / 2);
      const sc = Math.max(0.08, c.width / f.width);
      anim(flip, [
        { transform: `translate(${dx}px,${dy}px) scale(${sc}) rotate(-10deg)`, opacity: 0.5 },
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 }
      ], { duration: 520 });
    }
    sfx.card();
    await sleep(300);
    flip.classList.add('open', 'fresh');
    haptic('ok');
  }
  $('#scale').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b || !S.pending) return;
    S.pending.answer = S.pending.answer === b.dataset.v && S.pending.theme === 'razo' ? null : b.dataset.v;
    haptic('select');
    sfx.pick();
    save(); syncScale();
  };
  $('#card-note').oninput = (e) => { if (S.pending) { S.pending.note = e.target.value; save(); } };
  $('#btn-swap').onclick = () => {
    if (!S.pending || closing || swapping) return;
    swapping = true;
    S.pending.idx = draw(S.pending.theme);
    S.pending.answer = null;
    S.pending.note = '';
    save();
    flip.classList.remove('open');
    sfx.card();
    setTimeout(() => { swapping = false; if (!S.pending) return; fillCard(); fillPhrase(true, 260); flip.classList.add('open'); }, reduced ? 0 : 420);
  };
  let closing = false, swapping = false;
  $('#btn-done').onclick = async () => {
    const pd = S.pending;
    if (!pd || closing || swapping) return;
    closing = true;
    const me = S.players.find((x) => x.id === pd.pid);
    S.history.push({
      pid: pd.pid, name: me ? me.name : '', theme: pd.theme,
      text: deck(pd.theme).cards[pd.idx], idx: pd.idx, answer: pd.answer, note: (pd.note || '').trim(), t: Date.now()
    });
    S.pending = null;
    S.turn = (S.turn + 1) % S.players.length;
    save();
    sfx.next();
    const layer = $('#card-layer');
    const a = anim(flip, [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(28px) scale(.95)', opacity: 0 }], { duration: 200, fill: 'forwards' });
    const b = anim(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease', fill: 'forwards' });
    await Promise.all([done(a), done(b)]);
    layer.hidden = true;
    flip.classList.remove('open', 'fresh');
    a && a.cancel(); b && b.cancel();
    closing = false;
    nextTurn(true);
  };
  function nextTurn(advanced) {
    if (!S.players.length) return;
    if (!advanced) S.turn = (S.turn + 1) % S.players.length;
    save(); renderTurn();
    const me = current();
    if (S.players.length > 1) toast(t('pass', { n: me.name }));
  }

  // ---------- Меню ----------
  let layerAt = 0;
  $('#btn-menu').onclick = () => { if (busy) return; layerAt = Date.now(); $('#menu-layer').hidden = false; };
  $('#menu-layer').onclick = async (e) => {
    const act = e.target.closest('[data-act]');
    if (!act && e.target !== e.currentTarget) return;
    if (Date.now() - layerAt < 350) return;
    $('#menu-layer').hidden = true;
    const a = act ? act.dataset.act : 'close';
    if (a === 'summary') openSummary();
    else if (a === 'skip') { if (!busy) nextTurn(); }
    else if (a === 'players') { show('s-setup'); renderPlayers(); }
    else if (a === 'settings') openSettings();
    else if (a === 'new') newGame();
  };

  async function newGame() {
    if (S.history.length && !(await confirmAsk(t('confirm_new')))) return;
    const keepPlayers = S.players;
    S = fresh();
    S.uid = keepPlayers.reduce((m, p) => Math.max(m, +String(p.id).slice(1) || 0), 0);
    S.players = keepPlayers;
    keepPlayers.forEach((p) => { S.pos[p.id] = 0; });
    save();
    $('#card-layer').hidden = true;
    show('s-setup'); renderPlayers();
  }

  // ---------- Итоги ----------
  function grouped() {
    return S.players.map((p) => ({ p, items: S.history.filter((h) => h.pid === p.id) }))
      .concat(orphanGroups());
  }
  function orphanGroups() {
    const ids = new Set(S.players.map((p) => p.id));
    const map = {};
    S.history.filter((h) => !ids.has(h.pid)).forEach((h) => { (map[h.pid] = map[h.pid] || { p: { name: h.name, color: '#6F6A63' }, items: [] }).items.push(h); });
    return Object.values(map);
  }
  function focusThemes(items) {
    const c = {};
    items.filter((h) => h.answer === 'yes' && h.theme !== 'razo').forEach((h) => { c[h.theme] = (c[h.theme] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([th]) => deck(th).title);
  }
  function cardsN(n) {
    if (P.lang === 'en') return n === 1 ? '1 card' : n + ' cards';
    const a = n % 10, b = n % 100;
    return n + ' ' + (a === 1 && b !== 11 ? 'карточка' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'карточки' : 'карточек');
  }
  function openSummary() {
    show('s-summary');
    const box = $('#summary');
    box.innerHTML = '';
    if (!S.history.length) { box.innerHTML = '<p class="empty"></p>'; box.firstChild.textContent = t('empty'); return; }
    grouped().forEach(({ p, items }, gi) => {
      const d = document.createElement('div');
      d.className = 'person';
      d.style.animationDelay = Math.min(gi, 8) * 55 + 'ms';
      d.innerHTML = `<div class="person-head"><span class="token-i" style="background:${p.color}"></span><span class="name"></span><span class="cnt">${cardsN(items.length)}</span></div>`;
      d.querySelector('.token-i').textContent = initial(p.name);
      d.querySelector('.name').textContent = p.name;
      const f = focusThemes(items);
      if (f.length) {
        const fp = document.createElement('p'); fp.className = 'focus';
        fp.textContent = t('focus'); const fb = document.createElement('b'); fb.textContent = f.join(', '); fp.appendChild(fb);
        d.appendChild(fp);
      }
      if (!items.length) { const e = document.createElement('p'); e.className = 'focus'; e.textContent = t('not_played'); d.appendChild(e); }
      items.forEach((h) => {
        const e = document.createElement('div');
        e.className = 'entry';
        e.innerHTML = `<div class="entry-top"><i style="background:${THEME_COLOR[h.theme]}"></i><span></span>${h.answer ? `<span class="badge ${h.answer}">${t(h.answer)}</span>` : ''}</div><p></p>`;
        e.querySelector('.entry-top span').textContent = deck(h.theme).title;
        e.querySelector('p').textContent = entryText(h);
        if (h.note) { const n = document.createElement('p'); n.className = 'note'; n.textContent = t('note') + h.note; e.appendChild(n); }
        d.appendChild(e);
      });
      box.appendChild(d);
    });
  }
  function summaryText() {
    const date = new Date(S.startedAt || Date.now()).toLocaleDateString(P.lang === 'en' ? 'en-GB' : 'ru-RU');
    const lines = [t('sum_head', { d: date }), t('sum_count', { p: S.players.length, c: S.history.length }), ''];
    grouped().forEach(({ p, items }) => {
      if (!items.length) return;
      lines.push(`— ${p.name}`);
      const f = focusThemes(items);
      if (f.length) lines.push(t('focus') + f.join(', '));
      items.forEach((h) => {
        lines.push(`• ${deck(h.theme).title}: «${entryText(h)}»${h.answer ? ' — ' + t(h.answer) : ''}`);
        if (h.note) lines.push('  ' + t('note') + h.note);
      });
      lines.push('');
    });
    return lines.join('\n').trim();
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove();
    return ok;
  }
  $('#btn-copy').onclick = async () => {
    if (!S.history.length) { toast(t('nothing')); return; }
    const ok = await copy(summaryText());
    haptic(ok ? 'ok' : 'heavy');
    toast(ok ? t('copied') : t('copy_fail'));
  };
  $('#btn-back').onclick = () => openGame();
  $('#btn-new').onclick = () => newGame();

  // ---------- Тост ----------
  let tt;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200);
  }

  window.addEventListener('resize', () => { if (!$('#s-game').hidden) renderTokens(); });

  // ---------- Настройки ----------
  const TEXTS = [
    ['#brand', 'brand'], ['#s-setup .label', 'label_game'], ['#s-setup h1', 'h1'], ['#s-setup .setup > .muted', 'setup_sub'],
    ['.rules summary', 'rules_title'], ['.card-hint', 'card_hint'], ['#scale-opt', 'opt'],
    ['#scale [data-v=no]', 'no'], ['#scale [data-v=mid]', 'mid'], ['#scale [data-v=yes]', 'yes'],
    ['#btn-swap', 'swap'], ['#btn-done', 'next'],
    ['[data-act=summary]', 'm_summary'], ['[data-act=skip]', 'm_skip'], ['[data-act=players]', 'm_players'],
    ['[data-act=settings]', 'm_settings'], ['[data-act=new]', 'm_new'], ['[data-act=close]', 'm_close'],
    ['.top-title', 'sum_title'], ['#btn-copy', 'copy'], ['#btn-new', 'newgame'],
    ['#set-lang-l', 'set_lang'], ['#set-skin-l', 'set_skin'], ['#set-sound-l', 'set_sound'],
    ['#sound-seg [data-s="1"]', 'on'], ['#sound-seg [data-s="0"]', 'off'], ['#set-done', 'ok']
  ];
  const ARIA = [['#add-form button', 'add'], ['#btn-menu', 'a_menu'], ['#btn-back', 'a_back'], ['#dice-btn', 'a_dice'], ['#queue', 'a_queue'], ['#btn-set', 'a_set'], ['#scale', 'scale_aria']];
  function applyLang() {
    document.documentElement.lang = P.lang;
    document.title = t('title');
    for (const [sel, k] of TEXTS) { const el = $(sel); if (el) el.textContent = t(k); }
    for (const [sel, k] of ARIA) { const el = $(sel); if (el) el.setAttribute('aria-label', t(k)); }
    $('#add-name').placeholder = t('ph_name');
    $('#card-note').placeholder = t('note_ph');
    document.querySelectorAll('.rules li').forEach((li, i) => { li.textContent = L().rules[i] || ''; });
    paintBoard();
    renderPlayers();
    renderSkins();
    for (const b of $('#lang-seg').children) b.setAttribute('aria-pressed', String(b.dataset.lang === P.lang));
    for (const b of $('#sound-seg').children) b.setAttribute('aria-pressed', String((b.dataset.s === '1') === (P.sound !== false)));
    if (!$('#s-game').hidden && !busy) { $('#turn-label').textContent = t('turn'); if (!S.pending) setHint(t('tap_dice')); }
    if (S.pending && !$('#card-layer').hidden) { fillCard(); fillPhrase(false); }
    if (!$('#s-summary').hidden) openSummary();
  }
  function renderSkins() {
    const box = $('#skins');
    box.innerHTML = '';
    SKINS.forEach((sk) => {
      const b = document.createElement('button');
      b.className = 'skin'; b.dataset.skin = sk.id;
      b.setAttribute('aria-pressed', String(sk.id === skin().id));
      b.innerHTML = `<i style="background:${sk.bg}"><b style="background:${sk.accent}"></b></i><span></span>`;
      b.lastChild.textContent = sk[P.lang] || sk.ru;
      box.appendChild(b);
    });
  }
  function applySkin() {
    const sk = skin();
    document.documentElement.dataset.skin = sk.id;
    THEME_COLOR = sk.decks;
    const meta = document.querySelector('meta[name=theme-color]');
    meta && meta.setAttribute('content', sk.bg);
    if (inTg) { try { tg.setHeaderColor && tg.setHeaderColor(sk.bg); tg.setBackgroundColor && tg.setBackgroundColor(sk.bg); } catch (e) {} }
    paintBoard();
    renderSkins();
    const me = S.players.length ? current() : null;
    glowColor = '';
    setGlow(!$('#s-game').hidden && me ? THEME_COLOR[themeOf(S.pos[me.id] || 0)] : sk.accent);
    if (S.pending && !$('#card-layer').hidden) fillCard();
    if (!$('#s-summary').hidden) openSummary();
  }
  function openSettings() { layerAt = Date.now(); $('#set-layer').hidden = false; }
  $('#btn-set').onclick = openSettings;
  $('#set-layer').onclick = (e) => {
    const lang = e.target.closest('[data-lang]'), sk = e.target.closest('.skin'), snd = e.target.closest('[data-s]');
    if (lang) { P.lang = lang.dataset.lang; saveP(); applyLang(); haptic('select'); }
    else if (sk) { P.skin = sk.dataset.skin; saveP(); applySkin(); haptic('select'); }
    else if (snd) { P.sound = snd.dataset.s === '1'; saveP(); applyLang(); if (P.sound) sfx.pick(); }
    else if ((e.target === e.currentTarget && Date.now() - layerAt > 350) || e.target.closest('#set-done')) $('#set-layer').hidden = true;
  };

  // ---------- Старт ----------
  // Экран не гаснет, пока идёт игра
  let wake = null;
  async function keepAwake() {
    try { if (navigator.wakeLock && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) {}
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.started) keepAwake(); });

  applySkin();
  applyLang();
  if (S.started && S.players.length) { openGame(false); keepAwake(); }
})();
