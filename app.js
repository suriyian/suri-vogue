/* ============================================
   SURI VOGUE v3 — Full App Logic
   ============================================ */
const IMG_P='sv_img_';
function saveImage(id,d){try{localStorage.setItem(IMG_P+id,d)}catch(e){console.warn('Storage full',e)}}
function getImage(id){return localStorage.getItem(IMG_P+id)||null}
function deleteImage(id){localStorage.removeItem(IMG_P+id)}
function getAllImages(){const r=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(IMG_P))r.push({id:k.slice(IMG_P.length),data:localStorage.getItem(k)})}return r}

const SK='sv_state';
function defState(){return{profile:{nickname:'',height:'',weight:'',avatar:'',styles:[]},settings:{cooldown:7},items:[],outfits:[],wearLog:[],feedback:[]}}
let S=defState();
function loadS(){try{const r=localStorage.getItem(SK);if(r)S={...defState(),...JSON.parse(r)}}catch(e){}}
function saveS(){localStorage.setItem(SK,JSON.stringify(S))}

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function toast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.remove('hidden');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.add('hidden'),2200)}
function fmtDate(d){const w=['日','一','二','三','四','五','六'];return`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${w[d.getDay()]}`}
function readFile(f){return new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(f)})}
async function compress(url,mw=800){return new Promise(r=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');let w=img.width,h=img.height;if(w>mw){h=h*mw/w;w=mw}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);r(c.toDataURL('image/jpeg',.8))};img.src=url})}

const COLORS=[{n:'黑',h:'#1a1a1a'},{n:'白',h:'#f5f5f5'},{n:'灰',h:'#9e9e9e'},{n:'米',h:'#e8dcc8'},{n:'棕',h:'#8b6f47'},{n:'驼',h:'#c4a67d'},{n:'藏蓝',h:'#1a365d'},{n:'蓝',h:'#3b82f6'},{n:'红',h:'#c0392b'},{n:'粉',h:'#e8a0bf'},{n:'绿',h:'#2d6a4f'},{n:'紫',h:'#7c3aed'},{n:'黄',h:'#eab308'},{n:'橙',h:'#ea580c'}];

// === NAV ===
let curPage='home';
function nav(p){curPage=p;['home','wardrobe','profile'].forEach(x=>document.getElementById('page-'+x).classList.toggle('active',x===p));
document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
document.getElementById('topbarTitle').textContent={home:'SURI VOGUE',wardrobe:'我的衣橱',profile:'个人档案'}[p];
document.getElementById('fabAdd').style.display=p==='wardrobe'?'flex':'none';
if(p==='wardrobe')renderWardrobe();if(p==='profile'){initProfile();renderDiary()}}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.page)));

// Close modals
document.querySelectorAll('.modal-close').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.close;if(id)document.getElementById(id).classList.add('hidden')}));

// === QUOTES ===
const QS=[{t:'云想衣裳花想容',s:'李白'},{t:'人生若只如初见',s:'纳兰性德'},{t:'陌上花开，可缓缓归矣',s:'钱镠'},{t:'此心安处是吾乡',s:'苏轼'},{t:'一身诗意千寻瀑，万古人间四月天',s:'林徽因'},{t:'凡是过往，皆为序章',s:'Shakespeare'},{t:'时尚会褪色，风格永存',s:'Coco Chanel'},{t:'少即是多',s:'Mies van der Rohe'},{t:'人间有味是清欢',s:'苏轼'},{t:'万物皆有裂痕，那是光照进来的地方',s:'Leonard Cohen'},{t:'行到水穷处，坐看云起时',s:'王维'},{t:'每一个不曾起舞的日子，都是对生命的辜负',s:'Nietzsche'},{t:'春有百花秋有月，夏有凉风冬有雪',s:'无门慧开'},{t:'温柔半两，从容一生',s:'佚名'},{t:'日日是好日',s:'禅语'},{t:'风雅，就是发现存在之美',s:'川端康成'},{t:'何须浅碧深红色，自是花中第一流',s:'李清照'},{t:'不乱于心，不困于情',s:'丰子恺'}];
function dailyQ(){return QS[Math.floor(Date.now()/864e5)%QS.length]}

// === HOME ===
function initHome(){document.getElementById('homeDate').textContent=fmtDate(new Date());const q=dailyQ();
document.getElementById('homeGreeting').innerHTML=`<span class="quote-text">${q.t}</span><span class="quote-source">— ${q.s}</span>`;renderRecent();checkTodayWear()}

let curTemp=22,curOcc='通勤';
document.querySelectorAll('.temp-btn').forEach(b=>b.addEventListener('click',()=>{curTemp+=parseInt(b.dataset.delta);curTemp=Math.max(-10,Math.min(45,curTemp));document.getElementById('tempValue').textContent=curTemp}));
document.getElementById('occasionTags').addEventListener('click',e=>{const b=e.target.closest('.tag-btn');if(!b)return;document.querySelectorAll('#occasionTags .tag-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');curOcc=b.dataset.occasion});

function checkTodayWear(){const today=new Date().toDateString();const logged=S.wearLog.find(w=>new Date(w.date).toDateString()===today);
const el=document.getElementById('twpChosen');if(logged){el.textContent='✓ 已记录';el.classList.remove('hidden')}else{el.classList.add('hidden')}}
document.getElementById('btnTodayWear').addEventListener('click',openRecordWear);

// === RECOMMEND ===
document.getElementById('btnRecommend').addEventListener('click',doRecommend);
let recoResults=[],curRecoIdx=0;

function doRecommend(){
  if(S.items.length<2){toast('先去衣橱添加衣服吧');return}
  const pool=S.items.filter(it=>{
    const tMin=it.tempMin??-10,tMax=it.tempMax??40;if(curTemp<tMin||curTemp>tMax)return false;
    if(it.occasions&&it.occasions.length&&!it.occasions.includes(curOcc))return false;
    // Season check
    const now=new Date(),m=now.getMonth();const curSeason=m<2||m===11?'冬':m<5?'春':m<8?'夏':'秋';
    if(it.seasons&&it.seasons.length&&!it.seasons.includes(curSeason))return false;
    // Cooldown
    const cd=S.settings.cooldown*864e5,recent=new Set();S.wearLog.forEach(w=>{if(Date.now()-new Date(w.date).getTime()<cd)w.items.forEach(id=>recent.add(id))});
    if(recent.has(it.id))return false;return true});
  const combos=buildCombos(pool);const scored=scoreCombos(combos);recoResults=diversePick(scored,3);
  curRecoIdx=0;renderReco()}

function buildCombos(pool){
  const tops=pool.filter(i=>i.category==='上装'),bots=pool.filter(i=>i.category==='下装'),outs=pool.filter(i=>i.category==='外套'),dresses=pool.filter(i=>i.category==='连衣裙'),shoes=pool.filter(i=>i.category==='鞋子');
  const combos=[],needOut=curTemp<15;
  for(const t of tops)for(const b of bots){const items=[t.id,b.id];if(needOut&&outs.length)for(const o of outs)combos.push({items:[...items,o.id]});else combos.push({items})}
  for(const d of dresses){const items=[d.id];if(needOut&&outs.length)for(const o of outs)combos.push({items:[...items,o.id]});else combos.push({items})}
  if(shoes.length){const ex=[];for(const c of combos)for(const s of shoes)ex.push({items:[...c.items,s.id]});return ex.length?ex:combos}
  return combos}

function scoreCombos(combos){
  const wc={};S.wearLog.forEach(w=>w.items.forEach(id=>{wc[id]=(wc[id]||0)+1}));
  return combos.map(c=>{let sc=50;
    for(const o of S.outfits){const s=new Set(o.linkedItemIds||[]);const m=c.items.filter(id=>s.has(id)).length;if(m>=2)sc+=25*m}
    S.items.forEach(it=>{if(c.items.includes(it.id)&&it.liked)sc+=20});
    for(const fb of S.feedback){const s=new Set(fb.combo||[]);const m=c.items.filter(id=>s.has(id)).length;if(fb.type==='love'&&m>=2)sc+=15*m;else if(m>=2)sc-=10*m}
    const cols=c.items.map(id=>{const it=S.items.find(x=>x.id===id);return it?.color||''}).filter(Boolean);
    if(cols.length){if(new Set(cols).size<=3)sc+=10;sc+=cols.filter(x=>['黑','白','灰','米','驼'].includes(x)).length*3}
    c.items.forEach(id=>{sc-=(wc[id]||0)*2;if((wc[id]||0)<=1)sc+=8});sc+=Math.random()*10;return{...c,sc}}).sort((a,b)=>b.sc-a.sc)}

function diversePick(arr,n){if(arr.length<=n)return arr;const p=[arr[0]];for(let i=1;i<arr.length&&p.length<n;i++){if(!p.some(x=>{const s=new Set(x.items);return arr[i].items.every(id=>s.has(id))}))p.push(arr[i])}
for(let i=0;p.length<n&&i<arr.length;i++)if(!p.includes(arr[i]))p.push(arr[i]);return p.slice(0,n)}

function renderReco(){
  const sec=document.getElementById('recoSection');sec.classList.remove('hidden');
  const sw=document.getElementById('recoSwitcher');sw.innerHTML='';
  if(!recoResults.length){sw.innerHTML='<div class="empty-hint">没找到合适的搭配</div>';return}
  recoResults.forEach((r,i)=>{
    const div=document.createElement('div');div.className='reco-thumb'+(i===curRecoIdx?' active':'');
    const firstItem=S.items.find(x=>x.id===r.items[0]);const img=firstItem?getImage(firstItem.imageId)||'':'';
    const label=r.items.map(id=>{const it=S.items.find(x=>x.id===id);return it?it.category:''}).join('+');
    div.innerHTML=`<img src="${img}" alt=""><div class="reco-thumb-label">${label}</div>`;
    div.addEventListener('click',()=>{curRecoIdx=i;renderReco()});sw.appendChild(div)});
  // TODO: Digital human display with Kling API
  document.getElementById('dhDisplay').innerHTML=`<div class="dh-hint">${recoResults[curRecoIdx].items.map(id=>{const it=S.items.find(x=>x.id===id);return it?it.category+' '+it.color:''}).join(' + ')}<br><span style="font-size:.7rem;color:var(--grey-400)">数字人试衣 · 接入可灵后展示</span></div>`}

// Self style
document.getElementById('btnSelfStyle').addEventListener('click',()=>{
  const p=document.getElementById('selfStylePanel');p.classList.toggle('hidden');
  if(!p.classList.contains('hidden'))renderSelfStyleGrid()});

function renderSelfStyleGrid(){
  const g=document.getElementById('selfStyleGrid');
  g.innerHTML=S.items.map(it=>{const img=getImage(it.imageId)||'';
    return`<div class="ss-item" data-id="${it.id}"><img src="${img}" alt=""><div class="ss-item-check">✓</div></div>`}).join('');
  g.querySelectorAll('.ss-item').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('selected')))}

document.getElementById('btnConfirmSelfStyle').addEventListener('click',()=>{
  const ids=[...document.querySelectorAll('.ss-item.selected')].map(el=>el.dataset.id);
  if(!ids.length){toast('请选择单品');return}
  document.getElementById('dhDisplay').innerHTML=`<div class="dh-hint">${ids.map(id=>{const it=S.items.find(x=>x.id===id);return it?it.category+' '+it.color:''}).join(' + ')}<br><span style="font-size:.7rem;color:var(--grey-400)">自搭 · 数字人试衣待接入</span></div>`;
  document.getElementById('selfStylePanel').classList.add('hidden');toast('搭配已确认')});

function renderRecent(){
  const c=document.getElementById('recentList'),list=S.wearLog.slice(-5).reverse();
  if(!list.length){c.innerHTML='<div class="empty-hint">还没有穿着记录</div>';return}
  c.innerHTML=list.map(l=>{const first=S.items.find(i=>i.id===l.items[0]);const th=first?getImage(first.imageId)||'':'';
    const d=new Date(l.date);return`<div class="recent-item"><img class="recent-thumb" src="${th}" alt=""><div class="recent-info"><div class="recent-date-label">${d.getMonth()+1}/${d.getDate()} ${l.source==='recommend'?'推荐':'手动'}</div><div class="recent-items-text">${l.items.map(id=>{const it=S.items.find(x=>x.id===id);return it?it.category:'?'}).join(' + ')}</div></div></div>`}).join('')}

// === WARDROBE ===
let wTab='items',fCat='all',fSeason='all',fColor='all';

document.getElementById('wardrobeTab').addEventListener('click',e=>{const b=e.target.closest('.tab-btn');if(!b)return;
  document.querySelectorAll('#wardrobeTab .tab-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  wTab=b.dataset.tab;document.getElementById('filterSection').classList.toggle('hidden',wTab!=='items');renderWardrobe()});

['filterCategory','filterSeason','filterColor'].forEach(id=>{
  document.getElementById(id).addEventListener('click',e=>{const c=e.target.closest('.filter-chip');if(!c)return;
    const parent=c.parentElement;parent.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');
    if(id==='filterCategory')fCat=c.dataset.val;else if(id==='filterSeason')fSeason=c.dataset.val;else fColor=c.dataset.val;renderWardrobe()})});

function wearCount14(itemId){const cutoff=Date.now()-14*864e5;return S.wearLog.filter(w=>new Date(w.date).getTime()>cutoff&&w.items.includes(itemId)).length}

function renderWardrobe(){
  document.getElementById('wardrobeStats').textContent=`${S.items.length} 件单品 · ${S.outfits.length} 套搭配`;
  if(wTab==='items'){
    document.getElementById('wardrobeGrid').classList.remove('hidden');document.getElementById('outfitsGrid').classList.add('hidden');
    let items=S.items;
    if(fCat!=='all')items=items.filter(i=>i.category===fCat);
    if(fSeason!=='all')items=items.filter(i=>i.seasons&&i.seasons.includes(fSeason));
    if(fColor!=='all')items=items.filter(i=>i.color===fColor);
    const g=document.getElementById('wardrobeGrid');
    if(!items.length){g.innerHTML='<div class="grid-empty"><div class="grid-empty-icon">👗</div><p>没有符合条件的单品</p></div>';return}
    g.innerHTML=items.map(it=>{const img=getImage(it.imageId)||'';const wc=wearCount14(it.id);
      return`<div class="grid-card" data-id="${it.id}" data-type="item"><img src="${img}" alt=""><div class="grid-card-label">${it.category}${it.color?' · '+it.color:''}</div>${wc?`<div class="grid-card-badge">${wc}次/14天</div>`:''}</div>`}).join('');
    g.querySelectorAll('.grid-card').forEach(el=>el.addEventListener('click',()=>openViewer(el.dataset.id,'item')))
  }else{
    document.getElementById('wardrobeGrid').classList.add('hidden');document.getElementById('outfitsGrid').classList.remove('hidden');
    const g=document.getElementById('outfitsGrid');
    if(!S.outfits.length){g.innerHTML='<div class="grid-empty"><p>还没有搭配组</p></div>';return}
    g.innerHTML=S.outfits.map(o=>{const img=getImage(o.imageId)||'';const wc=S.wearLog.filter(w=>{const cutoff=Date.now()-14*864e5;return new Date(w.date).getTime()>cutoff&&(o.linkedItemIds||[]).some(id=>w.items.includes(id))}).length;
      return`<div class="grid-card" data-id="${o.id}" data-type="outfit"><img src="${img}" alt=""><div class="grid-card-label">搭配组 · ${(o.linkedItemIds||[]).length}件</div>${wc?`<div class="grid-card-badge">${wc}次/14天</div>`:''}</div>`}).join('');
    g.querySelectorAll('.grid-card').forEach(el=>el.addEventListener('click',()=>openViewer(el.dataset.id,'outfit')))}}

// === FULLSCREEN VIEWER ===
let viewerItems=[],viewerIdx=0,viewerType='',viewerCurId='';
function openViewer(id,type){
  viewerType=type;viewerCurId=id;
  if(type==='item'){viewerItems=S.items;viewerIdx=viewerItems.findIndex(i=>i.id===id)}
  else{viewerItems=S.outfits;viewerIdx=viewerItems.findIndex(o=>o.id===id)}
  if(viewerIdx<0)viewerIdx=0;showViewerSlide();document.getElementById('modalViewer').classList.remove('hidden')}

function showViewerSlide(){
  const item=viewerItems[viewerIdx];if(!item)return;
  const img=getImage(item.imageId)||'';document.getElementById('viewerImg').src=img;
  const likeBtn=document.getElementById('viewerLike');likeBtn.textContent=item.liked?'♥':'♡';likeBtn.classList.toggle('liked',!!item.liked);
  let info='';
  if(viewerType==='item')info=`${item.category} · ${item.color||''} · ${(item.seasons||[]).join('')} · 穿${wearCount14(item.id)}次/14天`;
  else info=`搭配组 · ${(item.linkedItemIds||[]).length}件关联 · ${(item.seasons||[]).join('')}`;
  document.getElementById('viewerInfo').textContent=info}

document.getElementById('viewerClose').addEventListener('click',()=>document.getElementById('modalViewer').classList.add('hidden'));
document.getElementById('viewerLike').addEventListener('click',()=>{
  const item=viewerItems[viewerIdx];if(!item)return;item.liked=!item.liked;saveS();showViewerSlide();toast(item.liked?'❤️ 已喜欢':'已取消喜欢')});

// Swipe
let vStartX=0;
document.getElementById('viewerBody').addEventListener('touchstart',e=>{vStartX=e.touches[0].clientX});
document.getElementById('viewerBody').addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-vStartX;
  if(Math.abs(dx)<50)return; // tap = close
  if(dx<-50&&viewerIdx<viewerItems.length-1){viewerIdx++;showViewerSlide()}
  else if(dx>50&&viewerIdx>0){viewerIdx--;showViewerSlide()}});
document.getElementById('viewerBody').addEventListener('click',()=>document.getElementById('modalViewer').classList.add('hidden'));

// === ADD: Choose type ===
document.getElementById('fabAdd').addEventListener('click',()=>document.getElementById('modalUploadType').classList.remove('hidden'));
document.getElementById('btnAddItem').addEventListener('click',()=>{document.getElementById('modalUploadType').classList.add('hidden');openAddItem()});
document.getElementById('btnAddOutfit').addEventListener('click',()=>{document.getElementById('modalUploadType').classList.add('hidden');openAddOutfit()});

// === ADD ITEM ===
let itemBatch=[],itemBatchIdx=0;
function openAddItem(){itemBatch=[];itemBatchIdx=0;
  document.getElementById('modalAddItem').classList.remove('hidden');
  document.getElementById('itemPhaseUpload').classList.remove('hidden');
  document.getElementById('itemPhaseConfirm').classList.add('hidden');
  document.getElementById('itemUploadThumbs').innerHTML='';document.getElementById('itemProgress').textContent='';
  document.getElementById('itemFooterHint').textContent='';
  document.getElementById('btnItemAction').textContent='开始确认';document.getElementById('btnItemAction').onclick=startItemConfirm;
  // Render color picker
  document.getElementById('itemColorPick').innerHTML=COLORS.map(c=>`<div class="color-dot" data-color="${c.n}" style="background:${c.h}"></div>`).join('')}

document.getElementById('itemUploadZone').addEventListener('click',()=>document.getElementById('itemFileInput').click());
document.getElementById('itemFileInput').addEventListener('change',async e=>{
  const files=Array.from(e.target.files).slice(0,5);if(!files.length)return;
  document.getElementById('itemFooterHint').textContent='处理中...';itemBatch=[];
  for(const f of files)itemBatch.push(await compress(await readFile(f)));
  document.getElementById('itemUploadThumbs').innerHTML=itemBatch.map((img,i)=>`<div class="upload-thumb-item"><img src="${img}" alt=""><div class="thumb-idx">${i+1}</div></div>`).join('');
  document.getElementById('itemFooterHint').textContent=`已选 ${itemBatch.length} 张`;e.target.value=''});

function startItemConfirm(){if(!itemBatch.length){toast('请先选择照片');return}itemBatchIdx=0;showItemConfirm(0)}

function showItemConfirm(idx){
  document.getElementById('itemPhaseUpload').classList.add('hidden');
  document.getElementById('itemPhaseConfirm').classList.remove('hidden');
  document.getElementById('itemConfirmImg').src=itemBatch[idx];
  document.getElementById('itemProgress').textContent=`${idx+1}/${itemBatch.length}`;
  // Reset picks
  document.querySelectorAll('#itemCatPick .filter-chip,#itemSeasonPick .filter-chip,#itemOccPick .filter-chip').forEach(c=>c.classList.remove('active'));
  document.querySelectorAll('#itemColorPick .color-dot').forEach(d=>d.classList.remove('active'));
  document.getElementById('itemNote').value='';
  const isLast=idx===itemBatch.length-1;
  document.getElementById('btnItemAction').textContent=isLast?'确认入库':'确认 → 下一张';
  document.getElementById('btnItemAction').onclick=()=>saveItem(isLast)}

// Chip toggles for item form
['itemCatPick','itemSeasonPick','itemOccPick'].forEach(id=>{
  document.getElementById(id).addEventListener('click',e=>{const c=e.target.closest('.filter-chip');if(!c)return;
    if(id==='itemCatPick'){c.parentElement.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));c.classList.add('active')}
    else{if(c.dataset.val==='四季'){const all=['春','夏','秋','冬'];c.parentElement.querySelectorAll('.filter-chip').forEach(x=>{if(all.includes(x.dataset.val))x.classList.add('active')});c.classList.add('active')}else{c.classList.toggle('active');c.parentElement.querySelector('[data-val="四季"]')?.classList.remove('active')}}})});
document.getElementById('itemColorPick').addEventListener('click',e=>{const d=e.target.closest('.color-dot');if(!d)return;
  document.querySelectorAll('#itemColorPick .color-dot').forEach(x=>x.classList.remove('active'));d.classList.add('active')});
['itemTempMin','itemTempMax'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{
  document.getElementById('itemTempLabel').textContent=`${document.getElementById('itemTempMin').value}°C — ${document.getElementById('itemTempMax').value}°C`}));

function saveItem(isLast){
  const cat=document.querySelector('#itemCatPick .filter-chip.active')?.dataset.val;
  if(!cat){toast('请选择类别');return}
  const color=document.querySelector('#itemColorPick .color-dot.active')?.dataset.color||'';
  const seasons=[...document.querySelectorAll('#itemSeasonPick .filter-chip.active')].map(c=>c.dataset.val).filter(v=>v!=='四季');
  const occasions=[...document.querySelectorAll('#itemOccPick .filter-chip.active')].map(c=>c.dataset.val);
  const tMin=parseInt(document.getElementById('itemTempMin').value),tMax=parseInt(document.getElementById('itemTempMax').value);
  const note=document.getElementById('itemNote').value.trim();
  const id=uid(),imgId='item_'+id;saveImage(imgId,itemBatch[itemBatchIdx]);
  S.items.push({id,imageId:imgId,images:[imgId],category:cat,color,seasons,occasions,tempMin:Math.min(tMin,tMax),tempMax:Math.max(tMin,tMax),note,liked:false,createdAt:new Date().toISOString()});
  saveS();toast('已入库 ✓');
  if(isLast){document.getElementById('modalAddItem').classList.add('hidden');renderWardrobe()}
  else{itemBatchIdx++;showItemConfirm(itemBatchIdx)}}

// === ADD OUTFIT ===
let outfitImg=null,linkedIds=[];
function openAddOutfit(){outfitImg=null;linkedIds=[];
  document.getElementById('modalAddOutfit').classList.remove('hidden');
  document.getElementById('outfitUploadZone').classList.remove('hidden');
  document.getElementById('outfitPreview').classList.add('hidden');
  document.querySelectorAll('#outfitSeasonPick .filter-chip').forEach(c=>c.classList.remove('active'));
  document.getElementById('outfitNote').value='';renderLinkedItems()}

document.getElementById('outfitUploadZone').addEventListener('click',()=>document.getElementById('outfitFileInput').click());
document.getElementById('outfitFileInput').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;outfitImg=await compress(await readFile(f));
  document.getElementById('outfitPreviewImg').src=outfitImg;
  document.getElementById('outfitPreview').classList.remove('hidden');
  document.getElementById('outfitUploadZone').classList.add('hidden');e.target.value=''});

document.getElementById('outfitSeasonPick').addEventListener('click',e=>{const c=e.target.closest('.filter-chip');if(!c)return;
  if(c.dataset.val==='四季'){['春','夏','秋','冬'].forEach(s=>{const el=c.parentElement.querySelector(`[data-val="${s}"]`);el?.classList.add('active')});c.classList.add('active')}
  else{c.classList.toggle('active');c.parentElement.querySelector('[data-val="四季"]')?.classList.remove('active')}});

function renderLinkedItems(){
  const c=document.getElementById('linkedItemsList');
  c.innerHTML=linkedIds.map(id=>{const it=S.items.find(x=>x.id===id);if(!it)return'';const img=getImage(it.imageId)||'';
    return`<div class="linked-chip"><img src="${img}" alt="">${it.category}</div>`}).join('');
  if(!linkedIds.length)c.innerHTML='<span style="font-size:.78rem;color:var(--grey-400)">尚未关联单品</span>'}

document.getElementById('btnLinkFromWardrobe').addEventListener('click',()=>{openPickItems(ids=>{linkedIds=ids;renderLinkedItems()})});
document.getElementById('btnLinkAddNew').addEventListener('click',()=>{
  document.getElementById('modalAddOutfit').classList.add('hidden');openAddItem();
  // After item added, reopen outfit modal — simple approach: user reopens manually
  toast('添加单品后，重新打开搭配组继续关联')});

document.getElementById('btnSaveOutfit').addEventListener('click',()=>{
  if(!outfitImg){toast('请上传搭配照');return}
  if(!linkedIds.length){toast('请关联至少一件单品');return}
  const seasons=[...document.querySelectorAll('#outfitSeasonPick .filter-chip.active')].map(c=>c.dataset.val).filter(v=>v!=='四季');
  const note=document.getElementById('outfitNote').value.trim();
  const id=uid(),imgId='outfit_'+id;saveImage(imgId,outfitImg);
  S.outfits.push({id,imageId:imgId,linkedItemIds:[...linkedIds],seasons,note,liked:false,createdAt:new Date().toISOString()});
  saveS();document.getElementById('modalAddOutfit').classList.add('hidden');renderWardrobe();toast('搭配组已保存 ✓')});

// === PICK ITEMS MODAL ===
let pickCb=null;
function openPickItems(cb){pickCb=cb;const g=document.getElementById('pickGrid');
  g.innerHTML=S.items.map(it=>{const img=getImage(it.imageId)||'';const sel=linkedIds.includes(it.id)?'selected':'';
    return`<div class="pick-item ${sel}" data-id="${it.id}"><img src="${img}" alt=""><div class="pick-item-check">✓</div><div class="pick-item-label">${it.category}</div></div>`}).join('');
  g.querySelectorAll('.pick-item').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('selected')));
  document.getElementById('modalPickItems').classList.remove('hidden')}

document.getElementById('btnPickDone').addEventListener('click',()=>{
  const ids=[...document.querySelectorAll('#pickGrid .pick-item.selected')].map(el=>el.dataset.id);
  if(pickCb)pickCb(ids);document.getElementById('modalPickItems').classList.add('hidden')});

// === RECORD WEAR ===
function openRecordWear(){
  const g=document.getElementById('recordPickGrid');
  g.innerHTML=S.items.map(it=>{const img=getImage(it.imageId)||'';
    return`<div class="pick-item" data-id="${it.id}"><img src="${img}" alt=""><div class="pick-item-check">✓</div><div class="pick-item-label">${it.category}</div></div>`}).join('');
  g.querySelectorAll('.pick-item').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('selected')));
  document.getElementById('modalRecordWear').classList.remove('hidden')}

document.getElementById('btnRecordDone').addEventListener('click',()=>{
  const ids=[...document.querySelectorAll('#recordPickGrid .pick-item.selected')].map(el=>el.dataset.id);
  if(!ids.length){toast('请选择今天穿的衣服');return}
  S.wearLog.push({date:new Date().toISOString(),items:ids,source:'manual'});saveS();
  document.getElementById('modalRecordWear').classList.add('hidden');toast('已记录 ✓');renderRecent();checkTodayWear()});

// === PROFILE ===
function initProfile(){const p=S.profile;
  document.getElementById('inputNickname').value=p.nickname||'';document.getElementById('inputHeight').value=p.height||'';
  document.getElementById('inputWeight').value=p.weight||'';document.getElementById('cooldownValue').textContent=S.settings.cooldown;
  if(p.nickname)document.getElementById('profileName').textContent=p.nickname;
  document.querySelectorAll('.style-tag').forEach(t=>t.classList.toggle('active',(p.styles||[]).includes(t.dataset.style)));
  if(p.avatar){const d=getImage(p.avatar);if(d){const img=document.getElementById('avatarImg');img.src=d;img.classList.remove('hidden')}}}

document.getElementById('avatarWrap').addEventListener('click',()=>document.getElementById('avatarInput').click());
document.getElementById('avatarInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;
  const comp=await compress(await readFile(f),400);saveImage('avatar_main',comp);S.profile.avatar='avatar_main';saveS();
  const img=document.getElementById('avatarImg');img.src=comp;img.classList.remove('hidden')});
document.querySelectorAll('.style-tag').forEach(t=>t.addEventListener('click',()=>t.classList.toggle('active')));
document.getElementById('btnSaveProfile').addEventListener('click',()=>{
  S.profile.nickname=document.getElementById('inputNickname').value.trim();S.profile.height=document.getElementById('inputHeight').value.trim();
  S.profile.weight=document.getElementById('inputWeight').value.trim();S.profile.styles=[];
  document.querySelectorAll('.style-tag.active').forEach(t=>S.profile.styles.push(t.dataset.style));saveS();
  document.getElementById('profileName').textContent=S.profile.nickname||'设置你的档案';toast('已保存 ✓');initHome()});
document.querySelectorAll('.stepper-btn').forEach(b=>b.addEventListener('click',()=>{
  S.settings.cooldown=Math.max(1,Math.min(30,S.settings.cooldown+parseInt(b.dataset.delta)));
  document.getElementById('cooldownValue').textContent=S.settings.cooldown;saveS()}));

// Wear diary
function renderDiary(){const c=document.getElementById('diaryList');const list=[...S.wearLog].reverse();
  if(!list.length){c.innerHTML='<div class="empty-hint">还没有记录</div>';return}
  c.innerHTML=list.map(l=>{const d=new Date(l.date);
    const thumbs=l.items.map(id=>{const it=S.items.find(x=>x.id===id);const img=it?getImage(it.imageId)||'':'';return`<img class="diary-thumb" src="${img}" alt="">`}).join('');
    return`<div class="diary-item"><div class="diary-date">${d.getMonth()+1}/${d.getDate()}</div><div class="diary-items">${thumbs}</div></div>`}).join('')}

// Export/Import
document.getElementById('btnExport').addEventListener('click',()=>{toast('打包中...');const imgs=getAllImages();
  const blob=new Blob([JSON.stringify({version:3,state:S,images:imgs,at:new Date().toISOString()})],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`suri_vogue_${new Date().toISOString().slice(0,10)}.json`;a.click();toast('已导出 ✓')});
document.getElementById('btnImport').addEventListener('click',()=>document.getElementById('importInput').click());
document.getElementById('importInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;toast('导入中...');
  try{const data=JSON.parse(await f.text());S={...defState(),...data.state};saveS();if(data.images)data.images.forEach(i=>saveImage(i.id,i.data));
    toast('成功 ✓');initProfile();renderWardrobe();initHome();renderDiary()}catch(err){toast('导入失败');console.error(err)}});

// === INIT ===
loadS();initHome();initProfile();renderWardrobe();renderDiary();
setTimeout(()=>{const s=document.getElementById('splash');if(s)s.remove()},2600);
document.getElementById('fabAdd').style.display='none';
