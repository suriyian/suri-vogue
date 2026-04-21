/* ============================================
   SURI VOGUE — App Logic v2
   Batch upload, per-image confirm, multi-photo items
   ============================================ */

// ============ Data Layer (Pure LocalStorage) ============
const IMG_PREFIX = 'sv_img_';
function saveImage(id, dataUrl) {
  try { localStorage.setItem(IMG_PREFIX + id, dataUrl); } catch(e) { console.warn('Storage full', e); }
}
function getImage(id) { return localStorage.getItem(IMG_PREFIX + id) || null; }
function deleteImage(id) { localStorage.removeItem(IMG_PREFIX + id); }
function getAllImages() {
  const imgs = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(IMG_PREFIX)) imgs.push({ id: key.slice(IMG_PREFIX.length), data: localStorage.getItem(key) });
  }
  return imgs;
}

// ============ State ============
const STATE_KEY = 'garderobe_state';
function defaultState() {
  return { profile: { nickname:'',height:'',weight:'',avatar:'',styles:[] }, settings: { cooldown:7 }, items:[], outfits:[], wearLog:[], feedback:[] };
}
let state = defaultState();
function loadState() { try { const r=localStorage.getItem(STATE_KEY); if(r){state={...defaultState(),...JSON.parse(r)};} } catch(e){} }
function saveState() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }

// ============ Utility ============
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function toast(msg) { const el=document.getElementById('toast'); el.textContent=msg; el.classList.remove('hidden'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.add('hidden'),2000); }
function formatDate(d) { const days=['日','一','二','三','四','五','六']; return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${days[d.getDay()]}`; }
function readFileAsDataUrl(file) { return new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(file);}); }
async function compressImage(dataUrl,maxW=800) { return new Promise(r=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');let w=img.width,h=img.height;if(w>maxW){h=h*maxW/w;w=maxW;}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);r(c.toDataURL('image/jpeg',0.8));};img.src=dataUrl;}); }

const COLORS = [
  {name:'黑',hex:'#1a1a1a'},{name:'白',hex:'#f5f5f5'},{name:'灰',hex:'#9e9e9e'},{name:'米',hex:'#e8dcc8'},
  {name:'棕',hex:'#8b6f47'},{name:'驼',hex:'#c4a67d'},{name:'藏蓝',hex:'#1a365d'},{name:'蓝',hex:'#3b82f6'},
  {name:'红',hex:'#c0392b'},{name:'粉',hex:'#e8a0bf'},{name:'绿',hex:'#2d6a4f'},{name:'紫',hex:'#7c3aed'},
  {name:'黄',hex:'#eab308'},{name:'橙',hex:'#ea580c'},
  {name:'花色',hex:'conic-gradient(#c0392b,#eab308,#2d6a4f,#3b82f6,#c0392b)'},
];

// ============ Navigation ============
const pages = ['home','wardrobe','profile'];
let currentPage = 'home';
function navigateTo(page) {
  currentPage=page;
  pages.forEach(p=>document.getElementById(`page-${p}`).classList.toggle('active',p===page));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  const titles={home:'SURI VOGUE',wardrobe:'我的衣橱',profile:'个人档案'};
  document.getElementById('topbarTitle').textContent=titles[page]||'SURI VOGUE';
  document.getElementById('fabAdd').style.display=page==='wardrobe'?'flex':'none';
}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigateTo(b.dataset.page)));

// ============ Daily Quotes ============
const DAILY_QUOTES = [
  {text:'云想衣裳花想容',source:'李白'},{text:'当时只道是寻常',source:'纳兰性德'},
  {text:'人生若只如初见',source:'纳兰性德'},{text:'陌上花开，可缓缓归矣',source:'钱镠'},
  {text:'山中何事？松花酿酒，春水煎茶',source:'张可久'},{text:'此心安处是吾乡',source:'苏轼'},
  {text:'一身诗意千寻瀑，万古人间四月天',source:'林徽因'},{text:'你要做一个不动声色的大人了',source:'村上春树'},
  {text:'凡是过往，皆为序章',source:'Shakespeare'},{text:'生活是很狭隘的，但是请保持优雅',source:'Coco Chanel'},
  {text:'简单是复杂的终极形态',source:'Leonardo da Vinci'},{text:'穿不好没关系，关键是穿出自己',source:'YSL'},
  {text:'时尚会褪色，风格永存',source:'Coco Chanel'},{text:'优雅不在于你穿了什么，而在于你是谁',source:'Givenchy'},
  {text:'少即是多',source:'Mies van der Rohe'},{text:'人间有味是清欢',source:'苏轼'},
  {text:'浮生若梦，为欢几何',source:'李白'},{text:'落花人独立，微雨燕双飞',source:'晏几道'},
  {text:'万物皆有裂痕，那是光照进来的地方',source:'Leonard Cohen'},{text:'我不想谋生，我想生活',source:'Oscar Wilde'},
  {text:'行到水穷处，坐看云起时',source:'王维'},{text:'且将新火试新茶，诗酒趁年华',source:'苏轼'},
  {text:'世间始终你好',source:'金庸'},{text:'风雅，就是发现存在之美',source:'川端康成'},
  {text:'何须浅碧深红色，自是花中第一流',source:'李清照'},{text:'不乱于心，不困于情，不畏将来，不念过往',source:'丰子恺'},
  {text:'每一个不曾起舞的日子，都是对生命的辜负',source:'Nietzsche'},
  {text:'春有百花秋有月，夏有凉风冬有雪',source:'无门慧开'},
  {text:'温柔半两，从容一生',source:'佚名'},{text:'日日是好日',source:'禅语'},
  {text:'她那时候还太年轻，不知道所有命运赠送的礼物，早已在暗中标好了价格',source:'Stefan Zweig'},
];
function getDailyQuote() { const d=Math.floor(Date.now()/86400000); return DAILY_QUOTES[d%DAILY_QUOTES.length]; }

// ============ Home Page ============
function initHome() {
  document.getElementById('homeDate').textContent=formatDate(new Date());
  const q=getDailyQuote();
  document.getElementById('homeGreeting').innerHTML=`<span class="quote-text">${q.text}</span><span class="quote-source">— ${q.source}</span>`;
  renderRecentWears();
}

let currentTemp=22;
document.querySelectorAll('.temp-btn').forEach(b=>b.addEventListener('click',()=>{
  currentTemp+=parseInt(b.dataset.delta); currentTemp=Math.max(-10,Math.min(45,currentTemp));
  document.getElementById('tempValue').textContent=currentTemp;
}));

let currentOccasion='通勤';
document.getElementById('occasionTags').addEventListener('click',e=>{
  const b=e.target.closest('.tag-btn'); if(!b)return;
  document.querySelectorAll('#occasionTags .tag-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); currentOccasion=b.dataset.occasion;
});

// ============ Recommendation Engine ============
document.getElementById('btnRecommend').addEventListener('click',generateRecommendations);
document.getElementById('btnRefresh').addEventListener('click',generateRecommendations);

function generateRecommendations() {
  if(state.items.length<2){toast('衣橱里的衣服还不够哦，先去添加吧');return;}
  const pool=filterPool(currentTemp,currentOccasion);
  const combos=buildCombos(pool);
  const scored=scoreCombos(combos);
  const top3=diversePick(scored,3);
  const container=document.getElementById('recommendations');
  const list=document.getElementById('recoList');
  container.classList.remove('hidden'); list.innerHTML='';
  if(top3.length===0){list.innerHTML='<div class="empty-hint">没找到合适的搭配，试试调整温度或场合？</div>';return;}
  for(let i=0;i<top3.length;i++){
    const combo=top3[i]; const card=document.createElement('div'); card.className='reco-card';
    const labels=['LOOK A','LOOK B','LOOK C'];
    let imgsHtml='';
    for(const itemId of combo.items){
      const item=state.items.find(x=>x.id===itemId); if(!item)continue;
      const imgData=getImage(item.imageId||item.id);
      imgsHtml+=`<img class="reco-item-img" src="${imgData||''}" alt="${item.category}">`;
    }
    const desc=combo.items.map(id=>{const it=state.items.find(x=>x.id===id);return it?it.category:'';}).join(' + ');
    card.innerHTML=`<span class="reco-card-label">${labels[i]}</span><div class="reco-items">${imgsHtml}</div>
      <div class="reco-bottom"><span class="reco-desc">${desc}</span><div class="reco-actions">
      <button class="reco-action-btn" data-action="dislike" data-combo='${JSON.stringify(combo.items)}'>👎</button>
      <button class="reco-action-btn" data-action="wear" data-combo='${JSON.stringify(combo.items)}'>👗</button></div></div>`;
    list.appendChild(card);
  }
  list.querySelectorAll('.reco-action-btn').forEach(b=>b.addEventListener('click',()=>handleRecoAction(b)));
}

function filterPool(temp,occasion){
  const now=Date.now(),cd=state.settings.cooldown*86400000,recent=new Set();
  state.wearLog.forEach(w=>{if(now-new Date(w.date).getTime()<cd)w.items.forEach(id=>recent.add(id));});
  return state.items.filter(item=>{
    const tMin=item.tempMin??-10,tMax=item.tempMax??40;
    if(temp<tMin||temp>tMax)return false;
    if(item.occasions&&item.occasions.length>0&&!item.occasions.includes(occasion))return false;
    if(recent.has(item.id))return false; return true;
  });
}
function buildCombos(pool){
  const tops=pool.filter(i=>i.category==='上装'),bots=pool.filter(i=>i.category==='下装'),
    outs=pool.filter(i=>i.category==='外套'),dresses=pool.filter(i=>i.category==='连衣裙'),
    shoes=pool.filter(i=>i.category==='鞋子');
  const combos=[],needOuter=currentTemp<15;
  for(const t of tops)for(const b of bots){
    const items=[t.id,b.id];
    if(needOuter&&outs.length>0)for(const o of outs)combos.push({items:[...items,o.id]});
    else combos.push({items});
  }
  for(const d of dresses){const items=[d.id];
    if(needOuter&&outs.length>0)for(const o of outs)combos.push({items:[...items,o.id]});
    else combos.push({items});
  }
  if(shoes.length>0){const ex=[];for(const c of combos)for(const s of shoes)ex.push({items:[...c.items,s.id]});return ex.length>0?ex:combos;}
  return combos;
}
function scoreCombos(combos){
  const wearCounts={};state.wearLog.forEach(w=>w.items.forEach(id=>{wearCounts[id]=(wearCounts[id]||0)+1;}));
  return combos.map(combo=>{let score=50;
    for(const o of state.outfits){const s=new Set(o.itemIds||[]);const m=combo.items.filter(id=>s.has(id)).length;if(m>=2)score+=15*m;}
    for(const fb of state.feedback){if(fb.type==='love'){const s=new Set(fb.outfitCombo||[]);const m=combo.items.filter(id=>s.has(id)).length;if(m>=2)score+=8*m;}
      else{const s=new Set(fb.outfitCombo||[]);const m=combo.items.filter(id=>s.has(id)).length;if(m>=2)score-=10*m;}}
    const colors=combo.items.map(id=>{const it=state.items.find(x=>x.id===id);return it?.color||'';}).filter(Boolean);
    if(colors.length>0){if(new Set(colors).size<=3)score+=5;const neutrals=['黑','白','灰','米','驼'];score+=colors.filter(c=>neutrals.includes(c)).length*3;}
    combo.items.forEach(id=>{score-=(wearCounts[id]||0)*2;if((wearCounts[id]||0)<=1)score+=5;});
    score+=Math.random()*10;return{...combo,score};
  }).sort((a,b)=>b.score-a.score);
}
function diversePick(scored,n){
  if(scored.length<=n)return scored;const picks=[scored[0]];
  for(let i=1;i<scored.length&&picks.length<n;i++){const c=scored[i];if(!picks.some(p=>{const s=new Set(p.items);return c.items.every(id=>s.has(id));}))picks.push(c);}
  for(let i=0;i<scored.length&&picks.length<n;i++)if(!picks.includes(scored[i]))picks.push(scored[i]);
  return picks.slice(0,n);
}
function handleRecoAction(btn){
  const action=btn.dataset.action,combo=JSON.parse(btn.dataset.combo);
  if(action==='wear'){state.wearLog.push({date:new Date().toISOString(),items:combo,occasion:currentOccasion,temp:currentTemp});
    btn.classList.add('chosen');saveState();toast('已记录今日穿搭 ✓');renderRecentWears();setTimeout(()=>showFeedbackModal(combo),800);
  }else showFeedbackModal(combo);
}
function showFeedbackModal(combo){
  const modal=document.getElementById('modalFeedback');modal.classList.remove('hidden');
  modal.querySelectorAll('.feedback-btn').forEach(b=>{b.onclick=()=>{
    state.feedback.push({date:new Date().toISOString(),outfitCombo:combo,type:b.dataset.fb});saveState();modal.classList.add('hidden');
    toast(b.dataset.fb==='love'?'收到 ❤️':'收到反馈，会优化推荐');};});
}
function renderRecentWears(){
  const c=document.getElementById('recentList'),recent=state.wearLog.slice(-5).reverse();
  if(recent.length===0){c.innerHTML='<div class="empty-hint">还没有穿着记录</div>';return;}
  c.innerHTML=recent.map(log=>{
    const first=state.items.find(i=>i.id===log.items[0]);const thumb=first?getImage(first.imageId||first.id)||'':'';
    const d=new Date(log.date),ds=`${d.getMonth()+1}/${d.getDate()} ${log.occasion||''}`;
    const names=log.items.map(id=>{const it=state.items.find(x=>x.id===id);return it?it.category:'?';}).join(' + ');
    return `<div class="recent-item"><img class="recent-thumb" src="${thumb}" alt=""><div class="recent-info"><div class="recent-date-label">${ds}</div><div class="recent-items-text">${names}</div></div></div>`;
  }).join('');
}

// ============ Wardrobe Page ============
let currentCatFilter='all',currentTab='items';
document.getElementById('categoryFilter').addEventListener('click',e=>{
  const c=e.target.closest('.filter-chip');if(!c)return;
  document.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');
  currentCatFilter=c.dataset.cat;renderWardrobe();
});
document.querySelector('.tab-switch').addEventListener('click',e=>{
  const b=e.target.closest('.tab-btn');if(!b)return;
  document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  currentTab=b.dataset.tab;
  document.getElementById('itemsGrid').classList.toggle('hidden',currentTab!=='items');
  document.getElementById('outfitsGrid').classList.toggle('hidden',currentTab!=='outfits');
  document.querySelector('.filter-bar').classList.toggle('hidden',currentTab!=='items');
  if(currentTab==='outfits')renderOutfits();
});

function renderWardrobe(){
  const grid=document.getElementById('itemsGrid');
  let items=state.items;if(currentCatFilter!=='all')items=items.filter(i=>i.category===currentCatFilter);
  document.getElementById('wardrobeStats').textContent=`${state.items.length} 件单品 · ${state.outfits.length} 套搭配`;
  if(items.length===0){grid.innerHTML=`<div class="empty-state"><div class="empty-icon">👗</div><p>衣橱还是空的</p><p class="empty-sub">点击下方 + 开始添加</p></div>`;return;}
  grid.innerHTML=items.map(item=>{
    const img=getImage(item.imageId||item.id);const wc=state.wearLog.filter(w=>w.items.includes(item.id)).length;
    return `<div class="grid-item" data-item-id="${item.id}"><img src="${img||''}" alt="${item.category}"><div class="grid-item-label">${item.category}${item.color?' · '+item.color:''}</div>${wc>0?`<div class="grid-item-count">穿${wc}次</div>`:''}</div>`;
  }).join('');
  grid.querySelectorAll('.grid-item').forEach(el=>el.addEventListener('click',()=>showItemDetail(el.dataset.itemId)));
}
function renderOutfits(){
  const grid=document.getElementById('outfitsGrid');
  if(state.outfits.length===0){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><p>还没有搭配组</p></div>';return;}
  grid.innerHTML=state.outfits.map(o=>{const img=getImage(o.imageId);return `<div class="outfit-card"><img src="${img||''}" alt="outfit"></div>`;}).join('');
}

// ============ Add Items (Batch Upload + Per-Image Confirm) ============
let batchImages=[], currentBatchIdx=0, confirmSelectedTypes=[], confirmItemDetails={};

document.getElementById('fabAdd').addEventListener('click',openAddModal);
function openAddModal(){
  batchImages=[];currentBatchIdx=0;confirmSelectedTypes=[];confirmItemDetails={};
  document.getElementById('modalAdd').classList.remove('hidden');
  document.getElementById('phaseUpload').classList.remove('hidden');
  document.getElementById('phaseConfirm').classList.add('hidden');
  document.getElementById('uploadThumbs').innerHTML='';
  document.getElementById('btnConfirmItem').textContent='开始确认';
  document.getElementById('btnConfirmItem').onclick=startConfirm;
  document.getElementById('footerHint').textContent='';
  document.getElementById('modalProgress').textContent='';
  document.getElementById('modalAddTitle').textContent='添加衣服';
}
document.getElementById('modalAddClose').addEventListener('click',()=>document.getElementById('modalAdd').classList.add('hidden'));

document.getElementById('uploadZone').addEventListener('click',()=>document.getElementById('batchFileInput').click());
document.getElementById('batchFileInput').addEventListener('change',async e=>{
  const files=Array.from(e.target.files).slice(0,5);if(files.length===0)return;
  document.getElementById('footerHint').textContent='处理中...';batchImages=[];
  for(const f of files){const raw=await readFileAsDataUrl(f);batchImages.push(await compressImage(raw));}
  document.getElementById('uploadThumbs').innerHTML=batchImages.map((img,i)=>`<div class="upload-thumb-item"><img src="${img}" alt=""><div class="thumb-idx">${i+1}</div></div>`).join('');
  document.getElementById('footerHint').textContent=`已选 ${batchImages.length} 张`;
  document.getElementById('btnConfirmItem').textContent='开始确认';e.target.value='';
});

function startConfirm(){if(batchImages.length===0){toast('请先选择照片');return;}currentBatchIdx=0;showConfirmForImage(0);}

function showConfirmForImage(idx){
  document.getElementById('phaseUpload').classList.add('hidden');
  document.getElementById('phaseConfirm').classList.remove('hidden');
  document.getElementById('confirmImg').src=batchImages[idx];
  document.getElementById('modalAddTitle').textContent='确认入库';
  document.getElementById('modalProgress').textContent=`${idx+1} / ${batchImages.length}`;
  document.getElementById('confirmTitle').textContent='这张图里有什么？';
  confirmSelectedTypes=[];confirmItemDetails={};
  document.querySelectorAll('#confirmTagGrid .item-tag-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('confirmDetails').innerHTML='';
  document.querySelectorAll('#confirmOccasions .tag-btn-sm').forEach(b=>b.classList.remove('active'));
  const isLast=idx===batchImages.length-1;
  const btn=document.getElementById('btnConfirmItem');
  btn.textContent=isLast?'确认入库':'确认 → 下一张';
  btn.onclick=()=>confirmCurrentItem(isLast);
  document.getElementById('footerHint').textContent='';
}

document.getElementById('confirmTagGrid').addEventListener('click',e=>{
  const b=e.target.closest('.item-tag-btn');if(!b)return;b.classList.toggle('active');
  const type=b.dataset.type;
  if(confirmSelectedTypes.includes(type)){confirmSelectedTypes=confirmSelectedTypes.filter(t=>t!==type);delete confirmItemDetails[type];}
  else{confirmSelectedTypes.push(type);confirmItemDetails[type]={color:''};}
  renderConfirmDetails();
});

function renderConfirmDetails(){
  const c=document.getElementById('confirmDetails');
  if(confirmSelectedTypes.length===0){c.innerHTML='';return;}
  c.innerHTML=confirmSelectedTypes.map(type=>{
    const det=confirmItemDetails[type]||{};
    const dots=COLORS.map(cl=>`<div class="color-dot ${det.color===cl.name?'active':''}" data-type="${type}" data-color="${cl.name}" style="background:${cl.hex}"></div>`).join('');
    return `<div class="item-detail-card"><div class="idc-header"><span class="idc-type">${type}</span></div><div class="idc-row">${dots}</div></div>`;
  }).join('');
  c.querySelectorAll('.color-dot').forEach(d=>d.addEventListener('click',()=>{
    confirmItemDetails[d.dataset.type].color=d.dataset.color;
    c.querySelectorAll(`.color-dot[data-type="${d.dataset.type}"]`).forEach(x=>x.classList.remove('active'));d.classList.add('active');
  }));
}

document.getElementById('confirmOccasions').addEventListener('click',e=>{const b=e.target.closest('.tag-btn-sm');if(b)b.classList.toggle('active');});
['confirmTempMin','confirmTempMax'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{
  document.getElementById('confirmTempLabel').textContent=`${document.getElementById('confirmTempMin').value}°C — ${document.getElementById('confirmTempMax').value}°C`;
}));

function confirmCurrentItem(isLast){
  if(confirmSelectedTypes.length===0){toast('请至少选择一个单品类别');return;}
  const occasions=[];document.querySelectorAll('#confirmOccasions .tag-btn-sm.active').forEach(b=>occasions.push(b.dataset.occ));
  const tMin=parseInt(document.getElementById('confirmTempMin').value),tMax=parseInt(document.getElementById('confirmTempMax').value);
  const imgData=batchImages[currentBatchIdx];
  const outfitId=uid(),outfitImgId='outfit_'+outfitId;
  if(confirmSelectedTypes.length>1)saveImage(outfitImgId,imgData);
  const itemIds=[];
  for(const type of confirmSelectedTypes){
    const det=confirmItemDetails[type]||{},itemId=uid(),imgId='item_'+itemId;
    saveImage(imgId,imgData);
    state.items.push({id:itemId,imageId:imgId,images:[imgId],category:type,color:det.color||'',occasions,tempMin:Math.min(tMin,tMax),tempMax:Math.max(tMin,tMax),createdAt:new Date().toISOString()});
    itemIds.push(itemId);
  }
  if(confirmSelectedTypes.length>1)state.outfits.push({id:outfitId,imageId:outfitImgId,itemIds,occasions,tempMin:Math.min(tMin,tMax),tempMax:Math.max(tMin,tMax),createdAt:new Date().toISOString()});
  saveState();toast(`已入库 ${confirmSelectedTypes.length} 件单品`);
  if(isLast){document.getElementById('modalAdd').classList.add('hidden');renderWardrobe();}
  else{currentBatchIdx++;showConfirmForImage(currentBatchIdx);}
}

// ============ Item Detail (Multi-Photo) ============
function showItemDetail(itemId){
  const item=state.items.find(i=>i.id===itemId);if(!item)return;
  const modal=document.getElementById('modalItem'),body=document.getElementById('modalItemBody');
  document.getElementById('modalItemTitle').textContent=item.category;
  const imageIds=item.images||[item.imageId||item.id];
  const wc=state.wearLog.filter(w=>w.items.includes(item.id)).length;
  let ph='<div class="item-photos">';
  for(const imgId of imageIds){const d=getImage(imgId);if(d)ph+=`<img class="item-photo-thumb" src="${d}" alt="">`;}
  ph+='<button class="add-photo-btn" id="btnAddItemPhoto">+</button></div><input type="file" id="addItemPhotoInput" accept="image/*" hidden>';
  body.innerHTML=`${ph}
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
      <span style="font-size:0.82rem;color:var(--grey-500)">分类：${item.category}</span>
      <span style="font-size:0.82rem;color:var(--grey-500)">颜色：${item.color||'未设置'}</span>
      <span style="font-size:0.82rem;color:var(--grey-500)">穿着：${wc}次</span>
    </div>
    <div style="font-size:0.82rem;color:var(--grey-500)">场合：${(item.occasions||[]).join('、')||'未设置'}</div>
    <div style="font-size:0.82rem;color:var(--grey-500);margin-top:4px">温度：${item.tempMin??'?'}°C — ${item.tempMax??'?'}°C</div>`;
  modal.classList.remove('hidden');
  body.querySelector('#btnAddItemPhoto').addEventListener('click',()=>body.querySelector('#addItemPhotoInput').click());
  body.querySelector('#addItemPhotoInput').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;const raw=await readFileAsDataUrl(f);const comp=await compressImage(raw);
    const nid='item_'+uid();saveImage(nid,comp);if(!item.images)item.images=[item.imageId||item.id];
    item.images.push(nid);saveState();toast('照片已添加');showItemDetail(itemId);
  });
  document.getElementById('btnDeleteItem').onclick=()=>{if(confirm('确定删除？')){
    state.items=state.items.filter(i=>i.id!==itemId);state.outfits.forEach(o=>{o.itemIds=(o.itemIds||[]).filter(id=>id!==itemId);});
    (item.images||[item.imageId||item.id]).forEach(id=>deleteImage(id));saveState();modal.classList.add('hidden');renderWardrobe();toast('已删除');}};
}
document.getElementById('modalItemClose').addEventListener('click',()=>document.getElementById('modalItem').classList.add('hidden'));

// ============ Profile Page ============
function initProfile(){
  const p=state.profile;
  document.getElementById('inputNickname').value=p.nickname||'';
  document.getElementById('inputHeight').value=p.height||'';
  document.getElementById('inputWeight').value=p.weight||'';
  document.getElementById('cooldownValue').textContent=state.settings.cooldown;
  if(p.nickname)document.getElementById('profileName').textContent=p.nickname;
  document.querySelectorAll('.style-tag').forEach(t=>t.classList.toggle('active',(p.styles||[]).includes(t.dataset.style)));
  if(p.avatar){const d=getImage(p.avatar);if(d){const img=document.getElementById('avatarImg');img.src=d;img.classList.remove('hidden');}}
}
document.getElementById('avatarWrap').addEventListener('click',()=>document.getElementById('avatarInput').click());
document.getElementById('avatarInput').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;const raw=await readFileAsDataUrl(f);const comp=await compressImage(raw,400);
  saveImage('avatar_main',comp);state.profile.avatar='avatar_main';saveState();
  const img=document.getElementById('avatarImg');img.src=comp;img.classList.remove('hidden');
});
document.querySelectorAll('.style-tag').forEach(t=>t.addEventListener('click',()=>t.classList.toggle('active')));
document.getElementById('btnSaveProfile').addEventListener('click',()=>{
  state.profile.nickname=document.getElementById('inputNickname').value.trim();
  state.profile.height=document.getElementById('inputHeight').value.trim();
  state.profile.weight=document.getElementById('inputWeight').value.trim();
  state.profile.styles=[];document.querySelectorAll('.style-tag.active').forEach(t=>state.profile.styles.push(t.dataset.style));
  saveState();document.getElementById('profileName').textContent=state.profile.nickname||'设置你的档案';toast('档案已保存 ✓');initHome();
});
document.querySelectorAll('.stepper-btn').forEach(b=>b.addEventListener('click',()=>{
  state.settings.cooldown=Math.max(1,Math.min(30,state.settings.cooldown+parseInt(b.dataset.delta)));
  document.getElementById('cooldownValue').textContent=state.settings.cooldown;saveState();
}));

// ============ Export / Import ============
document.getElementById('btnExport').addEventListener('click',()=>{
  toast('正在打包...');const images=getAllImages();
  const blob=new Blob([JSON.stringify({version:1,state,images,exportedAt:new Date().toISOString()})],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`suri_vogue_backup_${new Date().toISOString().slice(0,10)}.json`;a.click();toast('已导出 ✓');
});
document.getElementById('btnImport').addEventListener('click',()=>document.getElementById('importInput').click());
document.getElementById('importInput').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;toast('导入中...');
  try{const data=JSON.parse(await f.text());if(data.version!==1){toast('版本不兼容');return;}
    state={...defaultState(),...data.state};saveState();if(data.images)data.images.forEach(img=>saveImage(img.id,img.data));
    toast('导入成功 ✓');initProfile();renderWardrobe();initHome();
  }catch(err){toast('导入失败');console.error(err);}
});

// ============ Init ============
function init(){
  loadState();initHome();initProfile();renderWardrobe();
  setTimeout(()=>{const s=document.getElementById('splash');if(s)s.remove();},2600);
  document.getElementById('fabAdd').style.display='none';
}
init();
