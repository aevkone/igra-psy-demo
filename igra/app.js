(() => {
  'use strict';
  const KEY = 'yulia-igra-v1';
  const PKEY = 'yulia-igra-prefs';
  const $ = (s) => document.querySelector(s);
  const DECKS = window.DECKS;

  // Имя ведущей по умолчанию. Копия игры для другой ведущей меняет только эту строку.
  const DEFAULT_HOST = { ru: 'Юлия Павлова', en: 'Yulia Pavlova' };

  const ORDER = ['otn', 'den', 'real', 'sem', 'telo', 'uver', 'razo'];
  const TOPICS = ORDER.slice(0, 6);

  // ---------- Настройки: язык, цвета, звук, встреча ----------
  let P = { skin: 'terra', sound: true, fast: false, decks: TOPICS.slice(), warm: true, rounds: 3, host: null, code: '', codeAsked: false };
  let langChosen = false;
  try {
    const sp = JSON.parse(localStorage.getItem(PKEY) || '{}');
    Object.assign(P, sp);
    langChosen = sp.lang === 'ru' || sp.lang === 'en';
  } catch (e) {}
  if (!Array.isArray(P.decks)) P.decks = TOPICS.slice();
  P.decks = P.decks.filter((d) => TOPICS.includes(d));
  if (!P.decks.length) P.decks = TOPICS.slice();
  if (![0, 1, 2, 3].includes(P.rounds)) P.rounds = 3;
  if (!langChosen) {
    const q = new URLSearchParams(location.search).get('lang');
    const ls = navigator.languages || [navigator.language || 'en'];
    P.lang = q === 'ru' || q === 'en' ? q : (ls.some((l) => String(l).toLowerCase().startsWith('ru')) ? 'ru' : 'en');
  }
  const saveP = () => {
    try {
      const out = Object.assign({}, P);
      if (!langChosen) delete out.lang;
      localStorage.setItem(PKEY, JSON.stringify(out));
    } catch (e) {}
  };

  const SKINS = [
    { id: 'terra', ru: 'Терракота', en: 'Terracotta', bg: '#0B0B0A', accent: '#D9714F',
      decks: { razo: '#E7E5E1', otn: '#D9714F', den: '#CFAE6B', real: '#8E9C82', sem: '#9E7A64', telo: '#D8A496', uver: '#A9472A' } },
    { id: 'milk', ru: 'Молоко', en: 'Milk', bg: '#F3F1EE', accent: '#B04E2D',
      decks: { razo: '#E2DED8', otn: '#D9714F', den: '#CFAE6B', real: '#8E9C82', sem: '#9E7A64', telo: '#D8A496', uver: '#A9472A' } },
    { id: 'navy', ru: 'Ночь', en: 'Night', bg: '#0A0E14', accent: '#6FA3D9',
      decks: { razo: '#E4E8EE', otn: '#6FA3D9', den: '#D9C27A', real: '#7FB6A8', sem: '#8C93B8', telo: '#C9A3C4', uver: '#3F6FA6' } },
    { id: 'forest', ru: 'Лес', en: 'Forest', bg: '#0A0F0C', accent: '#8FB58A',
      decks: { razo: '#E6E8E0', otn: '#D98F5F', den: '#D3BF73', real: '#8FB58A', sem: '#A68B6A', telo: '#D9B3A0', uver: '#4F7A52' } },
    { id: 'rose', ru: 'Пудра', en: 'Blush', bg: '#F7EDEA', accent: '#B04458',
      decks: { razo: '#E9DAD5', otn: '#B04458', den: '#D2A86A', real: '#93A58C', sem: '#A77F78', telo: '#E0A9A6', uver: '#9C3B50' } },
    { id: 'violet', ru: 'Лаванда', en: 'Lavender', bg: '#0E0D13', accent: '#A493E0',
      decks: { razo: '#E7E5EE', otn: '#A493E0', den: '#D6BE7C', real: '#88B3A6', sem: '#9A86A8', telo: '#D7A6C4', uver: '#6F5BB8' } }
  ];
  const skin = () => SKINS.find((s) => s.id === P.skin) || SKINS[0];
  let THEME_COLOR = skin().decks;

  // Цвет текста на цветной плашке: тот из двух, у которого контраст выше (WCAG)
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  };
  const ink = (hex) => {
    const l = lum(hex);
    return (l + 0.05) / (lum('#121211') + 0.05) >= 1.05 / (l + 0.05) ? '#121211' : '#FFFFFF';
  };

  const STR = {
    ru: {
      label_game: 'Игра-знакомство',
      h1: 'Кто сегодня играет?', setup_sub: 'Впиши имена в том порядке, в котором будете ходить. Телефон передаётся по кругу.',
      privacy: 'Ответы хранятся только на этом телефоне и никуда не отправляются.',
      ph_name: 'Имя участницы', add: 'Добавить', remove: 'Убрать', start: 'Начать игру', resume: 'Вернуться к игре',
      rules_title: 'Как играть',
      rules: ['Бросай кубик, фишка пройдёт по полю.', 'Цвет клетки — тема. Откроется карточка с началом фразы.',
        'Продолжи фразу вслух. Говори столько, сколько хочешь.',
        'Если хочешь, отметь, насколько эта тема сейчас про тебя. От любой карточки можно отказаться кнопкой «Пас».',
        'Передай телефон следующей. Итоги видит только ведущая.'],
      sess_title: 'Настройки встречи', l_host: 'Имя ведущей (подпись в игре)', l_topics: 'Темы сегодня',
      l_warm: 'Первый круг — только разогрев', l_rounds: 'Кругов до финала', l_code: 'Код ведущей (4 цифры)',
      one_topic: 'Нужна хотя бы одна тема',
      turn: 'Ходит', round_of: 'круг {a} из {b}', round_n: 'круг {a}',
      tap_dice: 'Нажми на кубик', rolled: 'Выпало', start_cell: 'Старт', first_round: ', первый круг',
      sp_all: 'Вопрос всем', sp_pick: 'Выбор темы', cell_all: 'ВСЕМ', cell_pick: 'ВЫБОР',
      starts: 'начинает {n}', all_hint: 'Каждая по кругу продолжает фразу, коротко. Можно сказать «пас».',
      pick_title: '{n}, выбери тему',
      card_hint: 'Продолжи фразу вслух. Говори столько, сколько хочешь.',
      scale_q: 'Насколько эта тема сейчас про тебя?', opt: 'по желанию',
      no: 'Точно нет', mid: 'И да, и нет', yes: 'Точно да',
      swap: 'Другая', next: 'Дальше', pass_btn: 'Пас — не сегодня',
      m_summary: 'Итоги — для ведущей', m_finish: 'Завершить игру', m_skip: 'Пропустить ход', m_players: 'Изменить участниц',
      m_settings: 'Настройки', m_new: 'Новая игра', m_close: 'Закрыть',
      sum_title: 'Итоги игры', copy: 'Скопировать итоги', newgame: 'Новая игра', erase: 'Стереть всё с телефона',
      erase_confirm: 'Стереть всё с телефона: игру, имена, заметки и код? Вернуть будет нельзя.',
      empty: 'Пока ни одной карточки. Итоги появятся после первых ходов.',
      max: 'Не больше 10 участниц', pass: 'Передай телефон: {n}',
      confirm_new: 'Начать новую игру? Итоги этой игры удалятся с телефона. Скопируй их заранее, если нужны.',
      focus: 'Чаще всего «Точно да»: ', not_played: 'Ещё не ходила', note: 'Заметка: ', add_note: '+ Заметка',
      note_ph: 'Заметка ведущей', pass_row: 'Пас', all_tag: 'всем', mark: 'отметка',
      sum_head: 'Итоги игры-знакомства, {d}', sum_count: 'Участниц: {p}, карточек: {c}',
      copied: 'Итоги скопированы', copy_fail: 'Не получилось скопировать', nothing: 'Пока нечего копировать',
      fin_label: 'Финал', fin_title: 'Игра завершена', fin_lead: 'Последний круг без кубика. Каждая заканчивает фразу:',
      fin_phrase: '«Сегодня я уношу с собой…»', fin_count: 'Карточек: {c} · тем: {t}', fin_more: 'Ещё один круг',
      code_set_title: 'Закрыть итоги кодом?', code_set_text: 'Итоги и заметки видит только ведущая. Придумай код из 4 цифр: без него итоги не откроются.',
      code_save: 'Сохранить код', code_skip: 'Играть без кода', code_title: 'Код ведущей', code_text: 'Итоги открываются только по коду ведущей.',
      code_open: 'Открыть итоги', code_forgot: 'Забыла код', code_wrong: 'Код не подошёл', code_4: 'Нужны 4 цифры',
      forgot_confirm: 'Сбросить код можно только вместе с итогами этой игры. Стереть итоги и код?',
      set_skin: 'Оформление', set_sound: 'Звук', on: 'Включён', off: 'Выключен', set_anim: 'Анимация', full: 'Полная', quick: 'Быстрая', ok: 'Готово',
      a_menu: 'Меню', a_back: 'Назад', a_dice: 'Бросить кубик', a_queue: 'Очередь ходов', a_set: 'Настройки', a_lang: 'Switch to English',
      short: { razo: 'Разогрев', otn: 'Отношения', den: 'Деньги', real: 'Работа', sem: 'Семья', telo: 'Тело', uver: 'Уверенность' },
      abbr: { razo: 'РАЗ', otn: 'ОТН', den: 'ДЕН', real: 'РАБ', sem: 'СЕМ', telo: 'ТЕЛ', uver: 'УВЕ' }
    },
    en: {
      label_game: 'Getting to Know You',
      h1: 'Who’s playing today?', setup_sub: 'Add names in the order you’ll play. You’ll pass one phone around.',
      privacy: 'Answers stay on this phone only and are not sent anywhere.',
      ph_name: 'Player’s name', add: 'Add', remove: 'Remove', start: 'Start game', resume: 'Resume game',
      rules_title: 'How to play',
      rules: ['Roll the dice and your token moves around the board.', 'Each square’s colour is a topic. A card opens with the start of a sentence.',
        'Finish the sentence out loud. Share as much or as little as you like.',
        'If you like, mark how much the topic is about you right now. You can pass on any card.',
        'Pass the phone to the next player. Only the host sees the summary.'],
      sess_title: 'Session settings', l_host: 'Host’s name (shown in the game)', l_topics: 'Topics today',
      l_warm: 'First round is warm-up only', l_rounds: 'Rounds before the finale', l_code: 'Host code (4 digits)',
      one_topic: 'Keep at least one topic on',
      turn: 'Turn', round_of: 'round {a} of {b}', round_n: 'round {a}',
      tap_dice: 'Tap the dice', rolled: 'Rolled', start_cell: 'Start', first_round: ', first round',
      sp_all: 'Everyone answers', sp_pick: 'Your choice', cell_all: 'ALL', cell_pick: 'PICK',
      starts: '{n} starts', all_hint: 'Go round the circle: everyone finishes the sentence in a line or two. Anyone can say ‘pass’.',
      pick_title: '{n}, choose a topic',
      card_hint: 'Finish the sentence out loud. Share as much or as little as you like.',
      scale_q: 'How much is this topic about you right now?', opt: 'optional',
      no: 'Not at all', mid: 'Somewhat', yes: 'Very much',
      swap: 'Another card', next: 'Next', pass_btn: 'Pass — not today',
      m_summary: 'Summary — host only', m_finish: 'Finish the game', m_skip: 'Skip turn', m_players: 'Edit players',
      m_settings: 'Settings', m_new: 'New game', m_close: 'Close',
      sum_title: 'Game summary', copy: 'Copy summary', newgame: 'New game', erase: 'Erase everything from this phone',
      erase_confirm: 'Erase everything from this phone: the game, names, notes and code? This can’t be undone.',
      empty: 'No cards yet. The summary will appear after the first turns.',
      max: 'Up to 10 players', pass: 'Pass the phone to {n}',
      confirm_new: 'Start a new game? This game’s summary will be deleted from the phone. Copy it first if you need it.',
      focus: 'Most ‘Very much’ marks: ', not_played: 'Hasn’t played yet', note: 'Note: ', add_note: '+ Note',
      note_ph: 'Host’s note', pass_row: 'Pass', all_tag: 'everyone', mark: 'mark',
      sum_head: 'Getting to Know You — summary, {d}', sum_count: 'Players: {p}, cards: {c}',
      copied: 'Summary copied', copy_fail: 'Couldn’t copy', nothing: 'Nothing to copy yet',
      fin_label: 'Finale', fin_title: 'That’s the game', fin_lead: 'One last round without the dice. Everyone finishes the sentence:',
      fin_phrase: '‘Today I’m taking with me…’', fin_count: 'Cards: {c} · topics: {t}', fin_more: 'One more round',
      code_set_title: 'Lock the summary with a code?', code_set_text: 'Only the host sees the summary and notes. Choose a 4-digit code: the summary won’t open without it.',
      code_save: 'Save code', code_skip: 'Play without a code', code_title: 'Host code', code_text: 'The summary opens with the host code only.',
      code_open: 'Open summary', code_forgot: 'Forgot the code', code_wrong: 'Wrong code', code_4: 'Enter 4 digits',
      forgot_confirm: 'The code can only be reset together with this game’s summary. Erase the summary and the code?',
      set_skin: 'Theme', set_sound: 'Sound', on: 'On', off: 'Off', set_anim: 'Animation', full: 'Full', quick: 'Quick', ok: 'Done',
      a_menu: 'Menu', a_back: 'Back', a_dice: 'Roll the dice', a_queue: 'Turn order', a_set: 'Settings', a_lang: 'Переключить на русский',
      short: { razo: 'Warm-up', otn: 'Relationships', den: 'Money', real: 'Work', sem: 'Family', telo: 'Body', uver: 'Confidence' },
      abbr: { razo: 'WRM', otn: 'REL', den: 'MON', real: 'WRK', sem: 'FAM', telo: 'BOD', uver: 'CNF' }
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
  const hostName = () => (P.host == null ? DEFAULT_HOST[P.lang] || DEFAULT_HOST.ru : P.host);
  const hostIsDefault = () => P.host == null || P.host === DEFAULT_HOST.ru || P.host === DEFAULT_HOST.en;

  const TOKEN_COLORS = ['#F3F1EE', '#F0D59A', '#E9B89A', '#B9C7AE', '#BFB3D6', '#9FC1C9', '#E3A9A0', '#C9C3BA', '#F6E7C8', '#D4E2C6'];

  // Поле: 22 клетки по периметру сетки 6×7, по часовой от левого верхнего угла
  const CELLS = [];
  for (let c = 0; c < 6; c++) CELLS.push([0, c]);
  for (let r = 1; r < 7; r++) CELLS.push([r, 5]);
  for (let c = 4; c >= 0; c--) CELLS.push([6, c]);
  for (let r = 5; r >= 1; r--) CELLS.push([r, 0]);
  const N = CELLS.length;
  // Особые клетки на углах: «Вопрос всем» и «Выбор темы»
  const SPECIAL = { 5: 'all', 11: 'pick', 16: 'all' };
  const activeDecks = () => TOPICS.filter((d) => P.decks.includes(d)).concat('razo');
  const themeOf = (i) => {
    if (i === 0 || SPECIAL[i]) return 'razo';
    const act = activeDecks();
    return act[(i - 1) % act.length];
  };

  // ---------- Telegram ----------
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTg = !!(tg && tg.platform && tg.platform !== 'unknown');
  if (inTg) {
    try {
      tg.ready(); tg.expand();
      tg.disableVerticalSwipes && tg.disableVerticalSwipes();
      tg.enableClosingConfirmation && tg.enableClosingConfirmation();
    } catch (e) { /* старые версии Telegram */ }
  }
  const haptic = (kind) => {
    try {
      if (inTg && tg.HapticFeedback) {
        if (kind === 'select') tg.HapticFeedback.selectionChanged();
        else if (kind === 'ok') tg.HapticFeedback.notificationOccurred('success');
        else tg.HapticFeedback.impactOccurred(kind || 'light');
      } else if (navigator.vibrate && kind !== 'select') navigator.vibrate(kind === 'medium' ? 14 : 8);
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
  const BACK = 'cubic-bezier(.34,1.56,.64,1)';
  const anim = (el, frames, opts) => {
    if (reduced || !el || !el.animate) return null;
    try { return el.animate(frames, Object.assign({ easing: EASE, duration: 300 }, opts)); } catch (e) { return null; }
  };
  const done = (a) => (a && a.finished ? a.finished.catch(() => {}) : Promise.resolve());

  // Темп: полная анимация, быстрая или «уменьшение движения». Тап по полю пропускает ожидание.
  const tempo = () => (reduced ? { roll: 350, step: 30, land: 900 } : P.fast ? { roll: 450, step: 120, land: 700 } : { roll: 1150, step: 280, land: 620 });
  let skip = false, skipWake = null, rollAt = 0;
  const wait = (ms) => (skip ? Promise.resolve() : new Promise((r) => {
    const id = setTimeout(() => { skipWake = null; r(); }, ms);
    skipWake = () => { clearTimeout(id); skipWake = null; r(); };
  }));

  let ac = null;
  function audio() {
    if (P.sound === false) return null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = ac || new AC();
      if (ac.state !== 'running') ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function tone(freq, dur, vol, when, type) {
    const a = audio(); if (!a) return;
    const at = a.currentTime + (when || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(a.destination);
    o.start(at); o.stop(at + dur + 0.03);
  }
  function noise(dur, vol, freq, when, sweepTo) {
    const a = audio(); if (!a) return;
    const at = a.currentTime + (when || 0);
    const len = Math.max(1, Math.floor(a.sampleRate * dur));
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(freq, at);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(at); src.stop(at + dur + 0.02);
  }
  const sfx = {
    dice(n) { let at = 0; for (let i = 0; i < n; i++) { noise(0.035, 0.16 - i * 0.012, 1500 + Math.random() * 1400, at); at += 0.06 + i * 0.016; } },
    step(i) { tone(440 + i * 46, 0.09, 0.05, 0, 'triangle'); },
    land() { tone(392, 0.28, 0.06); tone(587.3, 0.36, 0.05, 0.08); },
    card() { noise(0.3, 0.05, 500, 0, 2400); },
    pick() { tone(660, 0.07, 0.04); },
    next() { tone(523.3, 0.1, 0.03); }
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
  function fresh() {
    return { players: [], pos: {}, turn: 0, round: 1, extra: 0, decks: {}, history: [], pending: null, started: false, finale: false, uid: 0, startedAt: 0 };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (!s || !Array.isArray(s.players)) return null;
      return Object.assign(fresh(), s);
    } catch (e) { return null; }
  }
  let S = load() || fresh();
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
  // Карточка, от которой отказались, не сгорает: уходит в низ своей колоды
  const giveBack = (theme, idx) => { (S.decks[theme] = S.decks[theme] || []).unshift(idx); };
  const current = () => S.players[S.turn % S.players.length];
  const player = (id) => S.players.find((x) => x.id === id);
  const limit = () => (P.rounds ? P.rounds + (S.extra || 0) : 0);

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
        if (!S.players.length) { S.started = false; S.finale = false; }
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
    let name = inp.value.trim().replace(/\s+/g, ' ');
    if (!name) return;
    if (S.players.length >= 10) { toast(t('max')); return; }
    // одинаковым именам дописывается номер, чтобы их можно было различить в итогах
    const has = (n) => S.players.some((p) => p.name.toLocaleLowerCase() === n.toLocaleLowerCase());
    if (has(name)) { let k = 2; while (has(name + ' ' + k)) k++; name = name + ' ' + k; }
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
  function startGame() {
    if (!S.players.length) return;
    const first = !S.started;
    S.started = true;
    if (!S.startedAt) S.startedAt = Date.now();
    save();
    audio(); keepAwake();
    if (S.finale) openFinale(); else openGame(first);
  }
  $('#btn-start').onclick = () => {
    if (!S.players.length) return;
    if (!S.started && !P.code && !P.codeAsked) openCode('set', startGame);
    else startGame();
  };

  // ---------- Настройки встречи ----------
  function renderSession() {
    $('#host-name').value = hostName();
    const box = $('#topics');
    box.innerHTML = '';
    TOPICS.forEach((th) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip-btn'; b.dataset.t = th;
      b.setAttribute('aria-pressed', String(P.decks.includes(th)));
      b.innerHTML = `<i style="background:${THEME_COLOR[th]}"></i><span></span>`;
      b.lastChild.textContent = short(th);
      box.appendChild(b);
    });
    $('#warm').setAttribute('aria-checked', String(P.warm !== false));
    for (const b of $('#rounds-seg').children) b.setAttribute('aria-pressed', String(+b.dataset.r === P.rounds));
    $('#host-code').value = P.code || '';
  }
  $('#host-name').oninput = (e) => { P.host = e.target.value.trim().slice(0, 24); saveP(); applyBrand(); };
  $('#topics').onclick = (e) => {
    const b = e.target.closest('.chip-btn');
    if (!b) return;
    const th = b.dataset.t;
    if (P.decks.includes(th)) {
      if (P.decks.length === 1) { toast(t('one_topic')); return; }
      P.decks = P.decks.filter((d) => d !== th);
    } else P.decks = TOPICS.filter((d) => d === th || P.decks.includes(d));
    saveP(); renderSession(); paintBoard();
  };
  $('#warm').onclick = () => { P.warm = P.warm === false; saveP(); renderSession(); };
  $('#rounds-seg').onclick = (e) => {
    const b = e.target.closest('[data-r]');
    if (!b) return;
    P.rounds = +b.dataset.r; saveP(); renderSession();
  };
  $('#host-code').oninput = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = v;
    if (v === '' || v.length === 4) { P.code = v; P.codeAsked = true; saveP(); }
  };
  function applyBrand() {
    const name = hostName();
    $('#brand').textContent = name || t('label_game');
    for (const img of document.querySelectorAll('.mark')) img.hidden = !hostIsDefault();
    document.title = t('label_game') + (name ? ' · ' + name : '');
  }

  // ---------- Код ведущей ----------
  let codeMode = 'set', codeCb = null;
  function openCode(mode, cb) {
    codeMode = mode; codeCb = cb;
    const set = mode === 'set';
    $('#code-title').textContent = t(set ? 'code_set_title' : 'code_title');
    $('#code-text').textContent = t(set ? 'code_set_text' : 'code_text');
    $('#code-ok').textContent = t(set ? 'code_save' : 'code_open');
    $('#code-alt').textContent = t(set ? 'code_skip' : 'code_forgot');
    $('#code-in').value = '';
    layerAt = Date.now();
    $('#code-layer').hidden = false;
    setTimeout(() => $('#code-in').focus(), 60);
  }
  const closeCode = () => { $('#code-layer').hidden = true; };
  $('#code-in').oninput = (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); };
  $('#code-in').onkeydown = (e) => { if (e.key === 'Enter') $('#code-ok').click(); };
  $('#code-ok').onclick = () => {
    const v = $('#code-in').value;
    if (codeMode === 'set') {
      if (!/^\d{4}$/.test(v)) { toast(t('code_4')); return; }
      P.code = v; P.codeAsked = true; saveP(); renderSession();
      closeCode(); codeCb && codeCb();
    } else if (v === P.code) { closeCode(); codeCb && codeCb(); }
    else { toast(t('code_wrong')); haptic('heavy'); $('#code-in').value = ''; }
  };
  $('#code-alt').onclick = async () => {
    if (codeMode === 'set') { P.codeAsked = true; saveP(); closeCode(); codeCb && codeCb(); return; }
    if (!(await confirmAsk(t('forgot_confirm')))) return;
    P.code = ''; saveP();
    closeCode();
    resetGame();
  };
  $('#code-layer').onclick = (e) => { if (e.target === e.currentTarget && codeMode !== 'set' && Date.now() - layerAt > 350) closeCode(); };
  function requestSummary() {
    if (P.code) openCode('enter', () => openSummary());
    else openSummary();
  }

  // ---------- Поле ----------
  const board = $('#board');
  const tokensLayer = document.createElement('div');
  tokensLayer.className = 'tokens';
  CELLS.forEach(([r, c], i) => {
    const el = document.createElement('div');
    el.className = 'cell' + (SPECIAL[i] ? ' special' : '');
    el.style.gridArea = `${r + 1}/${c + 1}`;
    el.dataset.i = i;
    el.style.animationDelay = i * 24 + 'ms';
    board.appendChild(el);
  });
  board.appendChild(tokensLayer);
  const cellEl = (i) => board.querySelector(`.cell[data-i="${i}"]`);

  function paintBoard() {
    for (const el of board.querySelectorAll('.cell')) {
      const i = +el.dataset.i, th = themeOf(i), sp = SPECIAL[i];
      el.style.background = THEME_COLOR[th];
      el.style.color = ink(THEME_COLOR[th]);
      el.textContent = i === 0 ? t('start_cell') : sp === 'all' ? t('cell_all') : sp === 'pick' ? t('cell_pick') : L().abbr[th];
      el.title = sp === 'all' ? t('sp_all') : sp === 'pick' ? t('sp_pick') : deck(th).title;
    }
    $('#legend').innerHTML = activeDecks().map((th) => `<li data-t="${th}"><i style="background:${THEME_COLOR[th]}"></i>${short(th)}</li>`).join('');
  }
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
        let tok = tokenEls[p.id];
        if (!tok) {
          tok = document.createElement('div');
          tok.appendChild(document.createElement('b'));
          tokensLayer.appendChild(tok);
          tokenEls[p.id] = tok;
        }
        tok.className = 'token' + (me && p.id === me.id ? ' me' : '') + (n > 4 ? ' sm' : '');
        tok.firstChild.style.background = p.color;
        tok.firstChild.textContent = initial(p.name);
        tok.style.transform = `translate(${(cx + Math.cos(ang) * rad).toFixed(1)}px,${(cy + Math.sin(ang) * rad).toFixed(1)}px)`;
      });
    });
  }
  function hop(id, dur) {
    const tok = tokenEls[id];
    if (!tok) return;
    anim(tok.firstChild, [
      { transform: 'translateY(0) scale(1.18)', easing: 'cubic-bezier(.2,.8,.4,1)' },
      { transform: 'translateY(-11px) scale(1.36)', easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: 'translateY(0) scale(1.18)' }
    ], { duration: dur, easing: 'linear' });
  }
  // Приземление: сжатие и растяжение с перелётом (приём game-feel)
  function squash(id) {
    const tok = tokenEls[id];
    if (!tok) return;
    anim(tok.firstChild, [
      { transform: 'scale(1.42,.9)' },
      { transform: 'scale(1.18)' }
    ], { duration: 320, easing: BACK });
  }
  // Короткая затухающая тряска центра поля, когда кубик падает
  function shake() {
    if (P.fast) return;
    anim($('#center'), [
      { transform: 'translate(0,0)' }, { transform: 'translate(-2.5px,1.5px)' }, { transform: 'translate(2px,-1px)' },
      { transform: 'translate(-1px,.5px)' }, { transform: 'translate(0,0)' }
    ], { duration: 200, easing: 'linear' });
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
  function turnLabel() {
    const lim = limit();
    return t('turn') + ' · ' + (lim ? t('round_of', { a: Math.min(S.round, lim), b: lim }) : t('round_n', { a: S.round }));
  }
  function renderTurn() {
    const me = current();
    const tn = $('#turn-name');
    tn.textContent = me ? me.name : '';
    tn.classList.toggle('long', !!me && Array.from(me.name).length > 12);
    if (me && me.id !== lastTurnId) anim(tn, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 340 });
    lastTurnId = me ? me.id : null;
    $('#turn-label').textContent = turnLabel();
    setHint(t('tap_dice'));
    $('#dice-btn').classList.add('wait');
    pickLegend(null);
    renderQueue(); renderTokens();
    if (me) setGlow(THEME_COLOR[themeOf(S.pos[me.id] || 0)]);
  }

  function openGame(intro) {
    show('s-game');
    if (intro && !reduced && !P.fast) {
      board.classList.add('intro');
      setTimeout(() => board.classList.remove('intro'), 1200);
    }
    renderTurn();
    if (S.pending) { if (S.pending.pick) openPick(); else openCard(true); }
  }

  // ---------- Кубик ----------
  const FACE = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
  let spin = 0, busy = false;
  const cube = $('#cube');

  async function roll() {
    if (busy || S.pending || S.finale || !S.players.length) return;
    busy = true;
    const scene = $('#dice-btn');
    try { await rollInner(scene); }
    finally {
      scene.classList.remove('busy', 'roll');
      board.classList.remove('focus');
      for (const c of board.querySelectorAll('.cell.land')) c.classList.remove('land');
      busy = false; skip = false;
    }
  }
  async function rollInner(scene) {
    const tm = tempo();
    skip = false; rollAt = Date.now();
    scene.classList.remove('wait'); scene.classList.add('busy');
    setHint('');
    haptic('medium');
    if (!reduced) sfx.dice(P.fast ? 4 : 9);
    const v = 1 + Math.floor(Math.random() * 6);
    spin += 2 + (v % 2);
    const [rx, ry] = FACE[v];
    cube.style.transitionDuration = reduced ? '1ms' : (tm.roll - 50) + 'ms';
    cube.style.transform = `rotateX(-18deg) rotateY(18deg) rotateX(${rx + spin * 360}deg) rotateY(${ry + spin * 360}deg)`;
    if (!reduced) { scene.style.animationDuration = tm.roll + 'ms'; scene.classList.remove('roll'); void scene.offsetWidth; scene.classList.add('roll'); }
    await wait(tm.roll);
    scene.classList.remove('roll');
    if (skip) cube.style.transitionDuration = '1ms';
    else shake();
    haptic('light');
    setHint(`<span>${t('rolled')} <b>${v}</b></span>`, true);

    const me = current();
    if (!me) return;
    let p = S.pos[me.id] || 0;
    for (let s = 0; s < v; s++) {
      p = (p + 1) % N;
      S.pos[me.id] = p;
      renderTokens();
      if (!skip) {
        hop(me.id, Math.min(260, tm.step));
        anim(cellEl(p), [{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }, { transform: 'scale(1)' }], { duration: Math.min(260, tm.step) });
        sfx.step(s);
        haptic('select');
      }
      await wait(tm.step);
    }
    squash(me.id);

    // Что выпало: первая карточка каждой — разогрев; на углах особые клетки
    const first = P.warm !== false && !S.history.some((h) => h.pid === me.id);
    const sp = SPECIAL[p];
    let theme = themeOf(p), mode = 'card', label = short(theme);
    if (first) { theme = 'razo'; label = short('razo') + t('first_round'); }
    else if (sp === 'all') { theme = 'razo'; mode = 'all'; label = t('sp_all'); }
    else if (sp === 'pick') { mode = 'pick'; label = t('sp_pick'); }
    const col = THEME_COLOR[theme];
    const land = cellEl(p);
    land.classList.add('land');
    board.classList.add('focus');
    pickLegend(mode === 'pick' ? null : theme);
    setGlow(col);
    setHint(`<span>${t('rolled')} <b>${v}</b></span><strong class="th"><i style="background:${col}"></i>${label}</strong>`, true);
    ripple(land, col);
    // искры — только на лёгких темах; на глубоких хватает ряби
    if (theme === 'razo' && mode !== 'pick' && !P.fast && !skip) {
      const lr = land.getBoundingClientRect();
      burst(lr.left + lr.width / 2, lr.top + lr.height / 2, col);
    }
    if (!skip) sfx.land();
    haptic('medium');
    // название темы держится на экране не меньше полсекунды, даже при пропуске
    if (skip) await sleep(500); else await wait(tm.land);

    if (mode === 'pick') {
      S.pending = { pid: me.id, pick: true };
      save();
      openPick();
      return;
    }
    S.pending = { pid: me.id, theme, idx: draw(theme), answer: null, swaps: 0, all: mode === 'all' };
    save();
    await openCard(false, land);
  }
  $('#dice-btn').onclick = roll;
  $('#dice-btn').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); roll(); } };
  // Тап по полю во время броска пропускает анимацию
  board.addEventListener('pointerdown', () => {
    if (!busy || skip || Date.now() - rollAt < 250) return;
    skip = true;
    cube.style.transitionDuration = '1ms';
    skipWake && skipWake();
  });

  // ---------- Выбор темы ----------
  function openPick() {
    const pd = S.pending;
    const me = player(pd.pid);
    $('#pick-title').textContent = t('pick_title', { n: me ? me.name : '' });
    const box = $('#pick-list');
    box.innerHTML = '';
    activeDecks().forEach((th) => {
      const b = document.createElement('button');
      b.className = 'pick-item'; b.dataset.t = th;
      b.innerHTML = `<i style="background:${THEME_COLOR[th]}"></i><span></span>`;
      b.lastChild.textContent = deck(th).title;
      box.appendChild(b);
    });
    $('#pick-layer').hidden = false;
  }
  $('#pick-list').onclick = (e) => {
    const b = e.target.closest('.pick-item');
    if (!b || !S.pending || !S.pending.pick) return;
    const th = b.dataset.t;
    S.pending = { pid: S.pending.pid, theme: th, idx: draw(th), answer: null, swaps: 0, all: false };
    save();
    $('#pick-layer').hidden = true;
    setGlow(THEME_COLOR[th]);
    openCard(false);
  };

  // ---------- Карточка ----------
  const flip = $('#card-flip');
  function fillCard() {
    const pd = S.pending;
    const me = player(pd.pid);
    const col = THEME_COLOR[pd.theme], fg = ink(col);
    const chip = $('#card-theme');
    chip.textContent = pd.all ? t('sp_all') : deck(pd.theme).title;
    chip.style.background = col;
    chip.style.color = fg;
    chip.style.boxShadow = pd.theme === 'razo' ? 'inset 0 0 0 1px rgba(18,18,17,.18)' : '';
    const name = me ? me.name : '';
    $('#card-who').textContent = pd.all ? t('starts', { n: name }) : name;
    $('#card-hint').textContent = t(pd.all ? 'all_hint' : 'card_hint');
    $('#scale-wrap').hidden = !!pd.all;
    $('#btn-pass').hidden = !!pd.all;
    $('#btn-swap').disabled = (pd.swaps || 0) >= 2;
    // рубашка карточки — в цвете колоды, с её названием
    const back = flip.querySelector('.back');
    back.style.background = col;
    back.style.color = fg;
    $('#back-mark').textContent = pd.all ? t('cell_all') : short(pd.theme);
    syncScale();
  }
  function fillPhrase(animate, base) {
    const el = $('#card-phrase');
    const text = deck(S.pending.theme).cards[S.pending.idx];
    el.textContent = '';
    if (!animate || reduced || P.fast) { el.textContent = text; return; }
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
  }
  async function openCard(instant, fromEl) {
    const layer = $('#card-layer');
    fillCard();
    flip.classList.remove('open', 'fresh');
    layer.hidden = false;
    const quick = instant || reduced || P.fast || skip;
    if (quick) {
      fillPhrase(false); flip.classList.add('open');
      if (!instant) { sfx.card(); haptic('ok'); }
      $('#card-phrase').focus({ preventScroll: true });
      return;
    }
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
    $('#card-phrase').focus({ preventScroll: true });
  }
  $('#scale').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b || !S.pending) return;
    // шкала по желанию: повторное нажатие снимает отметку
    S.pending.answer = S.pending.answer === b.dataset.v ? null : b.dataset.v;
    haptic('select');
    sfx.pick();
    save(); syncScale();
  };
  let closing = false, swapping = false;
  $('#btn-swap').onclick = () => {
    const pd = S.pending;
    if (!pd || pd.pick || closing || swapping || (pd.swaps || 0) >= 2) return;
    swapping = true;
    giveBack(pd.theme, pd.idx);
    pd.idx = draw(pd.theme);
    pd.answer = null;
    pd.swaps = (pd.swaps || 0) + 1;
    save();
    flip.classList.remove('open');
    sfx.card();
    setTimeout(() => { swapping = false; if (!S.pending) return; fillCard(); fillPhrase(true, 260); flip.classList.add('open'); }, reduced ? 0 : 420);
  };
  async function finishCard(passed) {
    const pd = S.pending;
    if (!pd || pd.pick || closing || swapping) return;
    closing = true;
    const me = player(pd.pid);
    const name = me ? me.name : '';
    if (passed) {
      // пас: карточка возвращается в колоду, в итогах остаётся только сам факт
      giveBack(pd.theme, pd.idx);
      S.history.push({ pid: pd.pid, name, pass: true, t: Date.now() });
    } else {
      S.history.push({
        pid: pd.pid, name, theme: pd.theme, idx: pd.idx, text: deck(pd.theme).cards[pd.idx],
        answer: pd.all ? null : pd.answer, note: '', all: !!pd.all, t: Date.now()
      });
    }
    S.pending = null;
    advance();
    save();
    if (!passed) sfx.next();
    const layer = $('#card-layer');
    const a = anim(flip, [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(28px) scale(.95)', opacity: 0 }], { duration: 200, fill: 'forwards' });
    const b = anim(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease', fill: 'forwards' });
    await Promise.all([done(a), done(b)]);
    layer.hidden = true;
    flip.classList.remove('open', 'fresh');
    a && a.cancel(); b && b.cancel();
    closing = false;
    afterTurn();
  }
  $('#btn-done').onclick = () => finishCard(false);
  $('#btn-pass').onclick = () => finishCard(true);

  // Переход хода и счёт кругов
  function advance() {
    if (!S.players.length) return;
    S.turn = (S.turn + 1) % S.players.length;
    if (S.turn === 0) {
      S.round = (S.round || 1) + 1;
      const lim = limit();
      if (lim && S.round > lim) S.finale = true;
    }
  }
  function afterTurn() {
    if (S.finale) { openFinale(); return; }
    renderTurn();
    const me = current();
    if (me && S.players.length > 2) toast(t('pass', { n: me.name }));
  }

  // ---------- Финал ----------
  function openFinale() {
    S.finale = true; save();
    $('#card-layer').hidden = true;
    show('s-finale');
    $('#fin-label').textContent = t('fin_label');
    $('#fin-title').textContent = t('fin_title');
    $('#fin-lead').textContent = t('fin_lead');
    $('#fin-phrase').textContent = t('fin_phrase');
    $('#fin-more').textContent = t('fin_more');
    $('#fin-sum').textContent = t('m_summary');
    const cards = S.history.filter((h) => !h.pass);
    const box = $('#mosaic');
    box.innerHTML = '';
    cards.forEach((h, i) => {
      const s = document.createElement('i');
      s.style.background = THEME_COLOR[h.theme];
      s.style.animationDelay = Math.min(i, 40) * 30 + 'ms';
      box.appendChild(s);
    });
    const topics = new Set(cards.map((h) => h.theme)).size;
    $('#fin-count').textContent = t('fin_count', { c: cards.length, t: topics });
  }
  $('#fin-more').onclick = () => {
    if (P.rounds) S.extra = Math.max((S.extra || 0) + 1, S.round - P.rounds);
    S.finale = false; save();
    openGame(false);
  };
  $('#fin-sum').onclick = requestSummary;

  // ---------- Меню ----------
  let layerAt = 0;
  $('#btn-menu').onclick = () => { if (busy) return; layerAt = Date.now(); $('#menu-layer').hidden = false; };
  $('#menu-layer').onclick = async (e) => {
    const act = e.target.closest('[data-act]');
    if (!act && e.target !== e.currentTarget) return;
    if (Date.now() - layerAt < 350) return;
    $('#menu-layer').hidden = true;
    const a = act ? act.dataset.act : 'close';
    if (a === 'summary') requestSummary();
    else if (a === 'finish') openFinale();
    else if (a === 'skip') { if (!busy && !S.pending) { advance(); save(); afterTurn(); } }
    else if (a === 'players') { show('s-setup'); renderPlayers(); }
    else if (a === 'settings') openSettings();
    else if (a === 'new') newGame();
  };

  function resetGame() {
    const keepPlayers = S.players;
    S = fresh();
    S.uid = keepPlayers.reduce((m, p) => Math.max(m, +String(p.id).slice(1) || 0), 0);
    S.players = keepPlayers;
    keepPlayers.forEach((p) => { S.pos[p.id] = 0; });
    save();
    $('#card-layer').hidden = true;
    $('#pick-layer').hidden = true;
    show('s-setup'); renderPlayers();
  }
  async function newGame() {
    if (S.history.length && !(await confirmAsk(t('confirm_new')))) return;
    resetGame();
  }

  // ---------- Итоги ----------
  function grouped() {
    return S.players.map((p) => ({ p, items: S.history.filter((h) => h.pid === p.id) }))
      .concat(orphanGroups());
  }
  function orphanGroups() {
    const ids = new Set(S.players.map((p) => p.id));
    const map = {};
    S.history.filter((h) => !ids.has(h.pid)).forEach((h) => { (map[h.pid] = map[h.pid] || { p: { name: h.name || '?', color: '#8A857E' }, items: [] }).items.push(h); });
    return Object.values(map);
  }
  // Темы, где «Точно да» отмечено два раза и больше; не больше двух тем
  function focusThemes(items) {
    const c = {};
    items.filter((h) => !h.pass && !h.all && h.answer === 'yes' && h.theme !== 'razo').forEach((h) => { c[h.theme] = (c[h.theme] || 0) + 1; });
    return Object.entries(c).filter((e) => e[1] >= 2).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([th]) => deck(th).title);
  }
  function cardsN(n) {
    if (P.lang === 'en') return n === 1 ? '1 card' : n + ' cards';
    const a = n % 10, b = n % 100;
    return n + ' ' + (a === 1 && b !== 11 ? 'карточка' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'карточки' : 'карточек');
  }
  const NEXT_MARK = { '': 'no', no: 'mid', mid: 'yes', yes: '' };
  function openSummary(quiet) {
    if ($('#s-summary').hidden) show('s-summary');
    const box = $('#summary');
    box.classList.toggle('quiet', !!quiet);
    box.innerHTML = '';
    if (!S.history.length) { box.innerHTML = '<p class="empty"></p>'; box.firstChild.textContent = t('empty'); return; }
    grouped().forEach(({ p, items }, gi) => {
      const d = document.createElement('div');
      d.className = 'person';
      d.style.animationDelay = Math.min(gi, 8) * 55 + 'ms';
      d.innerHTML = `<div class="person-head"><span class="token-i" style="background:${p.color}"></span><span class="name"></span><span class="cnt">${cardsN(items.filter((h) => !h.pass).length)}</span></div>`;
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
        if (h.pass) { e.className = 'entry pass'; e.textContent = t('pass_row'); d.appendChild(e); return; }
        e.className = 'entry';
        e.innerHTML = `<div class="entry-top"><i style="background:${THEME_COLOR[h.theme]}"></i><span></span></div><p></p>`;
        e.querySelector('.entry-top span').textContent = deck(h.theme).title + (h.all ? ' · ' + t('all_tag') : '');
        e.querySelector('p').textContent = entryText(h);
        if (!h.all) {
          // отметку можно поправить: нажатие меняет её по кругу
          const b = document.createElement('button');
          b.className = 'badge ' + (h.answer || 'none');
          b.textContent = h.answer ? t(h.answer) : '+ ' + t('mark');
          b.onclick = () => { h.answer = NEXT_MARK[h.answer || ''] || null; save(); haptic('select'); openSummary(true); };
          e.querySelector('.entry-top').appendChild(b);
        }
        const nb = document.createElement('button');
        nb.className = 'note-btn' + (h.note ? ' has' : '');
        nb.textContent = h.note ? t('note') + h.note : t('add_note');
        nb.onclick = () => {
          const ta = document.createElement('textarea');
          ta.className = 'note-in'; ta.rows = 2; ta.maxLength = 500;
          ta.placeholder = t('note_ph'); ta.value = h.note || '';
          ta.oninput = () => { h.note = ta.value; save(); };
          ta.onblur = () => { h.note = (ta.value || '').trim(); save(); openSummary(true); };
          nb.replaceWith(ta);
          ta.focus();
        };
        e.appendChild(nb);
        d.appendChild(e);
      });
      box.appendChild(d);
    });
  }
  function summaryText() {
    const en = P.lang === 'en';
    const date = new Date(S.startedAt || Date.now()).toLocaleDateString(en ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const q = en ? ['“', '”'] : ['«', '»'];
    const lines = [t('sum_head', { d: date }), t('sum_count', { p: S.players.length, c: S.history.filter((h) => !h.pass).length }), ''];
    grouped().forEach(({ p, items }) => {
      if (!items.length) return;
      lines.push(`— ${p.name}`);
      const f = focusThemes(items);
      if (f.length) lines.push(t('focus') + f.join(', '));
      items.forEach((h) => {
        if (h.pass) { lines.push('• ' + t('pass_row')); return; }
        lines.push(`• ${deck(h.theme).title}${h.all ? ' (' + t('all_tag') + ')' : ''}: ${q[0]}${entryText(h)}${q[1]}${h.answer ? ' — ' + t(h.answer) : ''}`);
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
  $('#btn-back').onclick = () => { if (S.finale) openFinale(); else if (S.started && S.players.length) openGame(false); else { show('s-setup'); renderPlayers(); } };
  $('#btn-new').onclick = () => newGame();
  $('#btn-erase').onclick = async () => {
    if (!(await confirmAsk(t('erase_confirm')))) return;
    try { localStorage.removeItem(KEY); localStorage.removeItem(PKEY); } catch (e) {}
    location.reload();
  };

  // ---------- Тост ----------
  let tt;
  const toastEl = $('#toast');
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 3500);
  }
  toastEl.onclick = () => { clearTimeout(tt); toastEl.classList.remove('on'); };

  window.addEventListener('resize', () => { if (!$('#s-game').hidden) renderTokens(); });

  // ---------- Настройки ----------
  const TEXTS = [
    ['#l-game', 'label_game'], ['#h1', 'h1'], ['#setup-sub', 'setup_sub'], ['#privacy', 'privacy'],
    ['#rules-title', 'rules_title'], ['#sess-title', 'sess_title'], ['#l-host', 'l_host'], ['#l-topics', 'l_topics'],
    ['#l-warm', 'l_warm'], ['#l-rounds', 'l_rounds'], ['#l-code', 'l_code'],
    ['#scale-q', 'scale_q'], ['#scale-opt', 'opt'],
    ['#scale [data-v=no]', 'no'], ['#scale [data-v=mid]', 'mid'], ['#scale [data-v=yes]', 'yes'],
    ['#btn-swap', 'swap'], ['#btn-done', 'next'], ['#btn-pass', 'pass_btn'],
    ['[data-act=summary]', 'm_summary'], ['[data-act=finish]', 'm_finish'], ['[data-act=skip]', 'm_skip'], ['[data-act=players]', 'm_players'],
    ['[data-act=settings]', 'm_settings'], ['[data-act=new]', 'm_new'], ['[data-act=close]', 'm_close'],
    ['#sum-title', 'sum_title'], ['#btn-copy', 'copy'], ['#btn-new', 'newgame'], ['#btn-erase', 'erase'],
    ['#set-skin-l', 'set_skin'], ['#set-sound-l', 'set_sound'], ['#set-anim-l', 'set_anim'],
    ['#sound-seg [data-s="1"]', 'on'], ['#sound-seg [data-s="0"]', 'off'],
    ['#anim-seg [data-f="0"]', 'full'], ['#anim-seg [data-f="1"]', 'quick'], ['#set-done', 'ok']
  ];
  const ARIA = [['#add-form button', 'add'], ['#btn-menu', 'a_menu'], ['#btn-back', 'a_back'], ['#dice-btn', 'a_dice'], ['#queue', 'a_queue'],
    ['#btn-set', 'a_set'], ['#scale', 'scale_q'], ['#btn-lang', 'a_lang'], ['#card-lang', 'a_lang'], ['#warm', 'l_warm']];
  function applyLang() {
    document.documentElement.lang = P.lang;
    for (const [sel, k] of TEXTS) { const el = $(sel); if (el) el.textContent = t(k); }
    for (const [sel, k] of ARIA) { const el = $(sel); if (el) el.setAttribute('aria-label', t(k)); }
    $('#add-name').placeholder = t('ph_name');
    const other = P.lang === 'en' ? 'RU' : 'EN';
    $('#btn-lang').textContent = other; $('#card-lang').textContent = other;
    document.querySelectorAll('#rules li').forEach((li, i) => { li.textContent = L().rules[i] || ''; });
    applyBrand();
    paintBoard();
    renderPlayers();
    renderSession();
    renderSkins();
    for (const b of $('#lang-seg').children) b.setAttribute('aria-pressed', String(b.dataset.lang === P.lang));
    for (const b of $('#sound-seg').children) b.setAttribute('aria-pressed', String((b.dataset.s === '1') === (P.sound !== false)));
    for (const b of $('#anim-seg').children) b.setAttribute('aria-pressed', String((b.dataset.f === '1') === !!P.fast));
    if (!$('#s-game').hidden && !busy) { $('#turn-label').textContent = turnLabel(); if (!S.pending) setHint(t('tap_dice')); }
    if (S.pending && !S.pending.pick && !$('#card-layer').hidden) { fillCard(); fillPhrase(false); }
    if (S.pending && S.pending.pick && !$('#pick-layer').hidden) openPick();
    if (!$('#s-summary').hidden) openSummary(true);
    if (!$('#s-finale').hidden) openFinale();
  }
  function setLang(l) { P.lang = l; langChosen = true; saveP(); applyLang(); haptic('select'); }
  const otherLang = () => (P.lang === 'en' ? 'ru' : 'en');
  $('#btn-lang').onclick = () => setLang(otherLang());
  $('#card-lang').onclick = () => setLang(otherLang());
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
    renderSession();
    const me = S.players.length ? current() : null;
    glowColor = '';
    setGlow(!$('#s-game').hidden && me ? THEME_COLOR[themeOf(S.pos[me.id] || 0)] : sk.accent);
    if (S.pending && !S.pending.pick && !$('#card-layer').hidden) fillCard();
    if (S.pending && S.pending.pick && !$('#pick-layer').hidden) openPick();
    if (!$('#s-summary').hidden) openSummary(true);
    if (!$('#s-finale').hidden) openFinale();
  }
  function openSettings() { layerAt = Date.now(); $('#set-layer').hidden = false; }
  $('#btn-set').onclick = openSettings;
  $('#set-layer').onclick = (e) => {
    const lang = e.target.closest('[data-lang]'), sk = e.target.closest('.skin'), snd = e.target.closest('[data-s]'), fst = e.target.closest('[data-f]');
    if (lang) setLang(lang.dataset.lang);
    else if (sk) { P.skin = sk.dataset.skin; saveP(); applySkin(); haptic('select'); }
    else if (snd) { P.sound = snd.dataset.s === '1'; saveP(); applyLang(); if (P.sound) sfx.pick(); }
    else if (fst) { P.fast = fst.dataset.f === '1'; saveP(); applyLang(); }
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
  if (S.started && S.players.length) { if (S.finale) openFinale(); else openGame(false); keepAwake(); }
})();
