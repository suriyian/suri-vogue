/* SURI VOGUE v4 */
const IP='sv_img_';
function sI(id,d){try{localStorage.setItem(IP+id,d);return true}catch(e){toast('存储空间不足');return false}}
function gI(id){return localStorage.getItem(IP+id)||null}
function dI(id){localStorage.removeItem(IP+id)}
function allI(){const r=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(IP))r.push({id:k.slice(IP.length),data:localStorage.getItem(k)})}return r}

const SK='sv_state';
function defS(){return{profile:{nickname:'',height:'',weight:'',avatar:''},settings:{cooldown:7},items:[],outfits:[],inspos:[],wearLog:[],feedback:[]}}
let S=defS();
function ldS(){try{const r=localStorage.getItem(SK);if(r)S={...defS(),...JSON.parse(r)};if(!S.inspos)S.inspos=[]}catch(e){}}
function svS(){localStorage.setItem(SK,JSON.stringify(S))}

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function toast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.remove('hidden');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.add('hidden'),2200)}
function readF(f){return new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(f)})}
async function comp(url){return new Promise(r=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');let w=img.width,h=img.height;if(w>600){h=h*600/w;w=600}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);r(c.toDataURL('image/jpeg',.6))};img.src=url})}

const COLORS=[{n:'黑',h:'#1a1a1a'},{n:'白',h:'#f5f5f5'},{n:'灰',h:'#9e9e9e'},{n:'米',h:'#e8dcc8'},{n:'棕',h:'#8b6f47'},{n:'驼',h:'#c4a67d'},{n:'藏蓝',h:'#1a365d'},{n:'蓝',h:'#3b82f6'},{n:'红',h:'#c0392b'},{n:'粉',h:'#e8a0bf'},{n:'绿',h:'#2d6a4f'},{n:'紫',h:'#7c3aed'},{n:'黄',h:'#eab308'},{n:'橙',h:'#ea580c'}];

const HEROES=[
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=800&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
];
const QS=[
  {t:'Style is a way to say who you are\nwithout having to speak.',s:'Rachel Zoe'},
  {t:'Elegance is elimination.',s:'Cristóbal Balenciaga'},
  {t:'Simplicity is the keynote\nof all true elegance.',s:'Coco Chanel'},
  {t:'Fashion fades,\nonly style remains.',s:'Coco Chanel'},
  {t:'I don\'t do fashion.\nI am fashion.',s:'Coco Chanel'},
  {t:'In order to be irreplaceable,\none must always be different.',s:'Coco Chanel'},
  {t:'Dress shabbily and they remember the dress;\ndress impeccably and they remember the woman.',s:'Coco Chanel'},
  {t:'What you wear is how you present\nyourself to the world.',s:'Miuccia Prada'},
  {t:'Luxury must be comfortable,\notherwise it is not luxury.',s:'Coco Chanel'},
  {t:'Less is more.',s:'Ludwig Mies van der Rohe'},
  {t:'风雅，就是发现存在之美。',s:'川端康成'},
  {t:'云想衣裳花想容。',s:'李白'},
  {t:'何须浅碧深红色，\n自是花中第一流。',s:'李清照'},
  {t:'温柔半两，从容一生。',s:'佚名'},
  {t:'万物皆有裂痕，\n那是光照进来的地方。',s:'Leonard Cohen'},
];

// === NAV ===
let curPage='home';
function nav(p){
  curPage=p;['home','wardrobe','profile'].forEach(x=>document.getElementById('page-'+x).classList.toggle('active',x===p));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
  // Adjust nav colors for light pages
  document.querySelector('.nav').style.background=p==='home'?'rgba(10,10,10,.96)':'rgba(250,250,250,.96)';
  document.querySelector('.nav').style.borderTopColor=p==='home'?'rgba(255,255,255,.08)':'#e8e8e8';
  document.querySelectorAll('.nav-btn').forEach(b=>{b.style.color=b.classList.contains('active')?(p==='home'?'#fff':'#0a0a0a'):(p==='home'?'#737373':'#a3a3a3')});
  document.getElementById('fabAdd').style.display=p==='wardrobe'?'flex':'none';
  if(p==='wardrobe')renderW();if(p==='profile'){initProf();renderDiary()}}
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.page)));
document.querySelectorAll('.mx').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.close;if(id)document.getElementById(id).classList.add('hidden')}));

// === HOME ===
function initHome(){
  const day=Math.floor(Date.now()/864e5);
  // Try to load hero image, fallback to gradient
  const heroEl=document.getElementById('hero');
  const heroUrl=HEROES[day%HEROES.length];
  const img=new Image();
  img.onload=()=>{heroEl.style.backgroundImage=`url('${heroUrl}')`;heroEl.classList.add('loaded')};
  img.onerror=()=>{};// keep gradient fallback
  img.src=heroUrl;
  const q=QS[day%QS.length];
  document.getElementById('heroQuote').innerHTML=`${q.t.replace(/\n/g,'<br>')}<span class="q-src">— ${q.s}</span>`;
  const m=new Date().getMonth();const cs=m<2||m===11?'冬':m<5?'春':m<8?'夏':'秋';
  curSeason=cs;
  document.querySelectorAll('.season-btn').forEach(b=>b.classList.toggle('active',b.dataset.s===cs))}

let curSeason='秋';
document.getElementById('seasonPick').addEventListener('click',e=>{const b=e.target.closest('.season-btn');if(!b)return;
  document.querySelectorAll('.season-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');curSeason=b.dataset.s});

// Dress me
document.getElementById('btnDress').addEventListener('click',doReco);
function doReco(){
  if(S.items.length<2){toast('先去衣橱添加单品');return}
  // Filter by season
  const pool=S.items.filter(it=>{if(!it.seasons||!it.seasons.length)return true;return it.seasons.includes(curSeason)});
  // Cooldown
  const cd=S.settings.cooldown*864e5,recent=new Set();
  S.wearLog.forEach(w=>{if(Date.now()-new Date(w.date).getTime()<cd)w.items.forEach(id=>recent.add(id))});
  const avail=pool.filter(i=>!recent.has(i.id));
  const combos=buildC(avail.length?avail:pool);const scored=scoreC(combos);const top3=divPick(scored,3);
  renderReco(top3)}

function buildC(pool){
  const t=pool.filter(i=>i.category==='上装'),b=pool.filter(i=>i.category==='下装'),o=pool.filter(i=>i.category==='外套'),d=pool.filter(i=>i.category==='连衣裙'),s=pool.filter(i=>i.category==='鞋子');
  const c=[];
  for(const x of t)for(const y of b)c.push({items:[x.id,y.id]});
  for(const x of d)c.push({items:[x.id]});
  if(o.length){const ex=[];for(const x of c)for(const y of o)ex.push({items:[...x.items,y.id]});if(ex.length)c.push(...ex)}
  if(s.length){const ex=[];for(const x of c)for(const y of s)ex.push({items:[...x.items,y.id]});return ex.length?ex:c}
  return c}

function scoreC(combos){
  const wc={};S.wearLog.forEach(w=>w.items.forEach(id=>{wc[id]=(wc[id]||0)+1}));
  return combos.map(c=>{let sc=50;
    for(const o of S.outfits){const s=new Set(o.linkedItemIds||[]);const m=c.items.filter(id=>s.has(id)).length;if(m>=2)sc+=25*m}
    c.items.forEach(id=>{const it=S.items.find(x=>x.id===id);if(it?.liked)sc+=20});
    for(const fb of S.feedback){const s=new Set(fb.combo||[]);const m=c.items.filter(id=>s.has(id)).length;if(fb.type==='love'&&m>=2)sc+=15;else if(m>=2)sc-=10}
    const cols=c.items.map(id=>{const it=S.items.find(x=>x.id===id);return it?.color||''}).filter(Boolean);
    if(cols.length&&new Set(cols).size<=3)sc+=10;
    c.items.forEach(id=>{sc-=(wc[id]||0)*2;if((wc[id]||0)<=1)sc+=8});
    sc+=Math.random()*10;return{...c,sc}}).sort((a,b)=>b.sc-a.sc)}

function divPick(a,n){if(a.length<=n)return a;const p=[a[0]];for(let i=1;i<a.length&&p.length<n;i++){if(!p.some(x=>{const s=new Set(x.items);return a[i].items.every(id=>s.has(id))}))p.push(a[i])}
  for(let i=0;p.length<n&&i<a.length;i++)if(!p.includes(a[i]))p.push(a[i]);return p.slice(0,n)}

function renderReco(looks){
  const rp=document.getElementById('recoPage');rp.classList.remove('hidden');
  const list=document.getElementById('recoList');
  if(!looks.length){list.innerHTML='<div class="empty-hint">没找到合适的搭配</div>';return}
  const labels=['LOOK I','LOOK II','LOOK III'];
  list.innerHTML=looks.map((lk,i)=>{
    const thumbs=lk.items.map(id=>{const it=S.items.find(x=>x.id===id);const img=it?gI(it.imageId)||'':'';return`<img class="look-thumb" src="${img}" alt="">`}).join('');
    const desc=lk.items.map(id=>{const it=S.items.find(x=>x.id===id);return it?it.category+(it.color?' '+it.color:''):''}).join(' · ');
    return`<div class="look-card"><div class="look-label">${labels[i]}</div><div class="look-items">${thumbs}</div><div class="look-reason">${desc}</div><button class="look-choose" data-idx="${i}">Choose this look</button></div>`}).join('');
  list.querySelectorAll('.look-choose').forEach(b=>b.addEventListener('click',()=>{
    const lk=looks[parseInt(b.dataset.idx)];
    S.wearLog.push({date:new Date().toISOString(),items:lk.items,source:'recommend'});svS();
    toast('已记录 ✓');rp.classList.add('hidden');renderRecent()}))}

document.getElementById('recoBack').addEventListener('click',()=>document.getElementById('recoPage').classList.add('hidden'));

// Self style
document.getElementById('btnSelfStyle').addEventListener('click',()=>{
  document.getElementById('recoPage').classList.add('hidden');
  const sp=document.getElementById('selfPage');sp.classList.remove('hidden');
  const g=document.getElementById('selfGrid');
  g.innerHTML=S.items.map(it=>{const img=gI(it.imageId)||'';return`<div class="sg-item" data-id="${it.id}"><img src="${img}" alt=""><div class="sg-check">✓</div></div>`}).join('');
  g.querySelectorAll('.sg-item').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('sel')))});
document.getElementById('selfBack').addEventListener('click',()=>document.getElementById('selfPage').classList.add('hidden'));
document.getElementById('btnConfirmSelf').addEventListener('click',()=>{
  const ids=[...document.querySelectorAll('.sg-item.sel')].map(el=>el.dataset.id);if(!ids.length){toast('请选择单品');return}
  S.wearLog.push({date:new Date().toISOString(),items:ids,source:'manual'});svS();
  document.getElementById('selfPage').classList.add('hidden');toast('已记录 ✓');renderRecent()});

// Record wear
document.getElementById('btnRecordWear').addEventListener('click',()=>{
  const g=document.getElementById('recordGrid');
  g.innerHTML=S.items.map(it=>{const img=gI(it.imageId)||'';return`<div class="pk" data-id="${it.id}"><img src="${img}" alt=""><div class="pk-ck">✓</div><div class="pk-lb">${it.category}</div></div>`}).join('');
  g.querySelectorAll('.pk').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('sel')));
  document.getElementById('mRecord').classList.remove('hidden')});
document.getElementById('recordDone').addEventListener('click',()=>{
  const ids=[...document.querySelectorAll('#recordGrid .pk.sel')].map(el=>el.dataset.id);if(!ids.length){toast('请选择');return}
  S.wearLog.push({date:new Date().toISOString(),items:ids,source:'manual'});svS();
  document.getElementById('mRecord').classList.add('hidden');toast('已记录 ✓');renderRecent()});

function renderRecent(){} // minimal for now

// === WARDROBE ===
let wTab='items',fC='all',fSe='all',fCo='all';
document.getElementById('wTabs').addEventListener('click',e=>{const b=e.target.closest('.w-tab');if(!b)return;
  document.querySelectorAll('.w-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');wTab=b.dataset.tab;
  document.getElementById('filtersSection').style.display=wTab==='items'?'':'none';renderW()});
['fCat','fSeason','fColor'].forEach(id=>{document.getElementById(id).addEventListener('click',e=>{
  const c=e.target.closest('.f-chip');if(!c)return;c.parentElement.querySelectorAll('.f-chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');
  if(id==='fCat')fC=c.dataset.v;else if(id==='fSeason')fSe=c.dataset.v;else fCo=c.dataset.v;renderW()})});

function wc14(id){const cut=Date.now()-14*864e5;return S.wearLog.filter(w=>new Date(w.date).getTime()>cut&&w.items.includes(id)).length}

function renderW(){
  document.getElementById('wStats').textContent=`${S.items.length} 单品 · ${S.outfits.length} 搭配 · ${S.inspos.length} 灵感`;
  const g=document.getElementById('mainGrid');
  if(wTab==='items'){
    let items=S.items;if(fC!=='all')items=items.filter(i=>i.category===fC);
    if(fSe!=='all')items=items.filter(i=>i.seasons?.includes(fSe)||!i.seasons?.length);
    if(fCo!=='all')items=items.filter(i=>i.color===fCo);
    if(!items.length){g.innerHTML='<div class="grid-empty">空空如也</div>';return}
    g.innerHTML=items.map(it=>{const img=gI(it.imageId)||'';const w=wc14(it.id);
      return`<div class="gc" data-id="${it.id}" data-t="item"><img src="${img}" alt=""><div class="gc-label">${it.category}${it.color?' · '+it.color:''}</div>${w?`<div class="gc-badge">${w}次</div>`:''}</div>`}).join('');
  }else if(wTab==='outfits'){
    if(!S.outfits.length){g.innerHTML='<div class="grid-empty">还没有搭配</div>';return}
    g.innerHTML=S.outfits.map(o=>{const img=gI(o.imageId)||'';return`<div class="gc" data-id="${o.id}" data-t="outfit"><img src="${img}" alt=""><div class="gc-label">搭配 · ${(o.linkedItemIds||[]).length}件</div></div>`}).join('');
  }else{
    if(!S.inspos.length){g.innerHTML='<div class="grid-empty">收藏一些灵感吧</div>';return}
    g.innerHTML=S.inspos.map(ins=>{const img=gI(ins.imageId)||'';return`<div class="gc" data-id="${ins.id}" data-t="inspo"><img src="${img}" alt=""><div class="gc-label">${ins.note||'灵感'}</div></div>`}).join('');
  }
  g.querySelectorAll('.gc').forEach(el=>el.addEventListener('click',()=>openV(el.dataset.id,el.dataset.t)))}

// === VIEWER ===
let vSlides=[],vIdx=0,vOType='',vOId='';
function buildV(id,type){
  const sl=[];
  if(type==='item'){
    const it=S.items.find(i=>i.id===id);if(!it)return[];
    (it.images||[it.imageId]).forEach(iid=>sl.push({iid,label:it.category+(it.color?' · '+it.color:''),type:'item',ref:it.id}));
    S.outfits.filter(o=>(o.linkedItemIds||[]).includes(id)).forEach(o=>(o.images||[o.imageId]).forEach(iid=>sl.push({iid,label:'搭配参考',type:'outfit',ref:o.id})));
  }else if(type==='outfit'){
    const o=S.outfits.find(x=>x.id===id);if(!o)return[];
    (o.images||[o.imageId]).forEach(iid=>sl.push({iid,label:'搭配照',type:'outfit',ref:o.id}));
    (o.linkedItemIds||[]).forEach(itemId=>{const it=S.items.find(i=>i.id===itemId);if(!it)return;sl.push({iid:it.imageId,label:it.category+(it.color?' · '+it.color:''),type:'item',ref:it.id})});
  }else{
    const ins=S.inspos.find(x=>x.id===id);if(!ins)return[];
    (ins.images||[ins.imageId]).forEach(iid=>sl.push({iid,label:ins.note||'灵感',type:'inspo',ref:ins.id}));
  }
  return sl}

function openV(id,type){vOType=type;vOId=id;vSlides=buildV(id,type);vIdx=0;if(!vSlides.length)return;
  showV();document.getElementById('viewer').classList.remove('hidden');
  const isItem=type==='item';document.getElementById('vSortUp').style.display=isItem?'':'none';document.getElementById('vSortDown').style.display=isItem?'':'none'}

function showV(){if(!vSlides.length)return;const s=vSlides[vIdx];
  document.getElementById('vImg').src=gI(s.iid)||'';document.getElementById('vCount').textContent=`${vIdx+1}/${vSlides.length}`;
  const ref=s.type==='item'?S.items.find(i=>i.id===s.ref):s.type==='outfit'?S.outfits.find(o=>o.id===s.ref):S.inspos.find(x=>x.id===s.ref);
  const liked=ref?.liked||false;const lb=document.getElementById('vLike');lb.textContent=liked?'♥':'♡';lb.classList.toggle('liked',liked);
  document.getElementById('vInfo').textContent=s.label}

document.getElementById('vClose').addEventListener('click',()=>{document.getElementById('viewer').classList.add('hidden');renderW()});
document.getElementById('vLike').addEventListener('click',()=>{const s=vSlides[vIdx];if(!s)return;
  const ref=s.type==='item'?S.items.find(i=>i.id===s.ref):s.type==='outfit'?S.outfits.find(o=>o.id===s.ref):S.inspos.find(x=>x.id===s.ref);
  if(ref){ref.liked=!ref.liked;svS();showV();toast(ref.liked?'❤️':'已取消')}});
let vSx=0;
document.getElementById('vBody').addEventListener('touchstart',e=>{vSx=e.touches[0].clientX},{passive:true});
document.getElementById('vBody').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-vSx;
  if(Math.abs(dx)<50){document.getElementById('viewer').classList.add('hidden');renderW();return}
  if(dx<-50&&vIdx<vSlides.length-1){vIdx++;showV()}else if(dx>50&&vIdx>0){vIdx--;showV()}});
document.getElementById('vAddOutfit').addEventListener('click',()=>document.getElementById('vOutfitIn').click());
document.getElementById('vOutfitIn').addEventListener('change',async e=>{
  const files=Array.from(e.target.files).slice(0,10);if(!files.length)return;const imgs=[];
  for(const f of files)imgs.push(await comp(await readF(f)));
  const id=uid();const iids=imgs.map((img,i)=>{const iid='outfit_'+id+'_'+i;sI(iid,img);return iid});
  let lk=[];if(vOType==='item')lk=[vOId];else{const o=S.outfits.find(x=>x.id===vOId);lk=[...(o?.linkedItemIds||[])]}
  S.outfits.push({id,imageId:iids[0],images:iids,linkedItemIds:lk,note:'',liked:false,createdAt:new Date().toISOString()});
  svS();toast(`+${imgs.length}张搭配图`);vSlides=buildV(vOId,vOType);showV();e.target.value=''});
document.getElementById('vLinkItems').addEventListener('click',()=>{
  if(vOType!=='outfit'){toast('搭配组才能关联单品');return}
  const o=S.outfits.find(x=>x.id===vOId);if(!o)return;linkIds=[...(o.linkedItemIds||[])];
  openPick(ids=>{o.linkedItemIds=ids;svS();toast('已更新');vSlides=buildV(vOId,vOType);showV()})});
document.getElementById('vSortUp').addEventListener('click',()=>{if(vOType!=='item')return;const i=S.items.findIndex(x=>x.id===vOId);if(i<=0)return;[S.items[i-1],S.items[i]]=[S.items[i],S.items[i-1]];svS();toast('↑')});
document.getElementById('vSortDown').addEventListener('click',()=>{if(vOType!=='item')return;const i=S.items.findIndex(x=>x.id===vOId);if(i<0||i>=S.items.length-1)return;[S.items[i],S.items[i+1]]=[S.items[i+1],S.items[i]];svS();toast('↓')});

// === ADD ===
document.getElementById('fabAdd').addEventListener('click',()=>document.getElementById('mChoose').classList.remove('hidden'));
document.getElementById('chItem').addEventListener('click',()=>{document.getElementById('mChoose').classList.add('hidden');openAddItem()});
document.getElementById('chOutfit').addEventListener('click',()=>{document.getElementById('mChoose').classList.add('hidden');linkIds=[];openAddOutfit()});
document.getElementById('chInspo').addEventListener('click',()=>{document.getElementById('mChoose').classList.add('hidden');openAddInspo()});

// Add Item
let iBatch=[],iIdx=0,lastItemId=null;
function openAddItem(){iBatch=[];iIdx=0;document.getElementById('mItem').classList.remove('hidden');
  document.getElementById('itemUp').classList.remove('hidden');document.getElementById('itemConfirm').classList.add('hidden');
  document.getElementById('itemThumbs').innerHTML='';document.getElementById('itemProg').textContent='';document.getElementById('itemHint').textContent='';
  document.getElementById('itemBtn').textContent='开始确认';document.getElementById('itemBtn').onclick=startIC;
  document.getElementById('iColor').innerHTML=COLORS.map(c=>`<div class="cdot" data-c="${c.n}" style="background:${c.h}"></div>`).join('')}

document.getElementById('itemZone').addEventListener('click',()=>document.getElementById('itemFileIn').click());
document.getElementById('itemFileIn').addEventListener('change',async e=>{
  const files=Array.from(e.target.files).slice(0,5);if(!files.length)return;iBatch=[];
  for(const f of files)iBatch.push(await comp(await readF(f)));
  document.getElementById('itemThumbs').innerHTML=iBatch.map((img,i)=>`<div class="upthumb"><img src="${img}" alt=""><div class="upthumb-n">${i+1}</div></div>`).join('');
  document.getElementById('itemHint').textContent=`${iBatch.length}张`;e.target.value=''});

function startIC(){if(!iBatch.length){toast('请选择照片');return}iIdx=0;showIC(0)}
function showIC(idx){
  document.getElementById('itemUp').classList.add('hidden');document.getElementById('itemConfirm').classList.remove('hidden');
  document.getElementById('itemCImg').src=iBatch[idx];document.getElementById('itemProg').textContent=`${idx+1}/${iBatch.length}`;
  document.querySelectorAll('#iCat .f-chip,#iSeason .f-chip').forEach(c=>c.classList.remove('active'));
  document.querySelectorAll('#iColor .cdot').forEach(d=>d.classList.remove('active'));
  document.getElementById('iNote').value='';
  const last=idx===iBatch.length-1;document.getElementById('itemBtn').textContent=last?'确认入库':'确认 → 下一张';
  document.getElementById('itemBtn').onclick=()=>saveI(last)}

document.getElementById('iCat').addEventListener('click',e=>{const c=e.target.closest('.f-chip');if(!c)return;c.parentElement.querySelectorAll('.f-chip').forEach(x=>x.classList.remove('active'));c.classList.add('active')});
document.getElementById('iSeason').addEventListener('click',e=>{const c=e.target.closest('.f-chip');if(!c)return;
  if(c.dataset.v==='四季'){['春','夏','秋','冬'].forEach(s=>{const el=c.parentElement.querySelector(`[data-v="${s}"]`);el?.classList.add('active')});c.classList.add('active')}
  else{c.classList.toggle('active');c.parentElement.querySelector('[data-v="四季"]')?.classList.remove('active')}});
document.getElementById('iColor').addEventListener('click',e=>{const d=e.target.closest('.cdot');if(!d)return;
  document.querySelectorAll('#iColor .cdot').forEach(x=>x.classList.remove('active'));d.classList.add('active')});

function saveI(last){
  const cat=document.querySelector('#iCat .f-chip.active')?.dataset.v;if(!cat){toast('请选类别');return}
  const color=document.querySelector('#iColor .cdot.active')?.dataset.c||'';
  const seasons=[...document.querySelectorAll('#iSeason .f-chip.active')].map(c=>c.dataset.v).filter(v=>v!=='四季');
  const note=document.getElementById('iNote').value.trim();
  const id=uid(),iid='item_'+id;sI(iid,iBatch[iIdx]);
  S.items.push({id,imageId:iid,images:[iid],category:cat,color,seasons,note,liked:false,createdAt:new Date().toISOString()});
  svS();toast('入库 ✓');lastItemId=id;
  if(last){document.getElementById('mItem').classList.add('hidden');renderW();
    document.getElementById('mPrompt').classList.remove('hidden')}
  else{iIdx++;showIC(iIdx)}}

document.getElementById('promptYes').addEventListener('click',()=>{document.getElementById('mPrompt').classList.add('hidden');linkIds=[lastItemId];openAddOutfit()});
document.getElementById('promptSkip').addEventListener('click',()=>{document.getElementById('mPrompt').classList.add('hidden');lastItemId=null});

// Add Outfit
let oImgs=[],linkIds=[];
function openAddOutfit(){oImgs=[];document.getElementById('mOutfit').classList.remove('hidden');
  document.getElementById('outfitZone').classList.remove('hidden');document.getElementById('outfitThumbs').classList.add('hidden');
  document.getElementById('outfitThumbs').innerHTML='';document.getElementById('oNote').value='';renderLinked()}

document.getElementById('outfitZone').addEventListener('click',()=>document.getElementById('outfitFileIn').click());
document.getElementById('outfitFileIn').addEventListener('change',async e=>{
  const files=Array.from(e.target.files).slice(0,10);if(!files.length)return;
  for(const f of files)oImgs.push(await comp(await readF(f)));
  document.getElementById('outfitThumbs').classList.remove('hidden');
  document.getElementById('outfitThumbs').innerHTML=oImgs.map((img,i)=>`<div class="upthumb"><img src="${img}" alt=""><div class="upthumb-n">${i+1}</div></div>`).join('');
  document.getElementById('outfitZone').classList.add('hidden');e.target.value=''});

function renderLinked(){const c=document.getElementById('linkedList');
  c.innerHTML=linkIds.map(id=>{const it=S.items.find(x=>x.id===id);if(!it)return'';const img=gI(it.imageId)||'';
    return`<div class="lchip"><img src="${img}" alt="">${it.category}</div>`}).join('');
  if(!linkIds.length)c.innerHTML='<span style="font-size:.72rem;color:#a3a3a3">未关联</span>'}

document.getElementById('btnLinkPick').addEventListener('click',()=>openPick(ids=>{linkIds=ids;renderLinked()}));
document.getElementById('btnLinkNew').addEventListener('click',()=>{document.getElementById('mOutfit').classList.add('hidden');openAddItem();toast('添加单品后重新打开搭配组关联')});

document.getElementById('outfitBtn').addEventListener('click',()=>{
  if(!oImgs.length){toast('请上传照片');return}if(!linkIds.length){toast('请关联单品');return}
  const note=document.getElementById('oNote').value.trim();const id=uid();
  const iids=oImgs.map((img,i)=>{const iid='outfit_'+id+'_'+i;sI(iid,img);return iid});
  S.outfits.push({id,imageId:iids[0],images:iids,linkedItemIds:[...linkIds],note,liked:false,createdAt:new Date().toISOString()});
  svS();document.getElementById('mOutfit').classList.add('hidden');renderW();toast(`搭配已保存（${oImgs.length}张）✓`);lastItemId=null});

// Add Inspo
let insImgs=[];
function openAddInspo(){insImgs=[];document.getElementById('mInspo').classList.remove('hidden');
  document.getElementById('inspoZone').classList.remove('hidden');document.getElementById('inspoThumbs').classList.add('hidden');
  document.getElementById('inspoThumbs').innerHTML='';document.getElementById('inspoNote').value=''}

document.getElementById('inspoZone').addEventListener('click',()=>document.getElementById('inspoFileIn').click());
document.getElementById('inspoFileIn').addEventListener('change',async e=>{
  const files=Array.from(e.target.files).slice(0,10);if(!files.length)return;
  for(const f of files)insImgs.push(await comp(await readF(f)));
  document.getElementById('inspoThumbs').classList.remove('hidden');
  document.getElementById('inspoThumbs').innerHTML=insImgs.map((img,i)=>`<div class="upthumb"><img src="${img}" alt=""><div class="upthumb-n">${i+1}</div></div>`).join('');
  document.getElementById('inspoZone').classList.add('hidden');e.target.value=''});

document.getElementById('inspoBtn').addEventListener('click',()=>{
  if(!insImgs.length){toast('请上传图片');return}
  const note=document.getElementById('inspoNote').value.trim();
  for(const img of insImgs){const id=uid(),iid='inspo_'+id;sI(iid,img);
    S.inspos.push({id,imageId:iid,images:[iid],note,liked:false,createdAt:new Date().toISOString()})}
  svS();document.getElementById('mInspo').classList.add('hidden');renderW();toast(`已收藏${insImgs.length}张灵感 ✓`)});

// Pick items
let pickCb=null;
function openPick(cb){pickCb=cb;const g=document.getElementById('pickGrid');
  g.innerHTML=S.items.map(it=>{const img=gI(it.imageId)||'';const sel=linkIds.includes(it.id)?'sel':'';
    return`<div class="pk ${sel}" data-id="${it.id}"><img src="${img}" alt=""><div class="pk-ck">✓</div><div class="pk-lb">${it.category}</div></div>`}).join('');
  g.querySelectorAll('.pk').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('sel')));
  document.getElementById('mPick').classList.remove('hidden')}
document.getElementById('pickDone').addEventListener('click',()=>{
  const ids=[...document.querySelectorAll('#pickGrid .pk.sel')].map(el=>el.dataset.id);
  if(pickCb)pickCb(ids);document.getElementById('mPick').classList.add('hidden')});

// === PROFILE ===
function initProf(){const p=S.profile;document.getElementById('inName').value=p.nickname||'';
  document.getElementById('inHeight').value=p.height||'';document.getElementById('inWeight').value=p.weight||'';
  document.getElementById('cdVal').textContent=S.settings.cooldown;
  if(p.nickname)document.getElementById('pName').textContent=p.nickname;
  if(p.avatar){const d=gI(p.avatar);if(d){const img=document.getElementById('pAvatarImg');img.src=d;img.classList.remove('hidden')}}}

document.getElementById('pAvatar').addEventListener('click',()=>document.getElementById('avatarInput').click());
document.getElementById('avatarInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;
  const c=await comp(await readF(f));sI('avatar_main',c);S.profile.avatar='avatar_main';svS();
  const img=document.getElementById('pAvatarImg');img.src=c;img.classList.remove('hidden')});
document.getElementById('btnSaveProfile').addEventListener('click',()=>{
  S.profile.nickname=document.getElementById('inName').value.trim();S.profile.height=document.getElementById('inHeight').value.trim();
  S.profile.weight=document.getElementById('inWeight').value.trim();svS();
  document.getElementById('pName').textContent=S.profile.nickname||'Your profile';toast('Saved ✓');initHome()});
document.querySelectorAll('.st-btn').forEach(b=>b.addEventListener('click',()=>{
  S.settings.cooldown=Math.max(1,Math.min(30,S.settings.cooldown+parseInt(b.dataset.d)));
  document.getElementById('cdVal').textContent=S.settings.cooldown;svS()}));

function renderDiary(){const c=document.getElementById('diaryList');const list=[...S.wearLog].reverse();
  if(!list.length){c.innerHTML='<div class="empty-hint">No records yet</div>';return}
  c.innerHTML=list.map(l=>{const d=new Date(l.date);
    const th=l.items.map(id=>{const it=S.items.find(x=>x.id===id);return it?`<img class="diary-thumb" src="${gI(it.imageId)||''}" alt="">`:''}).join('');
    return`<div class="diary-item"><div class="diary-date">${d.getMonth()+1}/${d.getDate()}</div><div class="diary-items">${th}</div></div>`}).join('')}

// Export/Import
document.getElementById('btnExport').addEventListener('click',()=>{toast('Packing...');const imgs=allI();
  const blob=new Blob([JSON.stringify({version:4,state:S,images:imgs,at:new Date().toISOString()})],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`suri_vogue_${new Date().toISOString().slice(0,10)}.json`;a.click();toast('Exported ✓')});
document.getElementById('btnImport').addEventListener('click',()=>document.getElementById('importInput').click());
document.getElementById('importInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;toast('Importing...');
  try{const data=JSON.parse(await f.text());S={...defS(),...data.state};if(!S.inspos)S.inspos=[];svS();
    if(data.images)data.images.forEach(i=>sI(i.id,i.data));toast('Done ✓');initProf();renderW();initHome();renderDiary()}catch(err){toast('Failed');console.error(err)}});

// === INIT ===
ldS();initHome();
document.getElementById('fabAdd').style.display='none';
