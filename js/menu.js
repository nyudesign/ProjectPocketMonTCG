/* ===== MENU, PILIH DECK, SUSUN DECK ===== */
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');/* nama deck dari input user → jangan masuk innerHTML mentah */
const store={mem:null,get(){try{const v=JSON.parse(localStorage.getItem('ptcg.decks.v1')||'null');if(v){v.forEach(d=>{const art=d.art=d.art||{};for(const k in art)if(typeof art[k]==='number')art[k]={[art[k]]:d.list[k]||0};   /* format lama: satu tema untuk semua salinan */
 for(const k in d.list){const nk=!CARDS[k]&&typeof CARD_ALIAS!=='undefined'&&CARD_ALIAS[k],id=+k.slice(1);if(!nk)continue;   /* kartu lama yang kini digabung: pindahkan, gambar lamanya jadi varian */
  d.list[nk]=(d.list[nk]||0)+d.list[k];if(id!==CARDS[nk].img&&(CARDS[nk].alt||[]).includes(id))art[nk]={...art[nk],[id]:((art[nk]||{})[id]||0)+d.list[k]};delete d.list[k]}
 for(const k in d.list)if(!CARDS[k])delete d.list[k];for(const k in art){for(const id in art[k])if(!d.list[k]||!(CARDS[k].alt||[]).includes(+id)||!(art[k][id]>0))delete art[k][id];if(!Object.keys(art[k]).length)delete art[k]}});/* kartu yang sudah dihapus dari CARDS */store.mem=v;return v}}catch(e){}return store.mem||[]},set(a){store.mem=a;try{localStorage.setItem('ptcg.decks.v1',JSON.stringify(a))}catch(e){}}};
const LOCAL=/^(localhost|\[::1\])$|^(127|10|192\.168|172\.(1[6-9]|2\d|3[01]))\.|\.local$/.test(location.hostname);   // deck bawaan hanya di dev lokal (localhost, IP LAN, *.local); GitHub Pages & host lain: kosong
const BUILTIN={id:'builtin',name:'Wishlist deck 2',list:USER_DECK,ace:'sharpedo'},BUILTIN_TERA={id:'builtin-tera',name:'Terapagos ex',list:TERA_DECK,ace:'terapagos'},BUILTIN_DRAGA={id:'builtin-draga',name:'Dragapult ex',list:DRAGA_DECK,ace:'dragapult'},BUILTINS=LOCAL?[BUILTIN,BUILTIN_TERA,BUILTIN_DRAGA]:[],isBuiltin=id=>BUILTINS.some(b=>b.id===id);
const showScr=id=>{['menu','pre','db'].forEach(i=>$(i).classList.toggle('on',i===id));if(id==='menu')renderMenu();const f=$(id).querySelector(id==='menu'?'#m-battle':'.b.ib');if(f)f.focus({preventScroll:true})};
function seg(el,opts,cur,f){el.innerHTML='';opts.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=k===cur?'on':'';b.setAttribute('aria-pressed',k===cur);b.onclick=()=>{f(k)};el.append(b)})}
/* ----- menu utama: angka di kaki menu dihitung dari data (bukan karangan), kartu deck bawaan = main cepat ----- */
const playable=()=>Object.values(CARDS).filter(c=>!c.hide).length;
function renderMenu(){const n=store.get().length;$('m-foot').innerHTML=`<b>${playable()}</b> kartu siap main · <b>${n}</b> deck tersimpan`;
 const sh=$('m-show');if(sh.childElementCount)return;
 BUILTINS.forEach(d=>{const c=CARDS[d.ace],b=document.createElement('button');b.className='qp';
  b.innerHTML=`<img src="${IMG[c.img]}" alt="" width="250" height="350"><span class="tag"><span><small>Deck bawaan</small><b>${esc(d.name)}</b></span>${ic('play')}</span>`;
  b.setAttribute('aria-label',`Main cepat dengan deck ${d.name}`);b.onclick=()=>startBattle(d.list,'std');sh.append(b)})}
$('m-battle').onclick=()=>{PRE.fmt=PRE.fmt||'std';renderPre();showScr('pre')};$('m-deck').onclick=()=>{renderDB();showScr('db')};
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
 if($('menu').classList.contains('on')&&!document.querySelector('.ov.on')){const b={1:'m-battle',2:'m-deck',3:'m-rules'}[e.key];if(b){e.preventDefault();$(b).click()}}
 else if(e.key==='Escape'&&!document.querySelector('.ov.on')&&($('pre').classList.contains('on')||$('db').classList.contains('on')))showScr('menu')});
const showRules=()=>dlg(`<h2>Aturan main</h2><div class="rules">
<p><b>Persiapan.</b> Lempar koin atau dadu: pemenangnya memilih jalan duluan atau kedua. Masing-masing mengambil 7 kartu. Pemain yang punya Pokémon Basic menaruh Pokémon Bertarung dan Cadangan secara tertutup lebih dulu. Pemain tanpa Basic melakukan mulligan (memperlihatkan kartu, mengocok, mengambil 7 lagi) sampai dapat Basic, lalu menaruh. Sesudahnya lawan boleh mengambil kartu ekstra sebanyak selisih mulligan, dan Basic yang terambil boleh ke Cadangan. Lalu masing-masing menaruh 6 Kartu Point dan semua kartu dibuka.</p>
<p><b>Giliran.</b> Ambil 1 kartu. Lalu dalam urutan bebas: taruh Pokémon Basic ke Cadangan, pasang 1 Energi, evolusi, mainkan Item dan Pokémon Tool, 1 Supporter, 1 Stadium, mundur sekali, pakai Ability. Serangan mengakhiri giliran. Pemain pertama tidak boleh menyerang atau memakai Supporter di giliran pertamanya. Tidak ada yang boleh evolusi di giliran pertamanya, atau pada Pokémon yang baru masuk giliran itu.</p>
<p><b>Kerusakan.</b> Damage dasar dan efek penyerang, lalu Kelemahan ×2, Resistansi −30, lalu efek pertahanan. Pokémon Cadangan tidak terkena Kelemahan dan Resistansi.</p>
<p><b>Kondisi Khusus.</b> Tidur, Pusing, dan Lumpuh saling menggantikan. Racun dan Luka Bakar bisa menyertai. Pindah ke Cadangan atau berevolusi memulihkan semuanya. Pemeriksaan Pokémon (Checkup) terjadi di antara giliran.</p>
<p><b>KO dan menang.</b> Pemain yang membuat KO memilih sendiri Kartu Point-nya: 1 lembar, 2 untuk Pokémon ex, 3 untuk Mega ex. Menang bila Kartu Point habis, lawan tak punya Pokémon di Arena, atau Deck lawan habis saat ia harus mengambil kartu. Bila keduanya menang bersamaan: Sudden Death dengan 1 Kartu Point.</p>
<p><b>Kontrol.</b> Seret kartu dari tangan ke arena; ketuk hanya untuk melihat. Ketuk Pokémon-mu untuk serangan, Ability, dan mundur.</p>
<table class="gl"><thead><tr><th>Di kartu Indonesia</th><th>Di TCG Live</th></tr></thead><tbody>
<tr><td>Pokémon Bertarung</td><td>Active Pokémon</td></tr><tr><td>Pokémon Cadangan</td><td>Bench</td></tr><tr><td>Kartu Point</td><td>Prize cards</td></tr><tr><td>Kartu Pegangan</td><td>Hand</td></tr>
<tr><td>Trash</td><td>Discard pile</td></tr><tr><td>Token Kerusakan</td><td>Damage counter</td></tr><tr><td>Sisi depan / belakang</td><td>Heads / Tails</td></tr>
<tr><td>Tidur, Pusing, Lumpuh, Racun, Luka Bakar</td><td>Asleep, Confused, Paralyzed, Poisoned, Burned</td></tr></tbody></table></div>`,[['Tutup',1,'ghost']]);$('m-rules').onclick=showRules;
/* ----- pilih deck sebelum bertanding ----- */
const PRE={fmt:'std'};
function renderPre(){
 seg($('pre-fmt'),Object.entries(FORMATS).map(([k,v])=>[k,k==='std'?'Standard H-I-J':'Expanded']),PRE.fmt,k=>{PRE.fmt=k;renderPre()});$('pre-fmt').style.display=$('pre-fmt-l').style.display=FORMATS.exp?'':'none';
 const box=$('pre-decks');box.innerHTML='';const saved=store.get(),lbl=t=>{const h=document.createElement('div');h.className='lbl';h.textContent=t;box.append(h)};
 const item=(d,tag)=>{const lg=legal(d.list,PRE.fmt),b=document.createElement('button');b.className='dk';b.disabled=!lg.ok;
  b.innerHTML=`<span style="flex:1;min-width:0">${esc(d.name)}<small>${tag?tag+' · ':''}${lg.n} kartu · ${lg.ok?`<span class="ok">${ic('check')} Sah ${FORMATS[PRE.fmt].n}</span>`:`<span class="no">${ic('x')} ${lg.issues[0]}</span>`}</small></span>${lg.ok?`<span class="go1">MAIN ${ic('play')}</span>`:''}`;
  b.onclick=()=>startBattle(d.list,PRE.fmt,{art:d.art});box.append(b)};
 lbl('Deck tersimpan');
 if(saved.length)saved.forEach(d=>item(d,''));
 else{const e=document.createElement('div');e.className='empty-st';e.innerHTML=`<p class="note">Belum ada deck tersimpan. Susun deck sendiri, atau main dulu dengan deck ${BUILTINS.length?'bawaan':'acak'} di bawah.</p>`;
  const a=document.createElement('button');a.className='b go';a.innerHTML=ic('deck')+' Susun deck';a.onclick=()=>{DB.list={};DB.art={};DB.id=null;DB.name='';renderDB();showScr('db')};e.append(a);box.append(e)}
 if(BUILTINS.length){lbl('Deck bawaan');item(BUILTIN,'Mega Sharpedo ex');item(BUILTIN_TERA,'Archetype Tera');item(BUILTIN_DRAGA,'Archetype Dragapult')}
 lbl('Deck acak');const r=document.createElement('button');r.className='dk';r.innerHTML=`${ic('dice')}<span style="flex:1;min-width:0">Deck acak<small>Pokémon acak, pola deck juara, selalu sah</small></span><span class="go1">MAIN ${ic('play')}</span>`;r.onclick=()=>startBattle(randomDeck(PRE.fmt),PRE.fmt);box.append(r)}
$('pre-back').onclick=()=>showScr('menu');
/* ----- susun deck ----- */
const DB={list:{},art:{},id:null,fmt:'std'};   // list: total salinan per kartu; art: kunci kartu -> {id gambar varian lain: jumlah}, sisanya cetakan utama
const copiesByName=(n)=>Object.entries(DB.list).filter(([k])=>CARDS[k].n===n).reduce((a,[,v])=>a+v,0);
const total=()=>countDeck(DB.list);
function maxFor(k){const c=CARDS[k];if(c.k==='energy')return 60;if(c.ace){const other=Object.keys(DB.list).some(x=>DB.list[x]&&CARDS[x].ace&&x!==k);return other?0:1}return 4}
/* varian = cetakan (reprint) kartu yang sama. Batas 4 lembar dihitung per nama, jadi varian boleh dicampur (TCG Tournament Handbook §4 & §4.1.3) */
const vars=k=>[CARDS[k].img,...(CARDS[k].alt||[])];
const vCnt=(k,v)=>{const a=DB.art[k]||{};return v===CARDS[k].img?(DB.list[k]||0)-Object.values(a).reduce((s,n)=>s+n,0):a[v]||0};
const shownV=k=>DB.list[k]&&vars(k).find(v=>vCnt(k,v)>0)||CARDS[k].img;   // tile: varian pertama yang ada di deck
const canAdd=k=>{const c=CARDS[k];return total()<60&&(DB.list[k]||0)<maxFor(k)&&(c.k==='energy'||copiesByName(c.n)<4)};
const cpArt=a=>JSON.parse(JSON.stringify(a||{}));
function vAdd(k,v,d){if(d>0?!canAdd(k):!(vCnt(k,v)>0))return;
 DB.list[k]=(DB.list[k]||0)+d;if(!DB.list[k])delete DB.list[k];
 if(v!==CARDS[k].img){const a=DB.art[k]=DB.art[k]||{};a[v]=(a[v]||0)+d;if(!a[v])delete a[v];if(!Object.keys(a).length)delete DB.art[k]}
 updDB();if($('zoom').matches('.on.db'))zRender()}
function renderDB(){
 const g=$('db-grid');g.innerHTML='';
 for(const[name,fn]of CLUSTERS){const keys=Object.keys(CARDS).filter(k=>!CARDS[k].hide&&fn(CARDS[k]));if(!keys.length)continue;
  const h=document.createElement('h3');h.innerHTML=`<span>${name}</span><span id="cc-${name}"></span>`;g.append(h);
  const t=document.createElement('div');t.className='tiles';
  keys.forEach(k=>{const c=CARDS[k],d=document.createElement('div'),nA=(c.alt||[]).length;d.className='tile';d.id='t-'+k;d.innerHTML=`<img src="${IMG[shownV(k)]}" alt="${cname(c)}" loading="lazy" width="250" height="350">${nA?`<button class="skb" aria-label="${esc(cname(c))}: ${nA+1} varian" title="Varian kartu">${ic('layers')}<b>${nA+1}</b></button>`:''}<div class="ctl"><button aria-label="Kurangi ${cname(c)}">${ic('minus')}</button><span aria-live="polite">0</span><button aria-label="Tambah ${cname(c)}">${ic('plus')}</button></div>`;
   d.querySelector('img').onclick=()=>dbZoom(k);if(nA)d.querySelector('.skb').onclick=()=>dbZoom(k);const[bm,,bp]=d.querySelectorAll('.ctl button, .ctl span');
   bm.onclick=()=>vAdd(k,shownV(k),-1);bp.onclick=()=>vAdd(k,shownV(k),1);t.append(d)});g.append(t)}
 g.insertAdjacentHTML('beforeend','<p class="note dbempty" hidden>Tidak ada kartu yang cocok. Ubah kata kunci atau filter.</p>');
 if(!$('db-t').options.length)$('db-t').innerHTML='<option value="">Semua</option>'+Object.entries(TYPES).map(([k,v])=>`<option value="${k}">Pokémon ${v[0]}</option>`).join('')+'<option value="T">Trainer</option><option value="E">Energi</option>';
 dbFilter();
 seg($('db-fmt'),[['std','Standard'],['exp','Expanded']],DB.fmt,k=>{DB.fmt=k;renderDB()});$('db-fmt').style.display=FORMATS.exp?'':'none';
 const sel=$('db-load');sel.innerHTML='<option value="">Pilih deck…</option>';[...BUILTINS,...store.get()].forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=d.name+(isBuiltin(d.id)?' (bawaan)':'');sel.append(o)});sel.value=DB.id||'';
 $('db-name').value=DB.name||'';updDB()}
/* zoom susun deck: kartu sebelumnya/berikutnya (urutan grid yang tampil), pilih varian, jumlah per varian; scroll/geser di area kartu = info efek */
function dbZoom(k,v){const z=$('zoom'),open=z.matches('.on.db'),inf=open&&z.classList.contains('info');DB.z={k,v:v||shownV(k)};
 zoomCard({...CARDS[k],img:DB.z.v});zHolo();z.classList.add('db');z.classList.toggle('info',inf);$('zside').scrollTop=0;zRender();
 const t=$('t-'+k);if(t)t.scrollIntoView({block:'nearest'});if(!open)$('zx').focus({preventScroll:true})}
const zStep=d=>{const ts=[...$('db-grid').querySelectorAll('.tile')];let i=ts.findIndex(t=>t.id==='t-'+DB.z.k);if(i<0)return;do i+=d;while(ts[i]&&ts[i].hidden);return ts[i]&&ts[i].id.slice(2)};
function zRender(){const{k,v}=DB.z,c=CARDS[k],n=vCnt(k,v),vs=vars(k);
 $('zvar').innerHTML=vs.length>1?vs.map((id,i)=>{const q=vCnt(k,id),l=(c.altl||{})[id];return`<button data-v="${id}" class="${id===v?'on':''}" aria-pressed="${id===v}" aria-label="Varian ${i+1}${l?', '+esc(l):''}${q?`, ${q} di deck`:''}"${l?` title="${esc(l)}"`:''}>Varian ${i+1}${q?`<b>${q}</b>`:''}</button>`}).join(''):'';
 $('zn').textContent=n;$('zmin').disabled=!n;$('zplus').disabled=!canAdd(k);$('zprev').disabled=!zStep(-1);$('znext').disabled=!zStep(1);
 const s=$('zvar').querySelector('.on');if(s)s.scrollIntoView({block:'nearest',inline:'nearest'})}
$('zvar').onclick=e=>{const b=e.target.closest('button');if(!b)return;DB.z.v=+b.dataset.v;$('zimg').src=IMG[DB.z.v];zHolo();zRender()};
$('zmin').onclick=()=>vAdd(DB.z.k,DB.z.v,-1);$('zplus').onclick=()=>vAdd(DB.z.k,DB.z.v,1);
$('zprev').onclick=()=>{const k=zStep(-1);if(k)dbZoom(k)};$('znext').onclick=()=>{const k=zStep(1);if(k)dbZoom(k)};
const zInfo=on=>$('zoom').classList.toggle('info',on);
$('zoom').addEventListener('wheel',e=>{if(!$('zoom').classList.contains('db'))return;const zv=e.target.closest('#zvar');
 if(zv&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){zv.scrollLeft+=e.deltaY;e.preventDefault();return}   // roda mouse biasa menggeser baris varian
 if(!e.target.closest('#zleft,#zside'))return;const inf=$('zoom').classList.contains('info');
 if(e.deltaY>0&&!inf||e.deltaY<0&&inf&&$('zside').scrollTop<=0){e.preventDefault();zInfo(e.deltaY>0)}},{passive:false});   // info panjang: scroll isinya dulu, tutup saat sudah di atas
let zT=null;$('zoom').addEventListener('touchstart',e=>{zT=$('zoom').classList.contains('db')&&e.target.closest('#zleft,#zside')?[e.touches[0].clientY,$('zside').scrollTop]:null},{passive:true});
$('zoom').addEventListener('touchend',e=>{if(!zT)return;const dy=e.changedTouches[0].clientY-zT[0];if(dy<-40)zInfo(true);else if(dy>40&&zT[1]<=0)zInfo(false);zT=null});
addEventListener('keydown',e=>{if(!$('zoom').matches('.on.db')||e.ctrlKey||e.metaKey||e.altKey)return;   // G kosong di layar ini, jadi Escape dari ui.js tidak berlaku
 const f={Escape:closeZoom,ArrowLeft:()=>$('zprev').click(),ArrowRight:()=>$('znext').click(),ArrowDown:()=>zInfo(true),ArrowUp:()=>zInfo(false)}[e.key];if(f){e.preventDefault();f()}});
/* holo per rarity: tekan-tahan kartu di zoom. Mouse langsung aktif; sentuh aktif setelah diam 130 md supaya geser buka-info tetap jalan.
   --mx/--my = posisi pointer di kartu (0..1), --o = kuat efek (0..1); tampilannya per rarity ada di css (data-r dari js/rar.js) */
const HL={el:$('zleft'),x:.5,y:.5,tx:.5,ty:.5,o:0,to:0,raf:0,tm:0};
function zHolo(){const{k,v}=DB.z,c=CARDS[k],L=HL.el;L.dataset.r=RAR[v]||'';L.dataset.f=c.k==='pokemon'?c.stage?'v':'p':isEn(c)?'e':'t';L.style.setProperty('--img',`url("${new URL(IMG[v],location.href).href}")`)}
function hlTick(){const h=HL,s=h.el.style;h.x+=(h.tx-h.x)*.2;h.y+=(h.ty-h.y)*.2;h.o+=(h.to-h.o)*.14;if(!h.to&&h.o<.004)h.o=0;
 s.setProperty('--mx',h.x.toFixed(4));s.setProperty('--my',h.y.toFixed(4));s.setProperty('--o',h.o.toFixed(3));h.raf=h.o||h.to?requestAnimationFrame(hlTick):0}
const hlAim=e=>{const r=HL.r;HL.tx=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));HL.ty=Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))};
function hlGo(){HL.tm=0;HL.to=1;zT=null;if(!HL.raf)hlTick()}   // zT=null: tahan bukan geser, jangan buka info saat dilepas
HL.el.addEventListener('pointerdown',e=>{const z=$('zoom');if(e.button||!z.matches('.on.db')||z.classList.contains('info'))return;
 HL.r=$('zimg').getBoundingClientRect();hlAim(e);HL.el.setPointerCapture(e.pointerId);
 if(e.pointerType==='touch'){HL.p=[e.clientX,e.clientY];HL.tm=setTimeout(hlGo,130)}else hlGo()});
HL.el.addEventListener('pointermove',e=>{if(HL.tm&&Math.hypot(e.clientX-HL.p[0],e.clientY-HL.p[1])>10){clearTimeout(HL.tm);HL.tm=0}if(HL.to||HL.tm)hlAim(e)});
HL.el.addEventListener('lostpointercapture',()=>{clearTimeout(HL.tm);HL.tm=0;HL.to=0});   // lepas, batal, atau zoom ditutup
HL.el.addEventListener('contextmenu',e=>{if($('zoom').classList.contains('db'))e.preventDefault()});   // tekan lama di HP jangan membuka menu gambar
/* saring tile tanpa membuat ulang (ribuan kartu): cari nama/serangan/Ability, tipe, atau hanya yang di deck */
const SRCH={};const srch=k=>SRCH[k]||(SRCH[k]=(()=>{const c=CARDS[k];return[c.ni,c.n,...(c.atk||[]).map(a=>a.n),c.ab?c.ab.n:''].join(' ').toLowerCase()})());
function dbFilter(){const q=$('db-q').value.trim().toLowerCase(),t=$('db-t').value,only=$('db-show').value==='deck';let n=0;
 for(const h of $('db-grid').querySelectorAll('h3')){const box=h.nextElementSibling;let v=0;
  for(const d of box.children){const k=d.id.slice(2),c=CARDS[k],ok=(!q||srch(k).includes(q))&&(!t||(t==='T'?isTrainer(c):t==='E'?isEn(c):c.k==='pokemon'&&c.type===t))&&(!only||DB.list[k]>0);d.hidden=!ok;if(ok)v++}
  h.hidden=box.hidden=!v;n+=v}
 $('db-n').textContent=`${n} kartu`;const e=$('db-grid').querySelector('.dbempty');if(e)e.hidden=n>0}
['db-q','db-t','db-show'].forEach(i=>$(i).addEventListener('input',dbFilter));
function updDB(){
 for(const k of Object.keys(CARDS)){const t=$('t-'+k);if(!t)continue;const n=DB.list[k]||0,im=t.querySelector('img'),src=IMG[shownV(k)],sk=t.querySelector('.skb');if(im.getAttribute('src')!==src)im.src=src;if(sk)sk.classList.toggle('on',!!DB.art[k]);t.querySelector('span').textContent=n;t.classList.toggle('on',n>0);const[bm,bp]=t.querySelectorAll('.ctl button');bm.disabled=!n;bp.disabled=!canAdd(k)}
 for(const[name,fn]of CLUSTERS){const e=$('cc-'+name);if(e)e.textContent=Object.entries(DB.list).filter(([k])=>fn(CARDS[k])).reduce((a,[,v])=>a+v,0)}
 const n=total();let sum=`<div class="dcount"><b>${n}/60</b><span>kartu di deck</span><button class="dtog" aria-controls="db-side" aria-expanded="${$('db-side').classList.contains('open')}">Rincian</button></div><div class="bar${n===60?' full':''}"><i style="width:${n/60*100}%"></i></div><div class="kinds">`;
 for(const[name,fn]of CLUSTERS){const v=Object.entries(DB.list).filter(([k])=>fn(CARDS[k])).reduce((a,[,q])=>a+q,0);sum+=`<span>${name}</span><b>${v}</b>`}
 $('db-sum').innerHTML=sum+'</div>';
 let chk='';for(const f of Object.keys(FORMATS)){const l=legal(DB.list,f);chk+=`<div class="chk"><div class="${l.ok?'ok':'no'}">${ic(l.ok?'check':'x')} ${l.ok?'Sah':'Belum sah'}: ${FORMATS[f].n}</div>${l.issues.map(i=>`<div class="no">· ${i}</div>`).join('')}${f===DB.fmt?l.warn.map(i=>`<div class="wn">${ic('alert')} ${i}</div>`).join(''):''}</div>`}
 $('db-chk').innerHTML=chk;
 $('db-rec').innerHTML=ic('spark')+(n?' Lengkapi otomatis':' Deck rekomendasi');$('db-rec').disabled=n>=60;
 $('db-del').disabled=!DB.id||isBuiltin(DB.id);$('db-clear').disabled=!n;if($('db-show').value==='deck')dbFilter()}
$('db-back').onclick=()=>showScr('menu');
$('db-side').addEventListener('click',e=>{const t=e.target.closest('.dtog');if(!t)return;t.setAttribute('aria-expanded',$('db-side').classList.toggle('open'))});   // HP: rincian jenis kartu dilipat agar grid kartu lebih lega
$('db-rec').onclick=()=>{const d=!total()&&(buildRecDeck(DB.fmt)||buildGenDeck(DB.fmt)||buildDeck(DB.fmt));DB.list=d?d.L:recommend(DB.list);updDB();$('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">${ic('spark')} ${d?`Deck rekomendasi dimuat: ${esc(d.name)}.${d.pola?` Pola susunan: ${esc(d.pola)}.`:''}`:'Dilengkapi jadi 60 kartu: Trainer staple dan Energi.'}</div>`)};   // deck kosong: Pokémon acak, susunan mengikuti pola list juara Limitless (fx.js)
$('db-clear').onclick=()=>{DB.list={};DB.art={};DB.id=null;DB.name='';$('db-name').value='';$('db-load').value='';updDB()};
$('db-save').onclick=()=>{const name=$('db-name').value.trim();if(!name){$('db-name').focus();$('db-chk').insertAdjacentHTML('afterbegin','<div class="chk no">Isi nama deck dulu.</div>');return}
 const a=store.get();let id=DB.id&&!isBuiltin(DB.id)?DB.id:null;const rec={id:id||('d'+Date.now()),name,list:{...DB.list},art:cpArt(DB.art)};const i=a.findIndex(x=>x.id===rec.id);if(i>=0)a[i]=rec;else a.push(rec);store.set(a);DB.id=rec.id;DB.name=name;renderDB();
 $('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">${ic('save')} Tersimpan di perangkat ini: ${esc(name)}</div>`)};
$('db-del').onclick=async()=>{if(!DB.id||isBuiltin(DB.id))return;const d=store.get().find(x=>x.id===DB.id);if(!d)return;
 if(await dlg(`<h2>Hapus deck?</h2><p>Deck <b>${esc(d.name)}</b> dihapus dari perangkat ini dan tidak bisa dikembalikan.</p>`,[['Hapus deck','y','atk'],['Batal','n','ghost']])!=='y')return;
 store.set(store.get().filter(x=>x.id!==DB.id));DB.id=null;DB.name='';renderDB();$('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">${ic('check')} Deck dihapus: ${esc(d.name)}</div>`)};
$('db-load').onchange=e=>{const v=e.target.value;const d=[...BUILTINS,...store.get()].find(x=>x.id===v);if(d){DB.list={...d.list};DB.art=cpArt(d.art);DB.id=d.id;DB.name=isBuiltin(d.id)?'':d.name;$('db-name').value=DB.name;updDB()}};
renderMenu();
