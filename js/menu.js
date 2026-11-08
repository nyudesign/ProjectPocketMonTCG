/* ===== MENU, PILIH DECK, SUSUN DECK ===== */
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');/* nama deck dari input user → jangan masuk innerHTML mentah */
const store={mem:null,get(){try{const v=JSON.parse(localStorage.getItem('ptcg.decks.v1')||'null');if(v){v.forEach(d=>{for(const k in d.list){const nk=!CARDS[k]&&typeof CARD_ALIAS!=='undefined'&&CARD_ALIAS[k],id=+k.slice(1);if(!nk)continue;   /* kartu lama yang kini digabung: pindahkan, gambar lamanya jadi tema */
  d.list[nk]=(d.list[nk]||0)+d.list[k];delete d.list[k];if(id!==CARDS[nk].img&&(CARDS[nk].alt||[]).includes(id)&&!(d.art&&d.art[nk]))(d.art=d.art||{})[nk]=id}
 for(const k in d.list)if(!CARDS[k])delete d.list[k];for(const k in d.art||{})if(!CARDS[k]||![CARDS[k].img,...(CARDS[k].alt||[])].includes(d.art[k]))delete d.art[k]});/* kartu yang sudah dihapus dari CARDS */store.mem=v;return v}}catch(e){}return store.mem||[]},set(a){store.mem=a;try{localStorage.setItem('ptcg.decks.v1',JSON.stringify(a))}catch(e){}}};
const BUILTIN={id:'builtin',name:'Wishlist deck 2',list:USER_DECK,ace:'sharpedo'},BUILTIN_TERA={id:'builtin-tera',name:'Terapagos ex',list:TERA_DECK,ace:'terapagos'},BUILTIN_DRAGA={id:'builtin-draga',name:'Dragapult ex',list:DRAGA_DECK,ace:'dragapult'},BUILTINS=[BUILTIN,BUILTIN_TERA,BUILTIN_DRAGA],isBuiltin=id=>BUILTINS.some(b=>b.id===id);
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
 else{const e=document.createElement('div');e.className='empty-st';e.innerHTML='<p class="note">Belum ada deck tersimpan. Susun deck sendiri, atau main dulu dengan deck bawaan di bawah.</p>';
  const a=document.createElement('button');a.className='b go';a.innerHTML=ic('deck')+' Susun deck';a.onclick=()=>{DB.list={};DB.art={};DB.id=null;DB.name='';renderDB();showScr('db')};e.append(a);box.append(e)}
 lbl('Deck bawaan');item(BUILTIN,'Mega Sharpedo ex');item(BUILTIN_TERA,'Archetype Tera');item(BUILTIN_DRAGA,'Archetype Dragapult');
 lbl('Deck acak');const r=document.createElement('button');r.className='dk';r.innerHTML=`${ic('dice')}<span style="flex:1;min-width:0">Deck acak<small>Disusun dari semua kartu, selalu sah</small></span><span class="go1">MAIN ${ic('play')}</span>`;r.onclick=()=>startBattle(randomDeck(),PRE.fmt);box.append(r)}
$('pre-back').onclick=()=>showScr('menu');
/* ----- susun deck ----- */
const DB={list:{},art:{},id:null,fmt:'std'};   // art: kunci kartu -> id gambar cetakan pilihan (tema)
const copiesByName=(n)=>Object.entries(DB.list).filter(([k])=>CARDS[k].n===n).reduce((a,[,v])=>a+v,0);
const total=()=>countDeck(DB.list);
function maxFor(k){const c=CARDS[k];if(c.k==='energy')return 60;if(c.ace){const other=Object.keys(DB.list).some(x=>DB.list[x]&&CARDS[x].ace&&x!==k);return other?0:1}return 4}
function renderDB(){
 const g=$('db-grid');g.innerHTML='';
 for(const[name,fn]of CLUSTERS){const keys=Object.keys(CARDS).filter(k=>!CARDS[k].hide&&fn(CARDS[k]));if(!keys.length)continue;
  const h=document.createElement('h3');h.innerHTML=`<span>${name}</span><span id="cc-${name}"></span>`;g.append(h);
  const t=document.createElement('div');t.className='tiles';
  keys.forEach(k=>{const c=CARDS[k],d=document.createElement('div'),nA=(c.alt||[]).length;d.className='tile';d.id='t-'+k;d.innerHTML=`<img src="${IMG[DB.art[k]||c.img]}" alt="${cname(c)}" loading="lazy" width="250" height="350">${nA?`<button class="skb" aria-label="Tema ${esc(cname(c))}: ${nA+1} cetakan" title="Tema kartu">${ic('layers')}<b>${nA+1}</b></button>`:''}<div class="ctl"><button aria-label="Kurangi ${cname(c)}">${ic('minus')}</button><span aria-live="polite">0</span><button aria-label="Tambah ${cname(c)}">${ic('plus')}</button></div>`;
   d.querySelector('img').onclick=()=>zoomCard({...c,img:DB.art[k]||c.img});if(nA)d.querySelector('.skb').onclick=()=>pickSkin(k);const[bm,,bp]=d.querySelectorAll('.ctl button, .ctl span');
   bm.onclick=()=>{if(DB.list[k]){DB.list[k]--;if(!DB.list[k])delete DB.list[k];updDB()}};
   bp.onclick=()=>{if(total()<60&&(DB.list[k]||0)<maxFor(k)&&(c.k==='energy'||copiesByName(c.n)<4)){DB.list[k]=(DB.list[k]||0)+1;updDB()}};t.append(d)});g.append(t)}
 g.insertAdjacentHTML('beforeend','<p class="note dbempty" hidden>Tidak ada kartu yang cocok. Ubah kata kunci atau filter.</p>');
 if(!$('db-t').options.length)$('db-t').innerHTML='<option value="">Semua</option>'+Object.entries(TYPES).map(([k,v])=>`<option value="${k}">Pokémon ${v[0]}</option>`).join('')+'<option value="T">Trainer</option><option value="E">Energi</option>';
 dbFilter();
 seg($('db-fmt'),[['std','Standard'],['exp','Expanded']],DB.fmt,k=>{DB.fmt=k;renderDB()});$('db-fmt').style.display=FORMATS.exp?'':'none';
 const sel=$('db-load');sel.innerHTML='<option value="">Pilih deck…</option>';[...BUILTINS,...store.get()].forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=d.name+(isBuiltin(d.id)?' (bawaan)':'');sel.append(o)});sel.value=DB.id||'';
 $('db-name').value=DB.name||'';updDB()}
/* tema kartu: pilih salah satu cetakan (reprint) kartu ini; dipakai semua salinannya di deck */
async function pickSkin(k){const c=CARDS[k],ids=[c.img,...c.alt],cur=DB.art[k]||c.img,box=$('dlg-b');box.classList.add('skins');
 const v=await dlg(`<h2>${ic('layers')} Tema kartu</h2><p><b>${esc(cname(c))}</b> punya ${ids.length} cetakan. Tema dipakai untuk semua salinannya di deck ini.</p>`,
  [...ids.map((id,i)=>[`<img src="${IMG[id]}" alt="" loading="lazy" width="250" height="350"><span>Cetakan ${i+1}${(c.altl||{})[id]?' · '+esc(c.altl[id]):''}${id===cur?' · dipakai':''}</span>`,id,'skin'+(id===cur?' sel':'')]),['Tutup',null,'ghost close',1]]);
 box.classList.remove('skins');if(v==null)return;if(v===c.img)delete DB.art[k];else DB.art[k]=v;updDB()}
/* saring tile tanpa membuat ulang (ribuan kartu): cari nama/serangan/Ability, tipe, atau hanya yang di deck */
const SRCH={};const srch=k=>SRCH[k]||(SRCH[k]=(()=>{const c=CARDS[k];return[c.ni,c.n,...(c.atk||[]).map(a=>a.n),c.ab?c.ab.n:''].join(' ').toLowerCase()})());
function dbFilter(){const q=$('db-q').value.trim().toLowerCase(),t=$('db-t').value,only=$('db-show').value==='deck';let n=0;
 for(const h of $('db-grid').querySelectorAll('h3')){const box=h.nextElementSibling;let v=0;
  for(const d of box.children){const k=d.id.slice(2),c=CARDS[k],ok=(!q||srch(k).includes(q))&&(!t||(t==='T'?isTrainer(c):t==='E'?isEn(c):c.k==='pokemon'&&c.type===t))&&(!only||DB.list[k]>0);d.hidden=!ok;if(ok)v++}
  h.hidden=box.hidden=!v;n+=v}
 $('db-n').textContent=`${n} kartu`;const e=$('db-grid').querySelector('.dbempty');if(e)e.hidden=n>0}
['db-q','db-t','db-show'].forEach(i=>$(i).addEventListener('input',dbFilter));
function updDB(){
 for(const k of Object.keys(CARDS)){const t=$('t-'+k);if(!t)continue;const n=DB.list[k]||0,im=t.querySelector('img'),src=IMG[DB.art[k]||CARDS[k].img],sk=t.querySelector('.skb');if(im.getAttribute('src')!==src)im.src=src;if(sk)sk.classList.toggle('on',!!DB.art[k]);t.querySelector('span').textContent=n;t.classList.toggle('on',n>0);const[bm,bp]=t.querySelectorAll('.ctl button');bm.disabled=!n;bp.disabled=total()>=60||n>=maxFor(k)||(CARDS[k].k!=='energy'&&copiesByName(CARDS[k].n)>=4)}
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
$('db-rec').onclick=()=>{const before=total();DB.list=recommend(DB.list);updDB();$('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">${ic('spark')} ${before?'Dilengkapi jadi 60 kartu: Trainer staple dan Energi.':'Deck rekomendasi dimuat: Mega Sharpedo ex.'}</div>`)};
$('db-clear').onclick=()=>{DB.list={};DB.art={};DB.id=null;DB.name='';$('db-name').value='';$('db-load').value='';updDB()};
$('db-save').onclick=()=>{const name=$('db-name').value.trim();if(!name){$('db-name').focus();$('db-chk').insertAdjacentHTML('afterbegin','<div class="chk no">Isi nama deck dulu.</div>');return}
 const a=store.get();let id=DB.id&&!isBuiltin(DB.id)?DB.id:null;const rec={id:id||('d'+Date.now()),name,list:{...DB.list},art:Object.fromEntries(Object.entries(DB.art).filter(([k])=>DB.list[k]))};const i=a.findIndex(x=>x.id===rec.id);if(i>=0)a[i]=rec;else a.push(rec);store.set(a);DB.id=rec.id;DB.name=name;renderDB();
 $('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">${ic('save')} Tersimpan di perangkat ini: ${esc(name)}</div>`)};
$('db-del').onclick=async()=>{if(!DB.id||isBuiltin(DB.id))return;const d=store.get().find(x=>x.id===DB.id);if(!d)return;
 if(await dlg(`<h2>Hapus deck?</h2><p>Deck <b>${esc(d.name)}</b> dihapus dari perangkat ini dan tidak bisa dikembalikan.</p>`,[['Hapus deck','y','atk'],['Batal','n','ghost']])!=='y')return;
 store.set(store.get().filter(x=>x.id!==DB.id));DB.id=null;DB.name='';renderDB();$('db-chk').insertAdjacentHTML('afterbegin',`<div class="chk ok">${ic('check')} Deck dihapus: ${esc(d.name)}</div>`)};
$('db-load').onchange=e=>{const v=e.target.value;const d=[...BUILTINS,...store.get()].find(x=>x.id===v);if(d){DB.list={...d.list};DB.art={...(d.art||{})};DB.id=d.id;DB.name=isBuiltin(d.id)?'':d.name;$('db-name').value=DB.name;updDB()}};
renderMenu();
