/* ===== MENU, PILIH DECK, DECK BUILDER ===== */
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');/* nama deck dari input user → jangan masuk innerHTML mentah */
const store={mem:null,get(){try{const v=JSON.parse(localStorage.getItem('ptcg.decks.v1')||'null');if(v){v.forEach(d=>{for(const k in d.list)if(!CARDS[k])delete d.list[k]});/* kartu yang sudah dihapus dari CARDS */store.mem=v;return v}}catch(e){}return store.mem||[]},set(a){store.mem=a;try{localStorage.setItem('ptcg.decks.v1',JSON.stringify(a))}catch(e){}}};
const BUILTIN={id:'builtin',name:'Wishlist deck 2 (bawaan)',list:USER_DECK},BUILTIN_TERA={id:'builtin-tera',name:'Terapagos ex (bawaan)',list:TERA_DECK},BUILTIN_DRAGA={id:'builtin-draga',name:'Dragapult ex (bawaan)',list:DRAGA_DECK},BUILTINS=[BUILTIN,BUILTIN_TERA,BUILTIN_DRAGA],isBuiltin=id=>BUILTINS.some(b=>b.id===id);
const showScr=id=>{['menu','pre','db'].forEach(i=>$(i).classList.toggle('on',i===id))};
function seg(el,opts,cur,f){el.innerHTML='';opts.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=k===cur?'on':'';b.onclick=()=>{f(k)};el.append(b)})}
$('m-battle').onclick=()=>{PRE.fmt=PRE.fmt||'std';renderPre();showScr('pre')};$('m-deck').onclick=()=>{renderDB();showScr('db')};
const showRules=()=>dlg(`<h2>Aturan & catatan</h2><div class="rules" style="font-size:12.5px;line-height:1.55;text-align:left">
<b>Alur:</b> koin atau dadu (acak) → pemenang pilih giliran → 7 kartu, mulligan (tangan lawan diperlihatkan; kamu boleh ambil kartu ekstra sebanyak selisih mulligan) → taruh Active/Bench tertutup → 6 Prize → kartu dibuka.<br>
<b>Giliran:</b> ambil 1 kartu → 1 Energi → evolusi → Item, Tool, Supporter (1) → mundur (1) → serang (mengakhiri giliran). Pemain pertama tidak boleh menyerang/Supporter di giliran pertamanya; tak ada yang boleh evolusi di giliran pertamanya.<br>
<b>Damage:</b> dasar + efek penyerang → Weakness ×2 → Resistance −30 → efek bertahan. Bench tidak terkena Weakness/Resistance.<br>
<b>Kondisi khusus &amp; Pokémon Checkup:</b> Asleep/Confused/Paralyzed saling menggantikan; Poison dan Burn bisa menyertai. Berpindah ke Bench atau berevolusi menghapus semuanya.<br>
<b>KO:</b> lawan memilih sendiri kartu Prize (1; ex 2; Mega ex 3). Menang: ambil semua Prize, lawan tak punya Pokémon, atau lawan tak bisa draw. Seri → Sudden Death.<br>
<b>Kontrol:</b> seret kartu dari tangan ke arena (tap hanya untuk melihat). Tap Pokémon untuk zoom, serangan, Ability, atau mundur (hanya di Active).<br><br>
<b>Catatan jujur:</b> kartu yang tersedia baru 35 (deck "wishlist deck 2" dan archetype Terapagos ex), semuanya dibaca dari gambar dan efeknya ditulis. Pokémon Terastal di Bench tidak menerima damage serangan; Gua Besar Zero membuat Bench jadi 8. Legalitas Standard 2026-27 memakai mark H/I/J (atau reprint); Expanded memakai semua kartu paket.</div>`,[['Tutup',1,'ghost']]);$('m-rules').onclick=showRules;
/* ----- pilih deck sebelum battle ----- */
const PRE={fmt:'std'};
function renderPre(){
 seg($('pre-fmt'),Object.entries(FORMATS).map(([k,v])=>[k,k==='std'?'Standard H-I-J':'Expanded']),PRE.fmt,k=>{PRE.fmt=k;renderPre()});
 const box=$('pre-decks');box.innerHTML='';const saved=store.get();
 const item=(d,tag)=>{const lg=legal(d.list,PRE.fmt),b=document.createElement('button');b.className='dk';b.disabled=!lg.ok;
  b.innerHTML=`<div style="flex:1"><div>${esc(d.name)}</div><small>${tag?tag+' • ':''}${lg.n} kartu • ${lg.ok?`<span class="ok">✓ layak ${FORMATS[PRE.fmt].n}</span>`:`<span class="no">✗ ${lg.issues[0]}</span>`}</small></div>${lg.ok?'<span>▶</span>':''}`;
  b.onclick=()=>startBattle(d.list,PRE.fmt);box.append(b)};
 if(saved.length){const h=document.createElement('div');h.className='lbl';h.textContent='Deck tersimpan';box.append(h);saved.forEach(d=>item(d,''))}
 else{const p=document.createElement('p');p.className='note';p.innerHTML='Belum ada deck pribadi yang tersimpan. Mau membuat deck dulu, atau langsung pakai deck acak?';box.append(p);
  const r=document.createElement('div');r.className='row';
  const a=document.createElement('button');a.className='b go';a.textContent='🃏 Buat deck dulu';a.onclick=()=>{DB.list={};DB.id=null;renderDB();showScr('db')};
  const c=document.createElement('button');c.className='b atk';c.textContent='🎲 Deck acak';c.onclick=()=>startBattle(randomDeck(),PRE.fmt);r.append(a,c);box.append(r)}
 const h2=document.createElement('div');h2.className='lbl';h2.textContent='Deck bawaan';box.append(h2);item(BUILTIN,'dari screenshot-mu');item(BUILTIN_TERA,'archetype Tera');item(BUILTIN_DRAGA,'archetype Dragapult');
 if(saved.length){const c=document.createElement('button');c.className='b atk';c.textContent='🎲 Deck acak';c.onclick=()=>startBattle(randomDeck(),PRE.fmt);box.append(c)}}
$('pre-back').onclick=()=>showScr('menu');
/* ----- deck builder ----- */
const DB={list:{},id:null,fmt:'std'};
const copiesByName=(n)=>Object.entries(DB.list).filter(([k])=>CARDS[k].n===n).reduce((a,[,v])=>a+v,0);
const total=()=>countDeck(DB.list);
function maxFor(k){const c=CARDS[k];if(c.k==='energy')return 60;if(c.ace){const other=Object.keys(DB.list).some(x=>DB.list[x]&&CARDS[x].ace&&x!==k);return other?0:1}return 4}
function renderDB(){
 const g=$('db-grid');g.innerHTML='';
 for(const[name,fn]of CLUSTERS){const keys=Object.keys(CARDS).filter(k=>fn(CARDS[k]));if(!keys.length)continue;
  const h=document.createElement('h3');h.innerHTML=`<span>${name}</span><span id="cc-${name}"></span>`;g.append(h);
  const t=document.createElement('div');t.className='tiles';
  keys.forEach(k=>{const c=CARDS[k],d=document.createElement('div');d.className='tile';d.id='t-'+k;d.innerHTML=`<img src="${IMG[c.img]}" alt="${cname(c)}" loading="lazy"><div class="ctl"><button aria-label="Kurangi ${cname(c)}">−</button><span>0</span><button aria-label="Tambah ${cname(c)}">+</button></div>`;
   d.querySelector('img').onclick=()=>zoomCard(c);const[bm,,bp]=d.querySelectorAll('.ctl button, .ctl span');
   bm.onclick=()=>{if(DB.list[k]){DB.list[k]--;if(!DB.list[k])delete DB.list[k];updDB()}};
   bp.onclick=()=>{if(total()<60&&(DB.list[k]||0)<maxFor(k)&&(c.k==='energy'||copiesByName(c.n)<4)){DB.list[k]=(DB.list[k]||0)+1;updDB()}};t.append(d)});g.append(t)}
 seg($('db-fmt'),[['std','Standard'],['exp','Expanded']],DB.fmt,k=>{DB.fmt=k;updDB()});
 const sel=$('db-load');sel.innerHTML='<option value="">— Muat deck —</option>';[...BUILTINS,...store.get()].forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=d.name;sel.append(o)});sel.value=DB.id||'';
 $('db-name').value=DB.name||'';updDB()}
function updDB(){
 for(const k of Object.keys(CARDS)){const t=$('t-'+k);if(!t)continue;const n=DB.list[k]||0;t.querySelector('span').textContent=n;t.classList.toggle('on',n>0);const[bm,bp]=t.querySelectorAll('button');bm.disabled=!n;bp.disabled=total()>=60||n>=maxFor(k)||(CARDS[k].k!=='energy'&&copiesByName(CARDS[k].n)>=4)}
 for(const[name,fn]of CLUSTERS){const e=$('cc-'+name);if(e)e.textContent=Object.entries(DB.list).filter(([k])=>fn(CARDS[k])).reduce((a,[,v])=>a+v,0)}
 const n=total();let sum=`<div><b>${n}/60 kartu</b></div><div class="bar"><i style="width:${n/60*100}%"></i></div>`;
 for(const[name,fn]of CLUSTERS){const v=Object.entries(DB.list).filter(([k])=>fn(CARDS[k])).reduce((a,[,q])=>a+q,0);sum+=`<div class="chk">${name}: <b>${v}</b></div>`}
 $('db-sum').innerHTML=sum;
 let chk='';for(const f of['std','exp']){const l=legal(DB.list,f);chk+=`<div class="chk"><div class="${l.ok?'ok':'no'}">${l.ok?'✓':'✗'} ${FORMATS[f].n}${l.ok?' — layak':''}</div>${l.issues.map(i=>`<div class="no">• ${i}</div>`).join('')}${f===DB.fmt?l.warn.map(i=>`<div class="wn">⚠ ${i}</div>`).join(''):''}</div>`}
 $('db-chk').innerHTML=chk}
$('db-back').onclick=()=>showScr('menu');
$('db-rec').onclick=()=>{const before=total();DB.list=recommend(DB.list);updDB();$('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">✨ ${before?'Deck dilengkapi sampai 60 kartu (staple Trainer + Energi).':'Memakai deck rekomendasi: Darkness Mega Sharpedo ex.'}</div>`)};
$('db-clear').onclick=()=>{DB.list={};DB.id=null;DB.name='';$('db-name').value='';$('db-load').value='';updDB()};
$('db-save').onclick=()=>{const name=$('db-name').value.trim();if(!name){$('db-name').focus();$('db-chk').insertAdjacentHTML('afterbegin','<div class="chk no">Isi nama deck dulu.</div>');return}
 const a=store.get();let id=DB.id&&!isBuiltin(DB.id)?DB.id:null;const rec={id:id||('d'+Date.now()),name,list:{...DB.list}};const i=a.findIndex(x=>x.id===rec.id);if(i>=0)a[i]=rec;else a.push(rec);store.set(a);DB.id=rec.id;DB.name=name;renderDB();
 $('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">💾 Tersimpan permanen di perangkat ini: ${esc(name)}</div>`)};
$('db-del').onclick=()=>{if(!DB.id||isBuiltin(DB.id))return;store.set(store.get().filter(x=>x.id!==DB.id));DB.id=null;renderDB()};
$('db-load').onchange=e=>{const v=e.target.value;const d=[...BUILTINS,...store.get()].find(x=>x.id===v);if(d){DB.list={...d.list};DB.id=d.id;DB.name=isBuiltin(d.id)?'':d.name;$('db-name').value=DB.name;updDB()}};
