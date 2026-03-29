'use strict';

/* ── Checklist data ─────────────────────────────────────────────── */

const CHECKLIST = [
  { id: 'matcha',      label: 'Matcha',                       qty: '2–3 cups · steep 3–5 min at 175°F', cat: 'Beverages & Teas'    },
  { id: 'pom',         label: 'Pomegranate Juice',             qty: '8 oz, split AM / PM',               cat: 'Beverages & Teas'    },
  { id: 'berries',     label: 'Berries',                       qty: '1 cup',                             cat: 'Fruits'               },
  { id: 'kiwi',        label: 'Kiwi Fruit',                    qty: '1 whole',                           cat: 'Fruits'               },
  { id: 'broccoli',    label: 'Broccoli',                      qty: '1 cup',                             cat: 'Vegetables & Greens'  },
  { id: 'greens',      label: 'Greens (Spinach, Kale, etc.)',  qty: '2–4 cups',                          cat: 'Vegetables & Greens'  },
  { id: 'sauerkraut',  label: 'Sauerkraut',                    qty: '¼ cup',                             cat: 'Vegetables & Greens'  },
  { id: 'tomatopaste', label: 'Tomato Paste',                   qty: '3 Tbsp',                            cat: 'Vegetables & Greens'  },
  { id: 'cacao',       label: 'Raw Cacao',                     qty: '1 oz (nibs, powder, etc.)',         cat: 'Proteins & Fats'      },
  { id: 'sardines',    label: 'Sardines',                      qty: '4 oz',                              cat: 'Proteins & Fats'      },
  { id: 'oliveoil',    label: 'Extra Virgin Olive Oil',        qty: '3 Tbsp',                            cat: 'Proteins & Fats'      },
  { id: 'yogurt',      label: 'Yogurt or Kefir',               qty: '6 oz',                              cat: 'Proteins & Fats'      },
  { id: 'hotpepper',   label: 'Hot Pepper or Capsaicin',       qty: '1 hot pepper or equivalent',        cat: 'Spices & Heat'        },
  { id: 'omega',       label: 'Omega Supplement',              qty: '1,000 mg',                          cat: 'Supplements'          },
];

// Display order Mon → Sun. JS getDay(): 0=Sun, 1=Mon … 6=Sat
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS = { 0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa' };

/* ── State ──────────────────────────────────────────────────────── */

let settings = null; // { longestStreak: int }
let history  = {};   // { 'YYYY-MM-DD': { itemId: bool, … } }

/* ── Storage ────────────────────────────────────────────────────── */

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('settings')); } catch { return null; }
}
function saveSettings(s) { try { localStorage.setItem('settings', JSON.stringify(s)); } catch (e) { console.warn('Settings save failed:', e); } }

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('history')) ?? {}; } catch { return {}; }
}

function pruneHistory(h) {
  const cutoff = offsetDate(todayStr(), -90);
  Object.keys(h).forEach(d => { if (d < cutoff) delete h[d]; });
  return h;
}
function saveHistory(h) { try { localStorage.setItem('history', JSON.stringify(h)); } catch (e) { console.warn('History save failed:', e); } }

/* ── Date helpers ───────────────────────────────────────────────── */

// Returns today as YYYY-MM-DD in the device's local timezone
function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

// Offset a YYYY-MM-DD string by n days, returns YYYY-MM-DD
function offsetDate(dStr, n) {
  const d = new Date(dStr + 'T12:00:00'); // noon avoids DST edge cases
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}

// Day-of-week (0–6) for a YYYY-MM-DD string
function dowOf(dStr) {
  return new Date(dStr + 'T12:00:00').getDay();
}

/* ── Checklist logic ────────────────────────────────────────────── */

function applicableItems() {
  return CHECKLIST;
}

function isDayComplete(dStr) {
  const checks = history[dStr] ?? {};
  return applicableItems().every(item => checks[item.id] === true);
}

function calcStreak() {
  const today = todayStr();
  let current = 0;
  // Start from today if complete, else from yesterday
  let cursor = isDayComplete(today) ? today : offsetDate(today, -1);

  for (let i = 0; i < 366; i++) {
    if (isDayComplete(cursor)) {
      current++;
      cursor = offsetDate(cursor, -1);
    } else {
      break;
    }
  }

  const longest = Math.max(settings.longestStreak ?? 0, current);
  if (longest > (settings.longestStreak ?? 0)) {
    settings.longestStreak = longest;
    saveSettings(settings);
  }
  return { current, longest };
}

/* ── Rendering ──────────────────────────────────────────────────── */

function render() {
  renderHeader();
  renderWeekStrip();
  renderChecklist();
}

function renderHeader() {
  const today = todayStr();
  const items  = applicableItems();
  const checks = history[today] ?? {};
  const done   = items.filter(i => checks[i.id]).length;
  const total  = items.length;

  const { current, longest } = calcStreak();

  document.getElementById('streak-count').textContent = current;
  document.getElementById('best-streak').textContent  = longest > current ? `· best ${longest}` : '';
  document.getElementById('progress-text').textContent = `${done} / ${total}`;
  document.getElementById('progress-fill').style.width = total ? `${(done / total) * 100}%` : '0%';
}

function renderWeekStrip() {
  const strip = document.getElementById('week-strip');
  strip.innerHTML = '';

  const today = todayStr();

  // Find Monday of this week
  const todayDow     = dowOf(today);
  const daysSinceMon = todayDow === 0 ? 6 : todayDow - 1;
  const monday       = offsetDate(today, -daysSinceMon);

  // Build 7-day row
  const row = document.createElement('div');
  row.className = 'week-days-row';

  WEEK_ORDER.forEach((dow, idx) => {
    const dStr    = offsetDate(monday, idx);
    const isToday = dStr === today;
    const isPast  = dStr < today;
    const complete = isDayComplete(dStr);

    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const nameEl = document.createElement('div');
    nameEl.className = 'day-name';
    nameEl.textContent = DAY_LABELS[dow];

    const dot = document.createElement('div');
    dot.className = 'day-dot';

    if (complete) {
      dot.classList.add('complete');
      dot.textContent = '✓';
    } else if (isPast) {
      dot.classList.add('missed');
      dot.textContent = '×';
    } else {
      dot.textContent = new Date(dStr + 'T12:00:00').getDate();
    }

    if (isToday) dot.classList.add('today');

    cell.appendChild(nameEl);
    cell.appendChild(dot);
    row.appendChild(cell);
  });

  strip.appendChild(row);

  // Sardine count this week
  const sardineHit = WEEK_ORDER
    .map((_, idx) => offsetDate(monday, idx))
    .filter(dStr => (history[dStr] ?? {})['sardines'] === true)
    .length;

  const note = document.createElement('div');
  note.className = 'sardine-note';
  note.textContent = `🐟 Sardines  ${sardineHit} this week`;
  strip.appendChild(note);
}

function renderChecklist() {
  const container = document.getElementById('checklist');
  container.innerHTML = '';

  const today  = todayStr();
  const items  = applicableItems();
  const checks = history[today] ?? {};
  const allDone = items.length > 0 && items.every(i => checks[i.id]);

  if (allDone) {
    const banner = document.createElement('div');
    banner.className = 'completion-banner';
    banner.textContent = '🎉 All done for today!';
    container.appendChild(banner);
  }

  // Group by category while preserving order
  const cats = [];
  const bycat = {};
  items.forEach(item => {
    if (!bycat[item.cat]) { bycat[item.cat] = []; cats.push(item.cat); }
    bycat[item.cat].push(item);
  });

  cats.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'category-section';

    const header = document.createElement('div');
    header.className = 'category-header';
    header.textContent = cat;
    section.appendChild(header);

    const card = document.createElement('div');
    card.className = 'checklist-card';

    bycat[cat].forEach(item => {
      const row = document.createElement('div');
      row.className = 'checklist-item' + (checks[item.id] ? ' checked' : '');
      row.dataset.id = item.id;
      row.innerHTML = `
        <div class="check-box">
          <svg class="check-icon" viewBox="0 0 24 24" width="14" height="14"
               fill="none" stroke="white" stroke-width="3"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="item-text">
          <div class="item-label">${item.label}</div>
          <div class="item-qty">${item.qty}</div>
        </div>
      `;
      row.addEventListener('click', () => toggleItem(item.id));
      card.appendChild(row);
    });

    section.appendChild(card);
    container.appendChild(section);
  });
}

/* ── Actions ────────────────────────────────────────────────────── */

function toggleItem(id) {
  const today = todayStr();
  if (!history[today]) history[today] = {};
  history[today][id] = !history[today][id];
  saveHistory(history);
  render();
}

function exportData() {
  const payload = {
    exported: new Date().toISOString(),
    settings,
    history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `checklist-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Progress graph ─────────────────────────────────────────────── */

function showGraph() {
  const today = todayStr();
  const DAYS  = 30;
  const data  = [];

  for (let i = DAYS - 1; i >= 0; i--) {
    const d      = offsetDate(today, -i);
    const checks = history[d] ?? {};
    const done   = CHECKLIST.filter(it => checks[it.id]).length;
    data.push({ d, pct: CHECKLIST.length ? (done / CHECKLIST.length) * 100 : 0 });
  }

  const avgPct      = Math.round(data.reduce((s, d) => s + d.pct, 0) / data.length);
  const completeDays = data.filter(d => d.pct === 100).length;

  // SVG chart
  const vbW = 300, vbH = 140;
  const padL = 24, padR = 6, padT = 8, padB = 18;
  const chartW = vbW - padL - padR;
  const chartH = vbH - padT - padB;
  const slotW  = chartW / DAYS;
  const barW   = Math.max(1, slotW - 1.5);

  let svg = '';

  // Gridlines + Y labels
  [0, 50, 100].forEach(pct => {
    const y = padT + chartH - (pct / 100) * chartH;
    svg += `<line x1="${padL}" y1="${y}" x2="${vbW - padR}" y2="${y}" stroke="#e0ede5" stroke-width="0.5"/>`;
    svg += `<text x="${padL - 3}" y="${y + 3}" text-anchor="end" font-size="6.5" fill="#95b8a0">${pct}%</text>`;
  });

  // Bars
  data.forEach((day, i) => {
    const x    = padL + i * slotW;
    const h    = Math.max(1, (day.pct / 100) * chartH);
    const y    = padT + chartH - h;
    const fill = day.pct === 100 ? '#52b788' : day.pct >= 50 ? '#95d5b2' : day.pct > 0 ? '#f5c6c2' : '#eeeeee';
    svg += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="1" fill="${fill}"/>`;
  });

  // X-axis week labels
  for (let i = 6; i < DAYS; i += 7) {
    const cx    = padL + i * slotW + barW / 2;
    const label = data[i].d.slice(5); // MM-DD
    svg += `<text x="${cx}" y="${vbH - 2}" text-anchor="middle" font-size="6" fill="#95b8a0">${label}</text>`;
  }

  document.getElementById('graph-chart').innerHTML =
    `<svg viewBox="0 0 ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">${svg}</svg>`;

  document.getElementById('graph-stats').textContent =
    `${avgPct}% avg · ${completeDays} / ${DAYS} complete days`;

  document.getElementById('graph-modal').classList.remove('hidden');
}

/* ── Main screen ────────────────────────────────────────────────── */

function showMain() {
  document.getElementById('main').classList.remove('hidden');
  render();
}

/* ── Overflow menu ──────────────────────────────────────────────── */

function initMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const menu    = document.getElementById('overflow-menu');
  const overlay = document.getElementById('overlay');

  function closeMenu() {
    menu.classList.add('hidden');
    overlay.classList.add('hidden');
  }

  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) { closeMenu(); } else {
      menu.classList.remove('hidden');
      overlay.classList.remove('hidden');
    }
  });

  overlay.addEventListener('click', closeMenu);

  document.getElementById('export-btn').addEventListener('click', () => {
    closeMenu();
    exportData();
  });

  document.getElementById('graph-btn').addEventListener('click', () => {
    closeMenu();
    showGraph();
  });

  document.getElementById('graph-close').addEventListener('click', () => {
    document.getElementById('graph-modal').classList.add('hidden');
  });

  document.getElementById('graph-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('graph-modal')) {
      document.getElementById('graph-modal').classList.add('hidden');
    }
  });
}

/* ── Service worker ─────────────────────────────────────────────── */

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

/* ── Init ───────────────────────────────────────────────────────── */

function init() {
  registerSW();
  initMenu();

  settings = loadSettings() ?? { longestStreak: 0 };
  history  = pruneHistory(loadHistory());
  saveHistory(history);

  showMain();
}

document.addEventListener('DOMContentLoaded', init);
