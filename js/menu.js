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
const DB={list:{},art:{},id:null,fmt:'std',shut:new Set(),only:false};   // list: total salinan per kartu; art: kunci kartu -> {id gambar varian lain: jumlah}, sisanya cetakan utama; shut: kategori yang dilipat; only: tampilan Deck Anda
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
  const h=document.createElement('h3'),t=document.createElement('div'),shut=DB.shut.has(name);t.className='tiles';h.className=shut?'shut':'';
  h.innerHTML=`<button aria-expanded="${!shut}"><span>${name}</span><span><b id="cc-${name}"></b> di deck</span>${ic('minus')}${ic('plus')}</button>`;g.append(h);
  h.firstChild.onclick=()=>{const s=!h.classList.contains('shut'),y=t.getBoundingClientRect().top-g.getBoundingClientRect().top-h.offsetHeight-8;   // kategori dilipat/dibuka; isinya tetap di DOM
   h.classList.toggle('shut',s);DB.shut[s?'add':'delete'](name);h.firstChild.setAttribute('aria-expanded',!s);if(s&&y<0)g.scrollTop+=y};   // dilipat saat judulnya menempel di atas: kembali ke awal kategori, supaya kategori berikutnya langsung terlihat
  keys.forEach(k=>{const c=CARDS[k],d=document.createElement('div'),nA=(c.alt||[]).length;d.className='tile';d.id='t-'+k;d.innerHTML=`<img src="${IMG[shownV(k)]}" alt="${cname(c)}" loading="lazy" width="250" height="350">${nA?`<button class="skb" aria-label="${esc(cname(c))}: ${nA+1} varian" title="Varian kartu">${ic('layers')}<b>${nA+1}</b></button>`:''}<div class="ctl"><button aria-label="Kurangi ${cname(c)}">${ic('minus')}</button><span aria-live="polite">0</span><button aria-label="Tambah ${cname(c)}">${ic('plus')}</button></div>`;
   d.querySelector('img').onclick=()=>dbZoom(k);if(nA)d.querySelector('.skb').onclick=()=>dbZoom(k);const[bm,,bp]=d.querySelectorAll('.ctl button, .ctl span');
   bm.onclick=()=>vAdd(k,shownV(k),-1);bp.onclick=()=>vAdd(k,shownV(k),1);t.append(d)});g.append(t)}
 g.insertAdjacentHTML('beforeend','<p class="note dbempty" hidden>Tidak ada kartu yang cocok. Ubah kata kunci atau filter.</p>');
 if(!$('db-t').options.length)$('db-t').innerHTML='<option value="">Semua tipe</option>'+Object.entries(TYPES).map(([k,v])=>`<option value="${k}">Pokémon ${v[0]}</option>`).join('')+'<option value="T">Trainer</option><option value="E">Energi</option>';
 seg($('db-view'),[['','Semua kartu'],['deck','Deck Anda']],'',k=>dbView(!!k));dbView(DB.only&&total()>0);   // masuk lagi dengan deck kosong: kembali ke Semua kartu
 seg($('db-fmt'),[['std','Standard'],['exp','Expanded']],DB.fmt,k=>{DB.fmt=k;renderDB()});$('db-fmt').style.display=FORMATS.exp?'':'none';
 const sel=$('db-load');sel.innerHTML='<option value="">Pilih deck…</option>';[...BUILTINS,...store.get()].forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=d.name+(isBuiltin(d.id)?' (bawaan)':'');sel.append(o)});sel.value=DB.id||'';
 $('db-name').value=DB.name||'';updDB()}
/* zoom susun deck: carousel kartu (urutan grid yang tampil), pilih varian, jumlah per varian; scroll/geser di kartu tengah = info efek */
function dbZoom(k,v){const z=$('zoom'),open=z.matches('.on.db'),inf=open&&z.classList.contains('info');DB.z={k,v:v||shownV(k)};
 zoomCard({...CARDS[k],img:DB.z.v});z.classList.add('db');z.classList.toggle('info',inf);$('zside').scrollTop=0;crSync(open);zRender();
 const t=$('t-'+k);if(t)t.scrollIntoView({block:'nearest'});if(!open)$('zx').focus({preventScroll:true})}
function zRender(){const{k,v}=DB.z,c=CARDS[k],n=vCnt(k,v),vs=vars(k);
 $('zvar').innerHTML=vs.length>1?vs.map((id,i)=>{const q=vCnt(k,id),l=(c.altl||{})[id];return`<button data-v="${id}" class="${id===v?'on':''}" aria-pressed="${id===v}" aria-label="Varian ${i+1}${l?', '+esc(l):''}${q?`, ${q} di deck`:''}"${l?` title="${esc(l)}"`:''}>Varian ${i+1}${q?`<b>${q}</b>`:''}</button>`}).join(''):'';
 $('zn').textContent=n;$('zmin').disabled=!n;$('zplus').disabled=!canAdd(k);$('zprev').disabled=CR.i<=0;$('znext').disabled=CR.i>=CR.keys.length-1;
 const s=$('zvar').querySelector('.on');if(s)s.scrollIntoView({block:'nearest',inline:'nearest'})}
$('zvar').onclick=e=>{const b=e.target.closest('button');if(!b)return;DB.z.v=+b.dataset.v;crSync(true);zRender()};
$('zmin').onclick=()=>vAdd(DB.z.k,DB.z.v,-1);$('zplus').onclick=()=>vAdd(DB.z.k,DB.z.v,1);
$('zprev').onclick=()=>crStep(-1);$('znext').onclick=()=>crStep(1);
const zInfo=on=>$('zoom').classList.toggle('info',on);
/* carousel: versi sendiri dari prototipe inertia-scroll jhey.dev dengan setelan user (snap, damping 50, flick 1; coverflow perspective 800, depth 80, rotate 0; skala .4 dan pudar 1.1 = kartu samping kecil dan gelap).
   Track digerakkan transform dan hanya indeks ±3 yang punya elemen, karena daftar bisa 1.500+ kartu. pos/tgt dalam px, satu kartu = CR.step.
   Zona: kartu tengah = periksa (tahan = holo, roda vertikal = info); di luar itu = jelajah (seret/lempar, roda, klik kartu samping) */
const CR={el:$('ztrack'),keys:[],sl:new Map(),i:0,pos:0,tgt:0,v:0,raf:0,t:0,W:0,step:1,pd:null,drag:null,wh:null,cap:null};
const crMv=on=>$('zoom').classList.toggle('mv',on);   // #zoom.mv = sedang digeser lewat seret/roda: tombol memudar sampai carousel diam (‹ ›, panah keyboard, klik kartu samping tidak memudarkan)
const crClamp=i=>Math.min(CR.keys.length-1,Math.max(0,i)),crDamp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),crIdle=()=>!CR.raf&&!CR.drag;
function crSize(){CR.W=CR.el.clientWidth;CR.step=CR.W+Math.max(12,CR.W*.04);CR.pos=CR.tgt=CR.i*CR.step;CR.v=0;crDraw()}
function crOpen(k){const ks=[...$('db-grid').querySelectorAll('.tile')].filter(t=>!t.hidden&&t.offsetParent).map(t=>t.id.slice(2));   // daftar = tile yang tampil sekarang (filter ikut, kategori yang dilipat tidak)
 CR.keys=ks.includes(k)?ks:[k];CR.i=CR.keys.indexOf(k);CR.sl.forEach(e=>e.remove());CR.sl.clear();CR.pd=CR.drag=CR.wh=null;crMv(false);crSize()}
function crSync(open){const k=DB.z.k;if(!open)crOpen(k);else if(CR.keys[CR.i]!==k){const i=CR.keys.indexOf(k);if(i<0)crOpen(k);else crGo(CR.i=i)}
 const im=CR.sl.get(CR.i)?.querySelector('img');if(im&&im.getAttribute('src')!==IMG[DB.z.v])im.src=IMG[DB.z.v]}   // slide aktif menampilkan varian yang dipilih
function crDraw(){const{el,sl,keys,step,W}=CR,c=Math.round(CR.pos/step),half=(innerWidth+W)/2;
 for(const[i,e]of sl)if(Math.abs(i-c)>3){e.remove();sl.delete(i)}
 for(let i=Math.max(0,c-3);i<=Math.min(keys.length-1,c+3);i++){let e=sl.get(i);const k=keys[i];
  if(!e){e=document.createElement('div');e.className='zs';e.dataset.i=i;e.innerHTML=`<div class="zc"><img draggable="false" alt="${esc(cname(CARDS[k]))}" src="${IMG[i===CR.i&&DB.z.k===k?DB.z.v:shownV(k)]}"></div>`;el.append(e);sl.set(i,e)}
  const d=i*step-CR.pos,a=Math.min(1,Math.abs(d)/half),pf=800/(800+80*a),o=Math.max(0,1-1.1*a);   // coverflow 2D: makin jauh dari tengah makin kecil, rapat ke tengah, dan gelap (latar hitam pekat, jadi pudar = gelap)
  e.style.transform=`translate3d(${(d*pf).toFixed(2)}px,0,0) scale(${(pf*(1-.4*a)).toFixed(4)})`;e.style.opacity=o.toFixed(3);e.style.visibility=o>.04?'':'hidden';e.style.zIndex=Math.round(100-40*a);   // kartu yang sudah tak terlihat jangan bisa diklik
  e.classList.toggle('act',i===CR.i);e.setAttribute('aria-hidden',i!==CR.i)}}
const crSnap=v=>{CR.tgt=crClamp(Math.round((CR.tgt+v)/CR.step))*CR.step;CR.v=0};   // flick 1: sasaran = posisi + kecepatan x 1 dtk, dibulatkan ke kartu
const crRun=()=>{if(!CR.raf){CR.t=performance.now();CR.raf=requestAnimationFrame(crTick)}};
const crGo=i=>{CR.tgt=crClamp(i)*CR.step;crRun()},crStep=d=>crGo(Math.round(CR.tgt/CR.step)+d);
function crTick(t){if(!$('zoom').matches('.on.db')){CR.raf=0;CR.pd=CR.drag=CR.wh=null;crMv(false);return}   // zoom ditutup saat bergerak: berhenti, jangan sampai dbZoom membukanya lagi
 const dt=Math.min((t-CR.t)/1e3,1/30),end=(CR.keys.length-1)*CR.step,w=CR.wh;CR.t=t;
 if(w&&!CR.drag&&t-w.t>60){CR.wh=null;crSnap(w.v*.5*w.fl);if(Math.round(CR.tgt/CR.step)===w.i&&Math.abs(w.sum)>=w.min)CR.tgt=crClamp(w.i+Math.sign(w.sum))*CR.step}   // putaran roda selesai: minimal pindah 1 kartu
 const rb=CR.drag?5:30;if(CR.tgt<0)CR.tgt=crDamp(CR.tgt,0,rb,dt);else if(CR.tgt>end)CR.tgt=crDamp(CR.tgt,end,rb,dt);   // karet di ujung daftar
 CR.pos=CR.drag||RMO?CR.tgt:crDamp(CR.pos,CR.tgt,50,dt);
 const i=crClamp(Math.round(CR.tgt/CR.step));if(i!==CR.i){CR.i=i;dbZoom(CR.keys[i])}   // info, varian, jumlah ikut kartu sasaran
 const done=!CR.drag&&!CR.wh&&CR.tgt>-.1&&CR.tgt<end+.1&&Math.abs(CR.pos-CR.tgt)<.15;if(done){CR.pos=CR.tgt;crMv(false)}crDraw();CR.raf=done?0:requestAnimationFrame(crTick)}
function crWheel(d,min,fl){const now=performance.now(),w=CR.wh||(CR.wh={i:Math.round(CR.tgt/CR.step),sum:0,v:0,t:0,min,fl}),dt=(now-w.t)/1e3;   // fl = pakai proyeksi kecepatan (flick) saat putaran selesai
 w.v=w.t&&dt>0&&dt<.2?w.v+(d/dt-w.v)*.5:d/.11;w.t=now;w.sum+=d;if(!CR.raf)CR.tgt=CR.pos;CR.tgt+=d;crMv(true);crRun()}
const crEat=e=>{e.stopPropagation();e.preventDefault()};
const crMid=e=>{const m=CR.el.getBoundingClientRect();return e.clientX>=m.left&&e.clientX<=m.right&&e.clientY>=m.top&&e.clientY<=m.bottom};   // zona tengah = kotak kartu tengah di layar, bukan slide aktif: saat bergerak slide aktif bisa masih di samping
const crStop=()=>{cancelAnimationFrame(CR.raf);CR.raf=0;CR.wh=null;CR.v=0;CR.pos=CR.tgt=CR.i*CR.step;crMv(false);crDraw()};
function crUp(e){if(e.type==='lostpointercapture'&&e.target!==CR.cap)return;   // sentuh: capture bawaan di gambar ikut lepas saat capture dipindah, itu bukan jari diangkat
 clearTimeout(HL.tm);HL.tm=0;if(HL.to){HL.to=0;$('zoom').classList.remove('hold')}
 const p=CR.pd;if(!p||p.id!==e.pointerId)return;CR.pd=null;if(!p.on)return;   // belum jadi seret: biarkan klik biasa (kartu samping = lompat, latar = tutup)
 CR.drag=null;crSnap(e.timeStamp-p.t>80?0:CR.v*.5);crRun();
 addEventListener('click',crEat,{capture:true,once:true});requestAnimationFrame(()=>requestAnimationFrame(()=>removeEventListener('click',crEat,true)))}   // klik sisa seret jangan menutup zoom
$('zoom').addEventListener('pointerdown',e=>{const z=$('zoom');if(e.button||!z.classList.contains('db')||HL.to||CR.pd||e.target.closest('button,#zside,#zdb'))return;
 const act=e.target.closest('.zs.act'),touch=e.pointerType==='touch';
 if(act&&CR.raf&&crMid(e))crStop();   // menekan kartu tengah saat sisa gerak/momentum: hentikan di kartu itu supaya holo tetap seketika
 if(act&&crIdle()&&!z.classList.contains('info')){HL.r=act.getBoundingClientRect();hlAim(e);   // kartu tengah yang diam: holo. Mouse seketika; sentuh setelah diam 130 md
  if(!touch)return hlGo(act,e.pointerId);HL.tm=setTimeout(hlGo,130,act,e.pointerId)}
 CR.pd={id:e.pointerId,x:e.clientX,x0:e.clientX,y0:e.clientY,t:e.timeStamp,on:0}});
$('zoom').addEventListener('pointermove',e=>{if(HL.to)return hlAim(e);const p=CR.pd;if(!p||p.id!==e.pointerId)return;if(HL.tm)hlAim(e);
 if(!p.on){const ax=Math.abs(e.clientX-p.x0),ay=Math.abs(e.clientY-p.y0);if(Math.max(ax,ay)<=(e.pointerType==='touch'?10:8))return;
  clearTimeout(HL.tm);HL.tm=0;if(ay>ax){CR.pd=null;return}   // gerak vertikal bukan seret carousel (di HP: geser buka-info)
  p.on=1;zT=null;CR.drag=p;CR.wh=null;CR.v=0;CR.tgt=CR.pos;p.x=e.clientX;p.t=e.timeStamp;(CR.cap=$('zoom')).setPointerCapture(p.id);crMv(true);return crRun()}
 const dx=e.clientX-p.x,dt=(e.timeStamp-p.t)/1e3;CR.tgt-=dx;if(dt>0&&dt<.1)CR.v+=(-dx/dt-CR.v)*.4;p.x=e.clientX;p.t=e.timeStamp;e.preventDefault()});
for(const n of['pointerup','pointercancel','lostpointercapture'])$('zoom').addEventListener(n,crUp);   // lepas, batal, atau zoom ditutup
CR.el.addEventListener('click',e=>{const s=e.target.closest('.zs');if(s&&!s.classList.contains('act'))crGo(+s.dataset.i)});
CR.el.addEventListener('contextmenu',e=>e.preventDefault());   // tekan lama di HP jangan membuka menu gambar
addEventListener('resize',()=>{if($('zoom').matches('.on.db'))crSize()});
$('zoom').addEventListener('wheel',e=>{if(!$('zoom').classList.contains('db'))return;if(HL.to)return e.preventDefault();   // holo ditahan: carousel dibekukan (momentum trackpad masih datang)
 const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY),hor=ax>ay||e.shiftKey,zv=e.target.closest('#zvar');
 if(zv){if(!hor){zv.scrollLeft+=e.deltaY;e.preventDefault()}return}   // roda mouse biasa menggeser baris varian
 if(e.target.closest('#zside')&&hor)return;   // sedang membaca info: gerak horizontal kecil jangan mengganti kartu
 if(!hor&&(e.target.closest('#zside')||crMid(e))){const inf=$('zoom').classList.contains('info');
  if(e.deltaY>0&&!inf||e.deltaY<0&&inf&&$('zside').scrollTop<=0){e.preventDefault();zInfo(e.deltaY>0)}return}   // info panjang: scroll isinya dulu, tutup saat sudah di atas
 const d=(ax>ay?e.deltaX:e.deltaY)*(e.deltaMode===1?100/3:e.deltaMode===2?100:1),nk=ay>=ax||e.shiftKey,u=CR.step/100;if(Math.abs(d)<.5)return;
 e.preventDefault();nk?crWheel(d*u,3.5*u,0):crWheel(d,30,1)},{passive:false});   // roda gaya mouse (vertikal di luar kartu tengah, atau Shift): 100 px = 1 kartu dan takik kecil pun pindah 1 kartu. Geser horizontal trackpad: ikut jari 1:1 lalu snap
let zT=null;$('zoom').addEventListener('touchstart',e=>{zT=$('zoom').classList.contains('db')&&e.target.closest('.zs.act,#zside')?[e.touches[0].clientY,$('zside').scrollTop]:null},{passive:true});
$('zoom').addEventListener('touchend',e=>{if(!zT)return;const dy=e.changedTouches[0].clientY-zT[0];if(dy<-40)zInfo(true);else if(dy>40&&zT[1]<=0)zInfo(false);zT=null});
addEventListener('keydown',e=>{if(!$('zoom').matches('.on.db')||e.ctrlKey||e.metaKey||e.altKey||HL.to&&e.key!=='Escape')return;   // G kosong di layar ini, jadi Escape dari ui.js tidak berlaku
 const f={Escape:closeZoom,ArrowLeft:()=>$('zprev').click(),ArrowRight:()=>$('znext').click(),ArrowDown:()=>zInfo(true),ArrowUp:()=>zInfo(false)}[e.key];if(f){e.preventDefault();f()}});
/* holo per rarity: tekan-tahan kartu tengah. Tiga lapisan .hl dipindah ke kartu aktif saat holo mulai; selama ditahan (#zoom.hold) tombol dan kartu lain memudar.
   --mx/--my = posisi pointer di kartu (0..1), --o = kuat efek (0..1); tampilannya per rarity ada di css (data-r dari js/rar.js) */
const HL={el:null,ly:[...$('zleft').querySelectorAll('.hl')],x:.5,y:.5,tx:.5,ty:.5,o:0,to:0,raf:0,tm:0};
function zHolo(L){const{k,v}=DB.z,c=CARDS[k];if(HL.el&&HL.el!==L)HL.el.style.setProperty('--o',0);HL.el=L;L.append(...HL.ly);
 L.dataset.r=RAR[v]||'';L.dataset.f=c.k==='pokemon'?c.stage?'v':'p':isEn(c)?'e':'t';L.style.setProperty('--img',`url("${new URL(IMG[v],location.href).href}")`)}
function hlTick(){const h=HL,s=h.el.style;h.x+=(h.tx-h.x)*.2;h.y+=(h.ty-h.y)*.2;h.o+=(h.to-h.o)*.14;if(!h.to&&h.o<.004)h.o=0;
 s.setProperty('--mx',h.x.toFixed(4));s.setProperty('--my',h.y.toFixed(4));s.setProperty('--o',h.o.toFixed(3));h.raf=h.o||h.to?requestAnimationFrame(hlTick):0}
const hlAim=e=>{const r=HL.r;HL.tx=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));HL.ty=Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))};
function hlGo(act,pid){HL.tm=0;CR.pd=null;zT=null;zHolo(act.firstChild);HL.to=1;$('zoom').classList.add('hold');(CR.cap=act).setPointerCapture(pid);if(!HL.raf)hlTick()}   // zT=null: tahan bukan geser, jangan buka info saat dilepas
/* saring tile tanpa membuat ulang (ribuan kartu): cari nama/serangan/Ability dan tipe. Tampilan Deck Anda (DB.only) = semua kartu di deck: cari, tipe, dan lipatan kategori diabaikan supaya rekapnya lengkap */
const SRCH={};const srch=k=>SRCH[k]||(SRCH[k]=(()=>{const c=CARDS[k];return[c.ni,c.n,...(c.atk||[]).map(a=>a.n),c.ab?c.ab.n:''].join(' ').toLowerCase()})());
function dbFilter(){const only=DB.only,q=only?'':$('db-q').value.trim().toLowerCase(),t=only?'':$('db-t').value;let n=0;
 for(const h of $('db-grid').querySelectorAll('h3')){const box=h.nextElementSibling;let v=0;
  for(const d of box.children){const k=d.id.slice(2),c=CARDS[k],ok=(!q||srch(k).includes(q))&&(!t||(t==='T'?isTrainer(c):t==='E'?isEn(c):c.k==='pokemon'&&c.type===t))&&(!only||DB.list[k]>0);d.hidden=!ok;if(ok)v++}
  h.hidden=box.hidden=!v;n+=v}
 $('db-n').textContent=only?'':`${n} kartu`;const e=$('db-grid').querySelector('.dbempty');if(e){e.hidden=n>0;e.textContent=only?'Deck masih kosong. Buka Semua kartu, lalu tekan + pada kartu.':'Tidak ada kartu yang cocok. Ubah kata kunci atau filter.'}}
['db-q','db-t'].forEach(i=>$(i).addEventListener('input',dbFilter));
function dbView(only){DB.only=only;[...$('db-view').children].forEach((b,i)=>{b.className=!!i===only?'on':'';b.setAttribute('aria-pressed',!!i===only)});
 $('db').classList.toggle('only',only);$('db-q').disabled=$('db-t').disabled=only;for(const b of $('db-grid').querySelectorAll('h3 button'))b.disabled=only;dbFilter();$('db-grid').scrollTop=0}
function updDB(){
 for(const k of Object.keys(CARDS)){const t=$('t-'+k);if(!t)continue;const n=DB.list[k]||0,im=t.querySelector('img'),src=IMG[shownV(k)],sk=t.querySelector('.skb');if(im.getAttribute('src')!==src)im.src=src;if(sk)sk.classList.toggle('on',!!DB.art[k]);t.querySelector('span').textContent=n;t.classList.toggle('on',n>0);const[bm,bp]=t.querySelectorAll('.ctl button');bm.disabled=!n;bp.disabled=!canAdd(k)}
 for(const[name,fn]of CLUSTERS){const e=$('cc-'+name);if(e)e.textContent=Object.entries(DB.list).filter(([k])=>fn(CARDS[k])).reduce((a,[,v])=>a+v,0)}
 const n=total(),ok=legal(DB.list,DB.fmt).ok;let sum=`<div class="dcount"><b>${n}/60</b><span>kartu di deck</span><em class="${ok?'ok':'no'}">${ic(ok?'check':'x')} ${ok?'Sah':'Belum sah'}</em><button class="dtog" aria-controls="db-side" aria-expanded="${$('db-side').classList.contains('open')}">Kelola</button></div><div class="bar${n===60?' full':''}"><i style="width:${n/60*100}%"></i></div><div class="kinds">`;
 for(const[name,fn]of CLUSTERS){const v=Object.entries(DB.list).filter(([k])=>fn(CARDS[k])).reduce((a,[,q])=>a+q,0);sum+=`<span>${name}</span><b>${v}</b>`}
 $('db-sum').innerHTML=sum+'</div>';
 let chk='';for(const f of Object.keys(FORMATS)){const l=legal(DB.list,f);chk+=`<div class="chk"><div class="${l.ok?'ok':'no'}">${ic(l.ok?'check':'x')} ${l.ok?'Sah':'Belum sah'}: ${FORMATS[f].n}</div>${l.issues.map(i=>`<div class="no">· ${i}</div>`).join('')}${f===DB.fmt?l.warn.map(i=>`<div class="wn">${ic('alert')} ${i}</div>`).join(''):''}</div>`}
 $('db-chk').innerHTML=chk;
 $('db-rec').innerHTML=ic('spark')+(n?' Lengkapi otomatis':' Deck rekomendasi');$('db-rec').disabled=n>=60;
 $('db-del').disabled=!DB.id||isBuiltin(DB.id);$('db-clear').disabled=!n;if(DB.only)dbFilter()}
$('db-back').onclick=()=>showScr('menu');
$('db-side').addEventListener('click',e=>{const t=e.target.closest('.dtog');if(!t)return;t.setAttribute('aria-expanded',$('db-side').classList.toggle('open'))});   // HP: panel deck jadi bilah tipis (jumlah + sah/belum); Kelola membuka rincian, nama, simpan
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
