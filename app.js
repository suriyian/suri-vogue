/* ============================================
   SURI VOGUE — App Logic
   Pure localStorage, no IndexedDB dependency
   ============================================ */

// ============ Data Layer (Pure LocalStorage) ============
const IMG_PREFIX = 'sv_img_';

function saveImage(id, dataUrl) {
  try { localStorage.setItem(IMG_PREFIX + id, dataUrl); } catch(e) { console.warn('Storage full', e); }
}

function getImage(id) {
  return localStorage.getItem(IMG_PREFIX + id) || null;
}

function deleteImage(id) {
  localStorage.removeItem(IMG_PREFIX + id);
}

function getAllImages() {
  const imgs = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(IMG_PREFIX)) {
      imgs.push({ id: key.slice(IMG_PREFIX.length), data: localStorage.getItem(key) });
    }
  }
  return imgs;
}

// ============ State ============
const STATE_KEY = 'garderobe_state';

function defaultState() {
  return {
    profile: { nickname: '', height: '', weight: '', avatar: '', styles: [] },
    settings: { cooldown: 7 },
    items: [],       // single clothing items
    outfits: [],     // outfit groups
    wearLog: [],     // { date, outfitId, items: [] }
    feedback: [],    // { date, outfitCombo: [], type }
  };
}

let state = defaultState();

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      state = { ...defaultState(), ...s };
    }
  } catch (e) { console.warn('State load error', e); }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// ============ Utility ============
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 2000);
}

function formatDate(d) {
  const days = ['日','一','二','三','四','五','六'];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${days[d.getDay()]}`;
}

function readFileAsDataUrl(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

async function compressImage(dataUrl, maxW = 800) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
}

const COLORS = [
  { name: '黑', hex: '#1a1a1a' }, { name: '白', hex: '#f5f5f5' },
  { name: '灰', hex: '#9e9e9e' }, { name: '米', hex: '#e8dcc8' },
  { name: '棕', hex: '#8b6f47' }, { name: '驼', hex: '#c4a67d' },
  { name: '藏蓝', hex: '#1a365d' }, { name: '蓝', hex: '#3b82f6' },
  { name: '红', hex: '#c0392b' }, { name: '粉', hex: '#e8a0bf' },
  { name: '绿', hex: '#2d6a4f' }, { name: '紫', hex: '#7c3aed' },
  { name: '黄', hex: '#eab308' }, { name: '橙', hex: '#ea580c' },
  { name: '花色', hex: 'conic-gradient(#c0392b,#eab308,#2d6a4f,#3b82f6,#c0392b)' },
];

// ============ Navigation ============
const pages = ['home', 'wardrobe', 'profile'];
let currentPage = 'home';

function navigateTo(page) {
  currentPage = page;
  pages.forEach(p => {
    document.getElementById(`page-${p}`).classList.toggle('active', p === page);
  });
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
  // Update topbar
  const titles = { home: 'SURI VOGUE', wardrobe: '我的衣橱', profile: '个人档案' };
  document.getElementById('topbarTitle').textContent = titles[page] || 'GARDE·ROBE';
  // Hide FAB on non-wardrobe
  const fab = document.getElementById('fabAdd');
  if (fab) fab.style.display = page === 'wardrobe' ? 'flex' : 'none';
}

// ============ Daily Quotes ============
const DAILY_QUOTES = [
  { text: '云想衣裳花想容', source: '李白' },
  { text: '当时只道是寻常', source: '纳兰性德' },
  { text: '人生若只如初见', source: '纳兰性德' },
  { text: '陌上花开，可缓缓归矣', source: '钱镠' },
  { text: '山中何事？松花酿酒，春水煎茶', source: '张可久' },
  { text: '此心安处是吾乡', source: '苏轼' },
  { text: '一身诗意千寻瀑，万古人间四月天', source: '林徽因' },
  { text: '你要做一个不动声色的大人了', source: '村上春树' },
  { text: '凡是过往，皆为序章', source: 'Shakespeare' },
  { text: '生活是很狭隘的，但是请保持优雅', source: 'Coco Chanel' },
  { text: '简单是复杂的终极形态', source: 'Leonardo da Vinci' },
  { text: '穿不好没关系，关键是穿出自己', source: 'Yves Saint Laurent' },
  { text: '时尚会褪色，风格永存', source: 'Coco Chanel' },
  { text: '优雅不在于你穿了什么，而在于你是谁', source: 'Givenchy' },
  { text: '少即是多', source: 'Mies van der Rohe' },
  { text: '最深沉的爱，莫过于你别离后，我活成了你的模样', source: '张爱玲' },
  { text: '岁月不居，时节如流', source: '孔融' },
  { text: '人间有味是清欢', source: '苏轼' },
  { text: '浮生若梦，为欢几何', source: '李白' },
  { text: '落花人独立，微雨燕双飞', source: '晏几道' },
  { text: '一个人知道自己为什么而活，就可以忍受任何一种生活', source: 'Nietzsche' },
  { text: '美不是一种需要，而是一种欣喜', source: 'Kahlil Gibran' },
  { text: '万物皆有裂痕，那是光照进来的地方', source: 'Leonard Cohen' },
  { text: '我不想谋生，我想生活', source: 'Oscar Wilde' },
  { text: '行到水穷处，坐看云起时', source: '王维' },
  { text: '且将新火试新茶，诗酒趁年华', source: '苏轼' },
  { text: '愿你一生努力，一生被爱', source: '八月长安' },
  { text: '我与春风皆过客，你携秋水揽星河', source: '佚名' },
  { text: '世间始终你好', source: '金庸' },
  { text: '把每一天都当作生命的最后一天来过', source: 'Marcus Aurelius' },
  { text: '没有人值得你流泪，值得让你这么做的人不会让你哭泣', source: 'García Márquez' },
  { text: '所有漂泊的人生都梦想着平静、童年、杜鹃花', source: '赫塔·米勒' },
  { text: '只有用心灵才能看清事物的本质', source: 'Saint-Exupéry' },
  { text: '大知闲闲，小知间间', source: '庄子' },
  { text: '风雅，就是发现存在之美', source: '川端康成' },
  { text: '何须浅碧深红色，自是花中第一流', source: '李清照' },
  { text: '若待上林花似锦，出门俱是看花人', source: '杨巨源' },
  { text: '不乱于心，不困于情，不畏将来，不念过往', source: '丰子恺' },
  { text: '时光永远年轻，我们慢慢老去', source: '亦舒' },
  { text: '你若盛开，清风自来', source: '佚名' },
  { text: '做一个寡言但心存善意的人', source: '海明威' },
  { text: '长日尽处，我站在你的面前，你将看到我的疤痕，知道我曾经受伤，也曾经痊愈', source: 'Tagore' },
  { text: '越过山丘，才发现无人等候', source: '李宗盛' },
  { text: '时间决定你会在生命中遇见谁，你的心决定你想要谁出现在你的生命里，而你的行为决定最后谁能留下', source: 'García Márquez' },
  { text: '不以物喜，不以己悲', source: '范仲淹' },
  { text: '一花一世界，一叶一菩提', source: '华严经' },
  { text: '生如夏花之绚烂，死如秋叶之静美', source: 'Tagore' },
  { text: '日日是好日', source: '禅语' },
  { text: '从前种种，譬如昨日死；从后种种，譬如今日生', source: '袁了凡' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负', source: 'Nietzsche' },
  { text: '春有百花秋有月，夏有凉风冬有雪', source: '无门慧开' },
  { text: '你的气质里，藏着你走过的路和读过的书', source: '佚名' },
  { text: '温柔半两，从容一生', source: '佚名' },
  { text: '欲买桂花同载酒，终不似，少年游', source: '刘过' },
  { text: '世事漫随流水，算来一梦浮生', source: '李煜' },
  { text: '她那时候还太年轻，不知道所有命运赠送的礼物，早已在暗中标好了价格', source: 'Stefan Zweig' },
];

function getDailyQuote() {
  // Use date as seed so same quote all day, changes daily
  const now = new Date();
  const dayIndex = Math.floor(now.getTime() / 86400000);
  const idx = dayIndex % DAILY_QUOTES.length;
  return DAILY_QUOTES[idx];
}

// ============ Home Page ============
function initHome() {
  const now = new Date();
  document.getElementById('homeDate').textContent = formatDate(now);
  const quote = getDailyQuote();
  document.getElementById('homeGreeting').innerHTML =
    `<span class="quote-text">${quote.text}</span><span class="quote-source">— ${quote.source}</span>`;
  renderRecentWears();
}

// Temp controls
let currentTemp = 22;
document.querySelectorAll('.temp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentTemp += parseInt(btn.dataset.delta);
    currentTemp = Math.max(-10, Math.min(45, currentTemp));
    document.getElementById('tempValue').textContent = currentTemp;
  });
});

// Occasion
let currentOccasion = '通勤';
document.getElementById('occasionTags').addEventListener('click', e => {
  const btn = e.target.closest('.tag-btn');
  if (!btn) return;
  document.querySelectorAll('#occasionTags .tag-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentOccasion = btn.dataset.occasion;
});

// ============ Recommendation Engine ============
document.getElementById('btnRecommend').addEventListener('click', generateRecommendations);
document.getElementById('btnRefresh').addEventListener('click', generateRecommendations);

async function generateRecommendations() {
  if (state.items.length < 2) {
    toast('衣橱里的衣服还不够哦，先去添加吧');
    return;
  }

  const pool = filterPool(currentTemp, currentOccasion);
  const combos = buildCombos(pool);
  const scored = scoreCombos(combos);
  const top3 = diversePick(scored, 3);

  const container = document.getElementById('recommendations');
  const list = document.getElementById('recoList');
  container.classList.remove('hidden');
  list.innerHTML = '';

  if (top3.length === 0) {
    list.innerHTML = '<div class="empty-hint">没找到合适的搭配，试试调整温度或场合？</div>';
    return;
  }

  for (let i = 0; i < top3.length; i++) {
    const combo = top3[i];
    const card = document.createElement('div');
    card.className = 'reco-card';
    const labels = ['LOOK A', 'LOOK B', 'LOOK C'];

    let imgsHtml = '';
    for (const itemId of combo.items) {
      const item = state.items.find(it => it.id === itemId);
      if (!item) continue;
      const imgData = getImage(item.imageId || item.id);
      imgsHtml += `<img class="reco-item-img" src="${imgData || ''}" alt="${item.category}">`;
    }

    const desc = combo.items.map(id => {
      const it = state.items.find(x => x.id === id);
      return it ? it.category : '';
    }).join(' + ');

    card.innerHTML = `
      <span class="reco-card-label">${labels[i]}</span>
      <div class="reco-items">${imgsHtml}</div>
      <div class="reco-bottom">
        <span class="reco-desc">${desc}</span>
        <div class="reco-actions">
          <button class="reco-action-btn" data-action="dislike" data-combo='${JSON.stringify(combo.items)}'>👎</button>
          <button class="reco-action-btn" data-action="wear" data-combo='${JSON.stringify(combo.items)}'>👗</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  }

  // Bind action buttons
  list.querySelectorAll('.reco-action-btn').forEach(btn => {
    btn.addEventListener('click', () => handleRecoAction(btn));
  });
}

function filterPool(temp, occasion) {
  const now = Date.now();
  const cooldownMs = state.settings.cooldown * 86400000;
  const recentWorn = new Set();
  state.wearLog.forEach(w => {
    if (now - new Date(w.date).getTime() < cooldownMs) {
      w.items.forEach(id => recentWorn.add(id));
    }
  });

  return state.items.filter(item => {
    // Temperature check
    const tMin = item.tempMin ?? -10;
    const tMax = item.tempMax ?? 40;
    if (temp < tMin || temp > tMax) return false;
    // Occasion check
    if (item.occasions && item.occasions.length > 0) {
      if (!item.occasions.includes(occasion)) return false;
    }
    // Cooldown check
    if (recentWorn.has(item.id)) return false;
    return true;
  });
}

function buildCombos(pool) {
  const tops = pool.filter(i => i.category === '上装');
  const bottoms = pool.filter(i => i.category === '下装');
  const outers = pool.filter(i => i.category === '外套');
  const dresses = pool.filter(i => i.category === '连衣裙');
  const shoes = pool.filter(i => i.category === '鞋子');

  const combos = [];
  const needOuter = currentTemp < 15;

  // Top + Bottom combos
  for (const top of tops) {
    for (const bot of bottoms) {
      const items = [top.id, bot.id];
      if (needOuter && outers.length > 0) {
        for (const out of outers) {
          combos.push({ items: [...items, out.id] });
        }
      } else {
        combos.push({ items });
      }
    }
  }

  // Dress combos
  for (const dress of dresses) {
    const items = [dress.id];
    if (needOuter && outers.length > 0) {
      for (const out of outers) {
        combos.push({ items: [...items, out.id] });
      }
    } else {
      combos.push({ items });
    }
  }

  // Add shoes if available
  if (shoes.length > 0) {
    const expanded = [];
    for (const combo of combos) {
      for (const shoe of shoes) {
        expanded.push({ items: [...combo.items, shoe.id] });
      }
    }
    return expanded.length > 0 ? expanded : combos;
  }

  return combos;
}

function scoreCombos(combos) {
  return combos.map(combo => {
    let score = 50; // base

    // Bonus for matching original outfits
    for (const outfit of state.outfits) {
      const outfitItemIds = new Set(outfit.itemIds || []);
      const matchCount = combo.items.filter(id => outfitItemIds.has(id)).length;
      if (matchCount >= 2) score += 15 * matchCount;
    }

    // Penalty for negative feedback combos
    for (const fb of state.feedback) {
      if (fb.type === 'love') continue;
      const fbSet = new Set(fb.outfitCombo || []);
      const overlap = combo.items.filter(id => fbSet.has(id)).length;
      if (overlap >= 2) score -= 10 * overlap;
    }

    // Bonus from positive feedback
    for (const fb of state.feedback) {
      if (fb.type !== 'love') continue;
      const fbSet = new Set(fb.outfitCombo || []);
      const overlap = combo.items.filter(id => fbSet.has(id)).length;
      if (overlap >= 2) score += 8 * overlap;
    }

    // Color harmony bonus
    const colors = combo.items.map(id => {
      const item = state.items.find(x => x.id === id);
      return item?.color || '';
    }).filter(Boolean);
    if (colors.length > 0) {
      const unique = new Set(colors);
      if (unique.size <= 3) score += 5;
      // Neutral color bonus
      const neutrals = ['黑', '白', '灰', '米', '驼'];
      const neutralCount = colors.filter(c => neutrals.includes(c)).length;
      score += neutralCount * 3;
    }

    // Wear frequency penalty
    const wearCounts = {};
    state.wearLog.forEach(w => { w.items.forEach(id => { wearCounts[id] = (wearCounts[id] || 0) + 1; }); });
    let totalWearCount = 0;
    combo.items.forEach(id => { totalWearCount += wearCounts[id] || 0; });
    score -= totalWearCount * 2;

    // Low-wear bonus: push rarely worn items
    combo.items.forEach(id => {
      if ((wearCounts[id] || 0) <= 1) score += 5;
    });

    // Randomness factor
    score += Math.random() * 10;

    return { ...combo, score };
  }).sort((a, b) => b.score - a.score);
}

function diversePick(scored, n) {
  if (scored.length <= n) return scored;
  const picks = [scored[0]];
  for (let i = 1; i < scored.length && picks.length < n; i++) {
    const candidate = scored[i];
    // Check diversity: at least 1 different item from each existing pick
    const dominated = picks.some(p => {
      const pSet = new Set(p.items);
      return candidate.items.every(id => pSet.has(id));
    });
    if (!dominated) picks.push(candidate);
  }
  // Fill if not enough
  for (let i = 0; i < scored.length && picks.length < n; i++) {
    if (!picks.includes(scored[i])) picks.push(scored[i]);
  }
  return picks.slice(0, n);
}

function handleRecoAction(btn) {
  const action = btn.dataset.action;
  const combo = JSON.parse(btn.dataset.combo);

  if (action === 'wear') {
    // Record wear
    state.wearLog.push({
      date: new Date().toISOString(),
      items: combo,
      occasion: currentOccasion,
      temp: currentTemp
    });
    btn.classList.add('chosen');
    saveState();
    toast('已记录今日穿搭 ✓');
    renderRecentWears();
    // Show feedback modal
    setTimeout(() => showFeedbackModal(combo), 800);
  } else if (action === 'dislike') {
    showFeedbackModal(combo);
  }
}

function showFeedbackModal(combo) {
  const modal = document.getElementById('modalFeedback');
  modal.classList.remove('hidden');
  modal.querySelectorAll('.feedback-btn').forEach(btn => {
    btn.onclick = () => {
      state.feedback.push({
        date: new Date().toISOString(),
        outfitCombo: combo,
        type: btn.dataset.fb
      });
      saveState();
      modal.classList.add('hidden');
      toast(btn.dataset.fb === 'love' ? '收到 ❤️ 下次继续推荐类似搭配' : '收到反馈，会优化推荐');
    };
  });
}

async function renderRecentWears() {
  const container = document.getElementById('recentList');
  const recent = state.wearLog.slice(-5).reverse();
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-hint">还没有穿着记录</div>';
    return;
  }
  let html = '';
  for (const log of recent) {
    const firstItem = state.items.find(i => i.id === log.items[0]);
    let thumbSrc = '';
    if (firstItem) {
      thumbSrc = getImage(firstItem.imageId || firstItem.id) || '';
    }
    const d = new Date(log.date);
    const dateStr = `${d.getMonth()+1}/${d.getDate()} ${log.occasion || ''}`;
    const itemNames = log.items.map(id => {
      const it = state.items.find(x => x.id === id);
      return it ? it.category : '?';
    }).join(' + ');
    html += `<div class="recent-item">
      <img class="recent-thumb" src="${thumbSrc}" alt="">
      <div class="recent-info">
        <div class="recent-date-label">${dateStr}</div>
        <div class="recent-items-text">${itemNames}</div>
      </div>
    </div>`;
  }
  container.innerHTML = html;
}

// ============ Wardrobe Page ============
let currentCatFilter = 'all';
let currentTab = 'items';

document.getElementById('categoryFilter').addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  currentCatFilter = chip.dataset.cat;
  renderWardrobe();
});

document.querySelector('.tab-switch').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTab = btn.dataset.tab;
  document.getElementById('itemsGrid').classList.toggle('hidden', currentTab !== 'items');
  document.getElementById('outfitsGrid').classList.toggle('hidden', currentTab !== 'outfits');
  document.querySelector('.filter-bar').classList.toggle('hidden', currentTab !== 'items');
  if (currentTab === 'outfits') renderOutfits();
});

async function renderWardrobe() {
  const grid = document.getElementById('itemsGrid');
  let items = state.items;
  if (currentCatFilter !== 'all') {
    items = items.filter(i => i.category === currentCatFilter);
  }

  // Update stats
  document.getElementById('wardrobeStats').textContent =
    `${state.items.length} 件单品 · ${state.outfits.length} 套搭配`;

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">👗</div>
      <p>衣橱还是空的</p>
      <p class="empty-sub">点击下方 + 开始添加你的衣服</p>
    </div>`;
    return;
  }

  let html = '';
  for (const item of items) {
    const imgData = getImage(item.imageId || item.id);
    const wearCount = state.wearLog.filter(w => w.items.includes(item.id)).length;
    html += `<div class="grid-item" data-item-id="${item.id}">
      <img src="${imgData || ''}" alt="${item.category}">
      <div class="grid-item-label">${item.category}${item.color ? ' · ' + item.color : ''}</div>
      ${wearCount > 0 ? `<div class="grid-item-count">穿${wearCount}次</div>` : ''}
    </div>`;
  }
  grid.innerHTML = html;

  // Click to view detail
  grid.querySelectorAll('.grid-item').forEach(el => {
    el.addEventListener('click', () => showItemDetail(el.dataset.itemId));
  });
}

async function renderOutfits() {
  const grid = document.getElementById('outfitsGrid');
  if (state.outfits.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p>还没有搭配组</p></div>';
    return;
  }
  let html = '';
  for (const outfit of state.outfits) {
    const imgData = getImage(outfit.imageId);
    html += `<div class="outfit-card" data-outfit-id="${outfit.id}">
      <img src="${imgData || ''}" alt="outfit">
    </div>`;
  }
  grid.innerHTML = html;
}

async function showItemDetail(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  const modal = document.getElementById('modalItem');
  const body = document.getElementById('modalItemBody');
  document.getElementById('modalItemTitle').textContent = item.category;

  const imgData = getImage(item.imageId || item.id);
  const wearCount = state.wearLog.filter(w => w.items.includes(item.id)).length;

  body.innerHTML = `
    <img src="${imgData || ''}" style="width:100%;border-radius:10px;margin-bottom:16px" alt="">
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
      <span style="font-size:0.82rem;color:var(--grey-500)">分类：${item.category}</span>
      <span style="font-size:0.82rem;color:var(--grey-500)">颜色：${item.color || '未设置'}</span>
      <span style="font-size:0.82rem;color:var(--grey-500)">穿着：${wearCount}次</span>
    </div>
    <div style="font-size:0.82rem;color:var(--grey-500)">
      场合：${(item.occasions || []).join('、') || '未设置'}
    </div>
    <div style="font-size:0.82rem;color:var(--grey-500);margin-top:4px">
      温度：${item.tempMin ?? '?'}°C — ${item.tempMax ?? '?'}°C
    </div>
    ${item.note ? `<div style="font-size:0.82rem;color:var(--grey-600);margin-top:8px;font-style:italic">"${item.note}"</div>` : ''}
  `;
  modal.classList.remove('hidden');

  document.getElementById('btnDeleteItem').onclick = () => {
    if (confirm('确定要删除这件单品吗？')) {
      state.items = state.items.filter(i => i.id !== itemId);
      // Remove from outfits
      state.outfits.forEach(o => {
        o.itemIds = (o.itemIds || []).filter(id => id !== itemId);
      });
      deleteImage(item.imageId || item.id);
      saveState();
      modal.classList.add('hidden');
      renderWardrobe();
      toast('已删除');
    }
  };
}

document.getElementById('modalItemClose').addEventListener('click', () => {
  document.getElementById('modalItem').classList.add('hidden');
});

// ============ Add Outfit Modal ============
let addStep = 1;
let uploadedImageData = null;
let selectedTypes = [];
let itemDetails = {};

document.getElementById('fabAdd').addEventListener('click', openAddModal);

function openAddModal() {
  addStep = 1;
  uploadedImageData = null;
  selectedTypes = [];
  itemDetails = {};
  document.getElementById('modalAdd').classList.remove('hidden');
  updateAddStep();
  // Reset
  document.getElementById('uploadedPreview').classList.add('hidden');
  document.getElementById('uploadZone').classList.remove('hidden');
  document.querySelectorAll('.item-tag-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('itemsDetailList').innerHTML = '';
}

document.getElementById('modalAddClose').addEventListener('click', () => {
  document.getElementById('modalAdd').classList.add('hidden');
});

function updateAddStep() {
  [1, 2, 3].forEach(n => {
    document.getElementById(`addStep${n}`).classList.toggle('hidden', n !== addStep);
  });
  document.querySelectorAll('.step-dots .dot').forEach((d, i) => {
    d.classList.toggle('active', i === addStep - 1);
  });
  const nextBtn = document.getElementById('btnNextStep');
  nextBtn.textContent = addStep === 3 ? '保存' : '下一步';
  document.getElementById('modalAddSave').classList.toggle('hidden', addStep !== 3);
}

// Upload zone
document.getElementById('uploadZone').addEventListener('click', () => {
  document.getElementById('outfitFileInput').click();
});

document.getElementById('outfitFileInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const raw = await readFileAsDataUrl(file);
  uploadedImageData = await compressImage(raw);
  document.getElementById('uploadedImg').src = uploadedImageData;
  document.getElementById('uploadedPreview').classList.remove('hidden');
  document.getElementById('uploadZone').classList.add('hidden');
});

document.getElementById('btnReupload').addEventListener('click', () => {
  document.getElementById('uploadedPreview').classList.add('hidden');
  document.getElementById('uploadZone').classList.remove('hidden');
  document.getElementById('outfitFileInput').value = '';
  uploadedImageData = null;
});

// Item type selection
document.getElementById('itemTagGrid').addEventListener('click', e => {
  const btn = e.target.closest('.item-tag-btn');
  if (!btn) return;
  btn.classList.toggle('active');
  const type = btn.dataset.type;
  if (selectedTypes.includes(type)) {
    selectedTypes = selectedTypes.filter(t => t !== type);
    delete itemDetails[type];
  } else {
    selectedTypes.push(type);
    itemDetails[type] = { color: '', extraImage: null };
  }
  renderItemDetails();
});

function renderItemDetails() {
  const container = document.getElementById('itemsDetailList');
  if (selectedTypes.length === 0) {
    container.innerHTML = '';
    return;
  }
  let html = '';
  for (const type of selectedTypes) {
    const detail = itemDetails[type] || {};
    let colorDots = COLORS.map(c => {
      const bg = c.hex.startsWith('conic') ? c.hex : c.hex;
      const active = detail.color === c.name ? 'active' : '';
      return `<div class="color-dot ${active}" data-type="${type}" data-color="${c.name}" style="background:${bg}"></div>`;
    }).join('');

    html += `<div class="item-detail-card">
      <div class="idc-header">
        <span class="idc-type">${type}</span>
        <button class="idc-upload-extra" data-type="${type}">+ 补充照片</button>
      </div>
      <div class="idc-row">${colorDots}</div>
      <input type="file" class="extra-img-input" data-type="${type}" accept="image/*" hidden>
    </div>`;
  }
  container.innerHTML = html;

  // Color dot clicks
  container.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const type = dot.dataset.type;
      itemDetails[type].color = dot.dataset.color;
      // Update visual
      container.querySelectorAll(`.color-dot[data-type="${type}"]`).forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Extra image upload
  container.querySelectorAll('.idc-upload-extra').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelector(`.extra-img-input[data-type="${btn.dataset.type}"]`).click();
    });
  });
  container.querySelectorAll('.extra-img-input').forEach(input => {
    input.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      const raw = await readFileAsDataUrl(file);
      const compressed = await compressImage(raw);
      itemDetails[input.dataset.type].extraImage = compressed;
      toast(`${input.dataset.type}的补充照片已添加`);
    });
  });
}

// Next step / Save
document.getElementById('btnNextStep').addEventListener('click', handleNextStep);
document.getElementById('modalAddSave').addEventListener('click', handleSave);

function handleNextStep() {
  if (addStep === 1) {
    if (!uploadedImageData) { toast('请先上传搭配照片'); return; }
    addStep = 2;
  } else if (addStep === 2) {
    if (selectedTypes.length === 0) { toast('请选择这套搭配里包含的单品'); return; }
    addStep = 3;
  } else if (addStep === 3) {
    handleSave();
    return;
  }
  updateAddStep();
}

async function handleSave() {
  // Collect outfit meta
  const occasions = [];
  document.querySelectorAll('#addOccasionTags .tag-btn-sm.active').forEach(b => {
    occasions.push(b.dataset.occ);
  });
  const tempMin = parseInt(document.getElementById('tempMin').value);
  const tempMax = parseInt(document.getElementById('tempMax').value);
  const note = document.getElementById('outfitNote').value.trim();

  // Save outfit image
  const outfitId = uid();
  const outfitImgId = 'outfit_' + outfitId;
  saveImage(outfitImgId, uploadedImageData);

  // Create individual items
  const itemIds = [];
  for (const type of selectedTypes) {
    const detail = itemDetails[type] || {};
    const itemId = uid();
    const imgId = 'item_' + itemId;

    // Use extra image if provided, else use outfit image
    const imgData = detail.extraImage || uploadedImageData;
    saveImage(imgId, imgData);

    state.items.push({
      id: itemId,
      imageId: imgId,
      category: type,
      color: detail.color || '',
      occasions: occasions,
      tempMin: Math.min(tempMin, tempMax),
      tempMax: Math.max(tempMin, tempMax),
      note: note,
      createdAt: new Date().toISOString()
    });
    itemIds.push(itemId);
  }

  // Create outfit group
  state.outfits.push({
    id: outfitId,
    imageId: outfitImgId,
    itemIds: itemIds,
    occasions: occasions,
    tempMin: Math.min(tempMin, tempMax),
    tempMax: Math.max(tempMin, tempMax),
    note: note,
    createdAt: new Date().toISOString()
  });

  saveState();
  document.getElementById('modalAdd').classList.add('hidden');
  renderWardrobe();
  toast(`已添加 ${selectedTypes.length} 件单品`);
}

// Occasion tags in add modal
document.getElementById('addOccasionTags').addEventListener('click', e => {
  const btn = e.target.closest('.tag-btn-sm');
  if (btn) btn.classList.toggle('active');
});

// Temp range labels
['tempMin', 'tempMax'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const min = document.getElementById('tempMin').value;
    const max = document.getElementById('tempMax').value;
    document.getElementById('tempRangeLabel').textContent = `${min}°C — ${max}°C`;
  });
});

// ============ Profile Page ============
function initProfile() {
  const p = state.profile;
  document.getElementById('inputNickname').value = p.nickname || '';
  document.getElementById('inputHeight').value = p.height || '';
  document.getElementById('inputWeight').value = p.weight || '';
  document.getElementById('cooldownValue').textContent = state.settings.cooldown;
  if (p.nickname) {
    document.getElementById('profileName').textContent = p.nickname;
  }
  // Style tags
  document.querySelectorAll('.style-tag').forEach(tag => {
    tag.classList.toggle('active', (p.styles || []).includes(tag.dataset.style));
  });
  // Avatar
  if (p.avatar) {
    getImage(p.avatar).then(data => {
      if (data) {
        const img = document.getElementById('avatarImg');
        img.src = data;
        img.classList.remove('hidden');
      }
    });
  }
}

document.getElementById('avatarWrap').addEventListener('click', () => {
  document.getElementById('avatarInput').click();
});

document.getElementById('avatarInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const raw = await readFileAsDataUrl(file);
  const compressed = await compressImage(raw, 400);
  const avatarId = 'avatar_main';
  saveImage(avatarId, compressed);
  state.profile.avatar = avatarId;
  saveState();
  const img = document.getElementById('avatarImg');
  img.src = compressed;
  img.classList.remove('hidden');
});

document.querySelectorAll('.style-tag').forEach(tag => {
  tag.addEventListener('click', () => tag.classList.toggle('active'));
});

document.getElementById('btnSaveProfile').addEventListener('click', () => {
  state.profile.nickname = document.getElementById('inputNickname').value.trim();
  state.profile.height = document.getElementById('inputHeight').value.trim();
  state.profile.weight = document.getElementById('inputWeight').value.trim();
  state.profile.styles = [];
  document.querySelectorAll('.style-tag.active').forEach(t => {
    state.profile.styles.push(t.dataset.style);
  });
  saveState();
  document.getElementById('profileName').textContent = state.profile.nickname || '设置你的档案';
  toast('档案已保存 ✓');
  initHome();
});

// Cooldown stepper
document.querySelectorAll('.stepper-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const delta = parseInt(btn.dataset.delta);
    state.settings.cooldown = Math.max(1, Math.min(30, state.settings.cooldown + delta));
    document.getElementById('cooldownValue').textContent = state.settings.cooldown;
    saveState();
  });
});

// ============ Export / Import ============
document.getElementById('btnExport').addEventListener('click', async () => {
  toast('正在打包数据...');
  const images = getAllImages();
  const exportData = {
    version: 1,
    state: state,
    images: images,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `suri_vogue_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('数据已导出 ✓');
});

document.getElementById('btnImport').addEventListener('click', () => {
  document.getElementById('importInput').click();
});

document.getElementById('importInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  toast('正在导入...');
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.version !== 1) { toast('不兼容的备份版本'); return; }
    // Restore state
    state = { ...defaultState(), ...data.state };
    saveState();
    // Restore images
    if (data.images) {
      for (const img of data.images) {
        saveImage(img.id, img.data);
      }
    }
    toast('数据导入成功 ✓');
    initProfile();
    renderWardrobe();
    initHome();
  } catch (err) {
    toast('导入失败，文件格式不对');
    console.error(err);
  }
});

// ============ Navigation Binding ============
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// ============ Init ============
function init() {
  loadState();
  initHome();
  initProfile();
  renderWardrobe();

  // Remove splash after animation
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) splash.remove();
  }, 2600);

  // Hide FAB initially on non-wardrobe pages
  document.getElementById('fabAdd').style.display = 'none';
}

init();
