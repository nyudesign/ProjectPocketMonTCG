/* ===== INTERAKSI & ALUR UI ===== */
let BACKURL='';const backUrl=()=>BACKURL||(BACKURL=(BACKT.image&&BACKT.image.toDataURL?BACKT.image.toDataURL():''));
const px2=(wx,wy,wz)=>{const v=new THREE.Vector3(wx,wy,wz).project(cam);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]};
/* Trainer lawan ala PTCGL: kartu meluncur pelan dari tangan lawan (atas, miring, memudar masuk), tampil besar sesaat di tengah layar,
   lalu mengecil tepat ke tempat kartu dimainkan (playSpot). Dibuat pelan agar tidak mengagetkan (permintaan user) */
async function cardFlyIn(c,sd){
 const box=$('cfx'),cf=document.createElement('div');cf.className='cf';cf.innerHTML=`<div class="face fr"><img src="${imgOf(c)}" alt="${cname(c)}"></div>`;box.append(cf);box.style.display='block';
 const P=playSpot(sd),[sx,sy]=px2(0,.4,LAY.ohandZ||-5),[tx,ty]=px2(P[0],P[1],P[2]),th=Math.abs(px2(P[0],P[1],P[2]+.7*P[3])[1]-px2(P[0],P[1],P[2]-.7*P[3])[1]),
  ch=cf.offsetHeight||400,cx=innerWidth/2,cy=innerHeight/2,f=[1,.75,.45][UI.si];
 const A=(kf,o)=>cf.animate(kf,{fill:'forwards',...o}).finished;
 await A([{transform:`translate(${sx-cx}px,${sy-cy}px) scale(.16) rotate(-12deg)`,opacity:0},{transform:`translate(${(sx-cx)*.45}px,${(sy-cy)*.45}px) scale(.55) rotate(-6deg)`,opacity:.85,offset:.4},{transform:'translate(0,-8px) scale(1.02) rotate(1deg)',opacity:1,offset:.82},{transform:'translate(0,0) scale(1) rotate(0)',opacity:1}],{duration:1100,easing:'cubic-bezier(.45,.05,.3,1)'});
 await sleep(Math.round(1250*f));
 await A([{transform:'translate(0,0) scale(1)'},{transform:`translate(${tx-cx}px,${ty-cy}px) scale(${th/ch})`}],{duration:650,easing:'cubic-bezier(.5,0,.3,1)'});
 cf.remove();box.style.display='none'}
/* kartu diperlihatkan menghadap layar (DOM, selalu lurus ke layar): terbang dari 'from' sambil berbalik, berjajar besar di tengah
   (HP: 3 per baris, desktop: 2 baris bila >5), lalu terbang ke 'to' sambil berbalik lagi menjadi punggung kartu */
async function cardShow(cards,from,to,hold,o={}){const box=$('cfx'),n=cards.length,cx=innerWidth/2,cy=innerHeight/2;box.style.display='block';   // to: [x,y] (kembali tertutup) atau i=>({x,y,h}) (tetap terbuka, tinggi h px); o.dy/o.hk: geser & batas tinggi grid
 const els=cards.map(c=>{const e=document.createElement('div');e.className='cf';e.innerHTML=`<div class="face fr"><img src="${imgOf(c)}" alt="${cname(c)}"></div><div class="face bk"><img src="${backUrl()}" alt=""></div>`;box.append(e);return e}),
  ch=els[0].offsetHeight||400,w=ch*5/7,cols=portrait()?Math.min(n,3):n>5?Math.ceil(n/2):n,rows=Math.ceil(n/cols),k=Math.min(1,(innerWidth-40)/(cols*(w+12)),innerHeight*(o.hk||.78)/(rows*(ch+12))),
  X=i=>{const r=(i/cols)|0,m=Math.min(cols,n-r*cols);return(i%cols-(m-1)/2)*(w+12)*k},Y=i=>(((i/cols)|0)-(rows-1)/2)*(ch+12)*k+(o.dy||0),T=i=>typeof to==='function'?to(i):{x:to[0],y:to[1],h:ch*.12,back:1};
 await Promise.all(els.map((e,i)=>e.animate([{transform:`translate(${from[0]-cx}px,${from[1]-cy}px) scale(.14) rotateY(180deg)`},{transform:`translate(${X(i)}px,${Y(i)}px) scale(${k}) rotateY(0)`}],{duration:560,delay:i*90,easing:'cubic-bezier(.2,.8,.25,1)',fill:'both'}).finished));
 await sleep(hold);
 await Promise.all(els.map((e,i)=>{const t=T(i);return e.animate([{transform:`translate(${X(i)}px,${Y(i)}px) scale(${k}) rotateY(0)`},{transform:`translate(${t.x-cx}px,${t.y-cy}px) scale(${t.h/ch}) rotateY(${t.back?180:0}deg)`,opacity:t.back?.7:1}],{duration:460,delay:i*60,easing:'ease-in',fill:'forwards'}).finished}));
 els.forEach(e=>e.remove());box.style.display='none'}
const TRC={item:0x3b82f6,supporter:0xf97316,stadium:0x22c55e,tool:0xa855f7};
/* kartu mendarat di tempat main: cincin + percikan warna jenis kartu (tanpa kilat layar: user, tidak enak di mata) */
function playSplash(c,sd){const P=playSpot(sd),col=c.ace?0xec4899:TRC[c.k]||0x3b82f6;ring(P[0],P[2],col);burst(P[0],P[2],col,60,2.4,.2);burst(P[0],P[2],0xffffff,24,1.6)}
/* pita judul di atas layar (mis. mulligan Bot): masuk dari kiri dgn kilau berjalan; fungsi kembalian mengeluarkannya ke kanan */
function banner(html,sd='o'){const e=$('ban');e.innerHTML=`<div class="rb">${html}</div>`;e.className='';void e.offsetWidth;e.className='on '+sd;return()=>{e.classList.add('out');setTimeout(()=>{if(e.classList.contains('out'))e.className=''},380)}}
/* kartu baru di tanganmu (awal, sesudah mulligan, Lillie, Iris, dll): tampil tegak menghadap layar, lalu turun tepat ke slot tangan.
   Kartu 3D-nya disembunyikan selama itu (UI.handHide) lalu langsung ditaruh di slotnya (snapHand) */
async function handShow(cards){if(!cards.length)return;const dk=Z.dk(1);UI.handHide=new Set(cards.map(c=>c.id));sync();
 if(!RMO)await cardShow(cards,px2(dk[0],.1,dk[1]),i=>{const it=LI.get(cards[i].id);if(!it)return{x:innerWidth/2,y:innerHeight,h:60};const[x,y]=px2(it.x,it.y,it.z);return{x,y,h:Math.abs(px2(it.x,it.y,it.z+.7*it.s)[1]-px2(it.x,it.y,it.z-.7*it.s)[1])}},1100);
 UI.handHide=null;sync();snapHand(cards)}
const snapHand=cards=>{for(const c of cards){const g=M.get(c.id),T=LI.get(c.id);if(g&&T){g.position.set(T.x,T.y,T.z);g.scale.setScalar(T.s);g.rotation.set(-Math.PI/2+(T.tilt||0),0,0);g.userData.die=0;g.userData.fly=null}}};
const UI={limbo:null,want:null,panel:null,drag:null,dn:null,last:null,stage:null,si:0,themeI:Math.random()*3|0,hp:null};
const say=(t,ms=2600,kind)=>{const m=$('msg');kind=kind||'info';if(t.startsWith('⛔')){kind='warn';t=t.replace(/^⛔\s*/,'')}   // awalan ⛔ = peringatan
 m.className=kind;m.innerHTML=`<i>${ic({warn:'warn',bot:'bot',good:'spark'}[kind]||'info')}</i><span>${iconize(t)}</span>`;void m.offsetWidth;m.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>m.classList.remove('on'),ms)};
const canAct=()=>G&&G.phase==='play'&&G.cur==='p'&&!G.busy&&!G.over&&!UI.want&&!UI.panel&&!UI.stage&&!UI.attach&&!UI.am;
const run=async fn=>{const r=await act(fn);if(typeof r==='string')say('⛔ '+r)};
const imgOf=c=>IMG[c.img];
/* --- HUD --- */
function hud(){
 if(!G||!G.p)return;const o=G.o,p=G.p,n=G.prizeN;
 const pips=(id,rem)=>$(id).innerHTML=Array.from({length:n},(_,i)=>`<i class="${i<rem?'on':''}"></i>`).join('');
 pips('op',o.prizes.length);pips('pp',p.prizes.length);
 const setup=G.phase==='setup',be=$('b-end');if(be.dataset.s!==String(setup)){be.dataset.s=setup;be.innerHTML=setup?`Siap ${ic('play')}`:'Akhiri'}$('b-end').disabled=setup?(!p.active||!!UI.panel||!UI.placing):!canAct();$('b-atk').disabled=setup||!canAct()||!p.active;
 UI.abl=canAct()?ownMons().filter(it=>it.mon.card.ab&&!it.mon.card.ab.passive&&!it.mon.card.ab.setup&&!abWhy('p',it.mon)).map(it=>it.id):[]}
$('b-end').onclick=()=>{if(G.phase==='setup'){if(UI.placing&&G.p.active){const r=UI.placing;UI.placing=null;r()}}else if(canAct())confirmEnd()};
$('b-atk').onclick=()=>{if(canAct()&&G.p.active)monMenu(G.p.active,'p')};
$('b-log').onclick=()=>$('log').classList.toggle('on');$('log-x').onclick=()=>$('log').classList.remove('on');
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
async function confirmEnd(){const pend=pendingActions('p');if(!pend.length||lsGet('ptcg.confirmEnd','1')!=='1')return finishTurn();
 const b=$('dlg-b');b.innerHTML=`<h2>Akhiri giliran?</h2><p>Yang belum kamu lakukan:</p><ul class="todo">${pend.map(t=>`<li><span>${ic('todo')}</span>${t}</li>`).join('')}</ul><label class="skip"><input type="checkbox" id="ce-skip"> Jangan tanya lagi (bisa diaktifkan lagi di Menu)</label>`;
 const v=await new Promise(res=>{[['Kembali bermain','n','go'],['Akhiri giliran','y','atk']].forEach(([l,val,cls])=>{const e=document.createElement('button');e.className='b '+cls;e.textContent=l;e.onclick=()=>{$('dlg').classList.remove('on');res(val)};b.append(e)});$('dlg').classList.add('on')});
 if($('ce-skip').checked)lsSet('ptcg.confirmEnd','0');if(v==='y'&&canAct())finishTurn()}
const SPD=[['Pelan',1900],['Normal',1100],['Cepat',450]];FX.pause=()=>sleep(SPD[UI.si][1]);
$('b-menu').onclick=async()=>{if(!G)return;const v=await dlg(`<h2>${ic('menu')} Menu</h2>`,[[`${ic('log')} Battle Log`,'log','go'],[`${ic('speed')} Kecepatan Bot: ${SPD[UI.si][0]} (ketuk untuk ganti)`,'spd','ghost'],[`Konfirmasi akhiri giliran: ${lsGet('ptcg.confirmEnd','1')==='1'?'Aktif':'Mati'}`,'ce','ghost'],[`${ic('rules')} Aturan main`,'rules','ghost'],[`${ic('flag')} Menyerah`,'conc','atk'],['Tutup',0,'ghost']]);
 if(v==='log')$('log').classList.add('on');else if(v==='spd'){UI.si=(UI.si+1)%3;say('Kecepatan Bot: '+SPD[UI.si][0],1600)}else if(v==='ce'){const on=lsGet('ptcg.confirmEnd','1')==='1';lsSet('ptcg.confirmEnd',on?'0':'1');say('Konfirmasi akhiri giliran: '+(on?'Mati':'Aktif'),1800)}else if(v==='rules')showRules();else if(v==='conc')askConcede()};
async function askConcede(){const v=await dlg(`<h2>${ic('flag')} Menyerah?</h2><p>Kalau kamu menyerah, pertandingan ini dihitung <b>kalah</b>. Apakah kamu yakin?</p>`,[['Ya, saya menyerah','y','atk'],['Lanjut bermain','n','go']]);if(v==='y'&&G&&!G.over){closeAll();concede('p')}}
function closeAll(){UI.candy=null;UI.placeOnly=null;UI.handHide=null;closeAm();$('flp').className='';$('ban').className='';$('go').className='';$('dlg-b').classList.remove('mlw');UI.deal=null;UI.mull=null;UI.attach=null;$('cfx').style.display='none';UI.want=null;UI.stage=null;UI.limbo=null;UI.drag=null;DCS.forEach(m=>m.visible=false);pickHide();['panel','zoom','disc','dlg'].forEach(i=>$(i).classList.remove('on'));UI.panel=null;$('pback').style.display='none';$('ann').classList.remove('on');$('abt').classList.remove('on');$('turn').className=''}
/* --- Log --- */
FX.log=t=>{const d=document.createElement('div');if(t.startsWith('—'))d.className='t';d.innerHTML=iconize(t);const b=$('log-b');b.append(d);b.scrollTop=1e9;if(!t.startsWith('—')&&!t.startsWith('Kamu'))say(t,2400,'bot')};
FX.sync=()=>sync();
/* --- Zoom --- */
const spChip=m=>[m.sp==='asleep'?ic('zzz')+' Asleep':'',m.sp==='confused'?ic('dizzy')+' Confused':'',m.sp==='paralyzed'?ic('zap')+' Paralyzed':'',m.poison?ic('skull')+' Poisoned':'',m.burn?ic('flame')+' Burned':''].filter(Boolean);
function cardText(c){if(c.k!=='pokemon')return`<div>${c.tx||''}</div>`;
 const t=TYPES[c.type]||['',''];
 return`<div><span class="chip">${c.stage===0?'Basic':'Stage '+c.stage+(c.from?' dari '+c.from:'')}</span><span class="chip">${t[0]}</span><span class="chip">HP ${c.hp}</span>${c.mega?'<span class="chip">Mega ex • 3 Prize</span>':c.prize>1?'<span class="chip">ex • 2 Prize</span>':''}</div>`+
 (c.ab?`<div><b>Ability: ${c.ab.n}</b><br>${c.ab.tx}</div>`:'')+c.atk.map(a=>`<div><b>${a.n}</b> [${a.cost}] ${a.dmg?a.dmg+(a.plus?'+':a.times?'×':''):''}<br>${a.tx}</div>`).join('')+
 `<div>Lemah: ${c.weak?TYPES[c.weak][0]+' ×2':'-'} • Tahan: ${c.res?TYPES[c.res][0]+' −30':'-'} • Mundur: ${c.retreat}</div>`}
function zoomCard(c){$('zimg').src=imgOf(c);$('zinfo').innerHTML=`<div><b>${cname(c)}</b></div>`+cardText(c);$('zbtn').innerHTML='';$('zoom').classList.add('on')}   // kartu tangan/discard/Stadium; Pokémon di arena: monMenu
const closeZoom=()=>$('zoom').classList.remove('on');
$('zx').onclick=closeZoom;$('zoom').onclick=e=>{if(e.target.id==='zoom')closeZoom()};
/* --- Discard --- */
function openDisc(sd){
 const tabs=$('disc-tabs');tabs.innerHTML='';
 [['p','Discard/Trash Kamu'],['o','Discard/Trash Bot']].forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=k===sd?'on':'';b.onclick=()=>openDisc(k);tabs.append(b)});
 const S=G[sd],mp=new Map();S.discard.forEach(c=>{const e=mp.get(c.key)||{c,n:0};e.n++;mp.set(c.key,e)});
 const cnt={Pokémon:0,Trainer:0,Energi:0};S.discard.forEach(c=>cnt[c.k==='pokemon'?'Pokémon':isEn(c)?'Energi':'Trainer']++);
 $('disc-b').innerHTML=`<div style="grid-column:1/-1;font-size:12px;font-weight:800">${S.discard.length} kartu — Pokémon ${cnt.Pokémon} • Trainer ${cnt.Trainer} • Energi ${cnt.Energi}</div>`;
 if(!S.discard.length)$('disc-b').innerHTML+='<div class="empty" style="color:#64748b">Discard kosong</div>';
 [...mp.values()].sort((a,b)=>b.n-a.n).forEach(({c,n})=>{const d=document.createElement('div');d.className='dc';d.innerHTML=`<img src="${imgOf(c)}" alt="${cname(c)}"><i>×${n}</i>`;d.onclick=()=>{$('disc').classList.remove('on');zoomCard(c)};$('disc-b').append(d)});
 $('disc').classList.add('on')}
$('disc-x').onclick=()=>$('disc').classList.remove('on');
/* --- Dialog --- */
function dlg(html,btns){return new Promise(res=>{const b=$('dlg-b');b.innerHTML=html;btns.forEach(([l,v,cls])=>{const e=document.createElement('button');e.className='b '+(cls||'go');e.innerHTML=l;e.onclick=()=>{$('dlg').classList.remove('on');res(v)};b.append(e)});$('dlg').classList.add('on')})}   // label tombol dari kode (boleh berisi ikon)
/* --- Panel efek Trainer & pilihan kartu --- */
function panelOpen(card,title){UI.panel=1;$('pflt').innerHTML='';$('pimg').src=card?imgOf(card):'';$('pimg').style.display=card?'':'none';$('ptitle').textContent=title;$('pcar').innerHTML='';
 ['p-done','p-cancel'].forEach(i=>$(i).style.display='none');$('panel').classList.remove('look');$('pback').style.display='none';$('panel').classList.add('on');hud()}
function panelClose(){UI.panel=null;$('panel').classList.remove('on','look');$('pback').style.display='none';hud()}
$('p-look').onclick=()=>{$('panel').classList.add('look');$('pback').style.display='block'};$('pback').onclick=()=>{$('panel').classList.remove('look');$('pback').style.display='none'};
function panelPick(o){return new Promise(res=>{
 const{cards,min=0,max,card,title,cost}=o,can=o.pick||(()=>true),nPick=cards.filter(can).length,sel=new Set(),valid=new Set(cards.filter(can)),all=o.all&&o.all.length>cards.length?[...o.all].sort(byKind):null;panelOpen(card,title+(max>1?` (maks ${max})`:''));
 const car=$('pcar'),fl=$('pflt');
 const done=$('p-done'),cancel=$('p-cancel');done.style.display='';const upd=()=>{const ok=sel.size>=min&&sel.size<=max;done.disabled=!ok;done.textContent=cost?`Buang ${sel.size}/${min}`:(sel.size?`Ambil ${sel.size} kartu`:(min?'Pilih kartu':'Selesai (tanpa memilih)'))};
 /* filter ala PTCGL: "Sesuai" = kartu yang boleh dipilih, "Semua" = seluruh isi Deck/discard (yang tak sesuai diredupkan, tak bisa dipilih) */
 const render=all_=>{car.innerHTML='';const list=all_?all:cards;if(!list.length){car.innerHTML='<div class="empty">Tidak ada kartu yang cocok.</div>';return}
  list.forEach(c=>{const d=document.createElement('div');d.className='cc'+(sel.has(c)?' sel':'');d.innerHTML=`<img src="${imgOf(c)}" alt="${cname(c)}">`;if(!valid.has(c)){d.classList.add('no');d.title='Tidak bisa dipilih';d.setAttribute('aria-disabled','true');car.append(d);return}d.onclick=()=>{if(sel.has(c)){sel.delete(c);d.classList.remove('sel')}else if(sel.size<max){sel.add(c);d.classList.add('sel')}else if(max===1){car.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));sel.clear();sel.add(c);d.classList.add('sel')}upd()};car.append(d)})};
 if(all){fl.innerHTML=`<span>Filter</span><button class="on" data-m="">Sesuai <b>${valid.size}</b></button><button data-m="1">Semua <b>${all.length}</b></button>`;fl.querySelectorAll('button').forEach(b=>b.onclick=()=>{fl.querySelectorAll('button').forEach(q=>q.classList.toggle('on',q===b));render(!!b.dataset.m)})}
 render(false);
 if(cost){cancel.style.display='';cancel.onclick=()=>{panelClose();res(null)}}
 done.onclick=async()=>{
  if(!cost&&sel.size<max&&nPick>sel.size){const v=await dlg(`<h2>Ambil lebih sedikit?</h2><p>Kamu baru memilih <b>${sel.size}</b> kartu, padahal kartu ini membolehkan sampai <b>${max}</b> dan masih ada kartu yang cocok. Yakin lanjut dengan ${sel.size} kartu?</p>`,[['Ya, lanjut','y','atk'],['Kembali memilih','n','go']]);if(v!=='y')return}
  panelClose();res([...sel])};upd()})}
const KORD={pokemon:0,supporter:1,item:2,tool:3,stadium:4,senergy:5,energy:6},byKind=(a,b)=>(KORD[a.k]-KORD[b.k])||(a.stage||0)-(b.stage||0)||cname(a).localeCompare(cname(b));
function panelPay(o){return new Promise(res=>{
 const m=o.mon,sel=new Set();panelOpen(m.card,`Mundur ke ${cname(o.to.card)}: pilih ${o.cost} Energi untuk dibuang`);
 const car=$('pcar'),done=$('p-done'),cancel=$('p-cancel');done.style.display='';cancel.style.display='';
 const upd=()=>{done.disabled=sel.size!==o.cost;done.textContent=`Konfirmasi (${sel.size}/${o.cost})`};
 m.en.forEach(c=>{const d=document.createElement('div');d.className='cc';d.innerHTML=`<img src="${imgOf(c)}" alt="${cname(c)}">`;d.onclick=()=>{if(sel.has(c)){sel.delete(c);d.classList.remove('sel')}else if(sel.size<o.cost){sel.add(c);d.classList.add('sel')}upd()};car.append(d)});
 cancel.onclick=()=>{panelClose();res(null)};done.onclick=()=>{panelClose();res([...sel])};upd()})}
/* --- Pickbar (petunjuk + tombol Batal di dalam pop-up, bukan di arena) --- */
function pickShow(t,cb,st){$('pk-ok').style.display='none';$('pk-t').textContent=t;$('pickbar').classList.add('on');$('pk-x').style.display=cb?'':'none';UI.pkcb=cb;const s=$('pk-st');
 if(st){s.style.display='inline-flex';let k=st.k;const upd=()=>{$('pk-k').textContent='×'+k;st.onK&&st.onK(k)};$('pk-m').onclick=()=>{if(k>1){k--;upd()}};$('pk-p').onclick=()=>{if(k<st.max){k++;upd()}};upd()}else s.style.display='none'}
function pickHide(){$('pickbar').classList.remove('on');$('pk-ok').style.display='none';UI.pkcb=null}
$('pk-x').onclick=()=>{const cb=UI.pkcb;pickHide();if(cb)cb()};
/* --- Keputusan pemain (dipanggil mesin) --- */
function wantStart(o,drag){return new Promise(res=>{UI.want={mons:o.mons,drag,sd:o.sd,ctx:o.ctx,cancel:o.cancel,res};
 pickShow(o.title+(drag?' — seret ke slot Active yang menyala':' — tap Pokémon yang bercahaya'),o.cancel?()=>wantEnd(null):null);hud()})}
function wantEnd(v){const w=UI.want;if(!w)return;UI.want=null;UI.drag=null;pickHide();hud();w.res(v)}
const UIDEC={
 mon:o=>wantStart(o,['promote','retreat','gust'].includes(o.ctx)),
 cards:o=>panelPick({...o,max:o.max,min:o.min||0}),
 pay:o=>panelPay(o),
 cond:o=>dlg(`<h2>Pulihkan kondisi mana?</h2><p>${cname(o.mon.card)} sedang ${o.conds.map(k=>BADGE[k][2]).join(' & ')}.</p>`,o.conds.map(k=>[`${ic(BADGE[k][0])} ${BADGE[k][2]}`,k,'go'])),   // Lumiose Galette
 confirm:o=>dlg(`<h2>${o.title}</h2><p>${o.tx}</p>`,[['Pakai',true,'go'],['Lewati',false,'ghost']]),
 num:async o=>dlg(`<h2>${o.title}</h2>`,Array.from({length:o.max-o.min+1},(_,i)=>[String(o.min+i),o.min+i])),
 moveDmg:async o=>{
  const src=await wantStart({title:'Pilih Pokémonmu yang damage counter-nya mau dipindah',mons:o.srcs,sd:'p',ctx:'target',cancel:true},false);
  if(!src)return null;
  return new Promise(res=>{const mx=Math.min(o.max,src.dmg/10);UI.stage={mon:src,max:mx,tgts:o.tgts,res,moved:0,tgt:null,apply:o.apply};DCS.forEach((m,i)=>m.visible=i<mx);
   pickShow(`Kartu dan damage counter-nya naik ke area tangan. Ada ${mx} koin (1 koin = 10 damage). Seret koin ke Pokémon lawan, boleh sampai ${mx} koin ke Pokémon yang sama.`,()=>{UI.stage=null;DCS.forEach(m=>m.visible=false);sync();res(null)});sync()})},
 attachEnergies:o=>new Promise(res=>{UI.attach={list:[...o.energies],tgts:o.targets,apply:o.apply,res};pickShow(`Pasang Energi Dasar ke Pokémon Bench, sesuai teks ${cname(o.card)}. Seret tiap kartu Energi ke Pokémon tujuan. Tiap Energi bebas ke Pokémon mana pun.`,null);sync()}),
 mullDraw:o=>new Promise(res=>{const b=$('dlg-b');let v=o.max;   // ala PTCGL "Pick a number"
  b.innerHTML=`<div class="mlh p"><b>PILIH ANGKA</b></div><p>Bot mulligan ${o.theirs} kali${o.mine?`, kamu ${o.mine} kali`:''}. Mau ambil berapa kartu ekstra? Pokémon Basic yang terambil boleh ditaruh ke Bench.</p><div class="pkn">${Array.from({length:o.max+1},(_,i)=>`<button class="${i===v?'on':''}" data-v="${i}">${i}</button>`).join('')}</div>`;
  b.querySelectorAll('.pkn button').forEach(e=>e.onclick=()=>{v=+e.dataset.v;b.querySelectorAll('.pkn button').forEach(q=>q.classList.toggle('on',q===e))});
  const ok=document.createElement('button');ok.className='b sel';ok.textContent='Pilih';ok.onclick=()=>{$('dlg').classList.remove('on');res(v)};b.append(ok);$('dlg').classList.add('on')}),
 prizes:o=>o.n>=o.prizes.length?Promise.resolve([...o.prizes]):   // sisa Prize sama dgn jumlah yang diambil: langsung ambil semua, tanpa memilih
  new Promise(res=>{const n=o.prizes.length,k=o.n,back=BACKT.image.toDataURL?BACKT.image.toDataURL():'',b=$('dlg-b'),sel=[];
  b.innerHTML=`<h2>${ic('gift')} Ambil kartu Prize</h2><p>Kamu mengambil <b>${k}</b> kartu Prize. Pilih <b>${k}</b> dari ${n} kartu tertutup sekaligus (cincin kuning = pilihanmu), lalu tekan <b>Ambil Kartu</b>.</p><div class="pzg" style="grid-template-columns:repeat(${n>3?3:n},1fr)"></div>`;
  const grid=b.querySelector('.pzg'),ok=document.createElement('button'),upd=()=>{ok.disabled=sel.length!==k;ok.textContent=`Ambil Kartu (${sel.length}/${k})`};ok.className='b atk';
  o.prizes.forEach((c,i)=>{const e=document.createElement('button');e.className='pz';e.innerHTML=`<img src="${back}" alt=""><span>Prize ${i+1}</span>`;e.onclick=()=>{const j=sel.indexOf(c);if(j>=0){sel.splice(j,1);e.classList.remove('sel')}else if(sel.length<k){sel.push(c);e.classList.add('sel')}else if(k===1){grid.querySelectorAll('.pz').forEach(q=>q.classList.remove('sel'));sel.length=0;sel.push(c);e.classList.add('sel')}upd()};grid.append(e)});
  ok.onclick=()=>{$('dlg').classList.remove('on');res([...sel])};b.append(ok);upd();$('dlg').classList.add('on')}),
 place:async()=>{UI.placing=null;say('Seret Pokémon Basic ke kotak ACTIVE, lalu BENCH (opsional). Kartu tetap tertutup sampai semua siap.',9000);await new Promise(r=>{UI.placing=r;hud()});say('Menunggu lawan...',1200)},
 /* Basic dari kartu ekstra mulligan: boleh ke Bench (Active tetap), lalu Siap */
 benchExtra:async o=>{UI.placeOnly=new Set(o.cards.map(c=>c.id));say(`Pokémon Basic dari kartu ekstra (${o.cards.map(cname).join(', ')}) boleh diseret ke BENCH. Tekan Siap bila selesai.`,9000);
  await new Promise(r=>{UI.placing=r;hud()});UI.placeOnly=null},
 /* Permen Langka: tanpa pop-up, seret kartu Stage 2 dari tanganmu ke Pokémon Basic yang bercahaya */
 candy:o=>new Promise(res=>{UI.candy={...o,res};pickShow(`Permen Langka: seret ${o.cards.map(cname).join(' / ')} dari tanganmu ke Pokémon Basic yang bercahaya`,()=>{UI.candy=null;sync();res(null)});sync();hud()}),
 turn:async()=>{}};
DEC.p=UIDEC;DEC.o={...BOT,turn:s=>botTurn(s)};
/* --- Efek visual / FX dari mesin --- */
const cardFlash=g=>{const m=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.copy(g.position);m.position.y+=.06;m.rotation.copy(g.rotation);m.scale.copy(g.scale);scene.add(m);
 FXL.push({o:m,t0:performance.now(),dur:750,upd(p){m.material.opacity=p<.18?p/.18:1-(p-.18)/.82}})};
/* warna pita/label mengikuti bingkai kartu per tipe: [atas, bawah, teks] */
const TYB={D:['#2f9ea3','#13585d','#fff'],C:['#f1f5f9','#b8c0cc','#1e293b'],P:['#c084fc','#7e22ce','#fff'],R:['#f87171','#b91c1c','#fff'],G:['#86efac','#15803d','#fff'],W:['#7dd3fc','#0369a1','#fff'],L:['#fde047','#eab308','#1e293b'],F:['#d6a26a','#92400e','#fff'],M:['#e2e8f0','#94a3b8','#1e293b'],N:['#e6c65a','#a07c1c','#fff']};
const tyVars=(el,t)=>['--b1','--b2','--tt'].forEach((k,i)=>el.style.setProperty(k,(TYB[t]||TYB.C)[i]));
/* label #abt (Ability / Pokémon Tool) di atas kartu g; bila terpotong tepi atas layar pindah ke bawah kartu; dijepit di dalam layar */
const showTag=(html,g,tool)=>{const t=$('abt');t.innerHTML=html;t.classList.remove('on');t.classList.toggle('tool',!!tool);void t.offsetWidth;t.classList.add('on');
 if(!g){t.style.left='50%';t.style.top='16%';return t}const p=g.position,sy=z=>(1-p.clone().setZ(z).project(cam).y)/2*innerHeight,y=sy(p.z-.9*g.scale.x),hw=t.offsetWidth/2;
 t.style.left=Math.min(innerWidth-6-hw,Math.max(6+hw,(p.clone().project(cam).x+1)/2*innerWidth))+'px';t.style.top=(y-t.offsetHeight<6?sy(p.z+.8*g.scale.x)+t.offsetHeight:y)+'px';return t};
const monMeshes=m=>[m.id,...m.en.map(e=>e.id),m.tool&&m.tool.id].map(i=>M.get(i)).filter(Boolean);
Object.assign(FX,{
 /* kocok ala PTCGL: kartu deck berhamburan sambil berputar di sekitar deck, lalu dirapikan lagi */
 shuffle:async sd=>{const[x,z,s0]=Z.dk(sd==='p'?1:-1),t0=performance.now(),D=RMO?200:950;shufT[sd]=t0+D;
  if(!RMO)for(let i=0;i<10;i++){const c=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({map:BACKT,alphaTest:.5,side:THREE.DoubleSide})),a0=Math.random()*6.28,r=(.3+Math.random()*.6)*s0,sw=(Math.random()<.5?-1:1)*(1+Math.random()),rz=rs(1.1),h=.12+i*.035;c.rotation.x=-Math.PI/2;scene.add(c);
   FXL.push({o:c,t0,dur:D,upd(p){const u=p<.3?p/.3:p>.7?(1-p)/.3:1,e=u*u*(3-2*u),a=a0+sw*p*2.4;c.position.set(x+Math.cos(a)*r*e,.1+h*e,z+Math.sin(a)*r*e*.8);c.rotation.z=rz*e+sw*p*1.5;c.scale.setScalar(s0*(1+.06*e))}})}
  await sleep(D+40)},
 /* kena serangan ala Pocket: kilatan & semburan warna tipe, angka damage besar diam di tengah kartu ±0,7 dtk, baru sesudahnya HP menghitung turun (o.hold) */
 hit:(id,d,type)=>{const o=OV.get(id);if(o)o.hold=performance.now()+(RMO?0:720);sync();const g=M.get(id);if(!g)return;
  g.userData.sh=1.2;g.userData.fl=1;shake(Math.min(.28,.05+d/500));const T=g.userData.t,p=T?new THREE.Vector3(T.x,T.y,T.z):g.position.clone(),col=ATK.hc||type&&VC(type);   // posisi slot, bukan kartu yang masih menerjang: damage ke diri sendiri tampil di penyerang
  if(col){ring(p.x,p.z,col);burst(p.x,p.z,col,60,2.6);impact(p.clone().setY(p.y+.4),col,Math.min(1.5,.85+d/260)*g.scale.x);const f=$('flash');f.style.setProperty('--fc','#'+col.toString(16).padStart(6,'0'));f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
  const[cx,cy]=px2(p.x,p.y,p.z),w=Math.abs(px2(p.x+.5*g.scale.x,p.y,p.z)[0]-px2(p.x-.5*g.scale.x,p.y,p.z)[0]),e=document.createElement('div');e.className='dmg';e.textContent=d;
  e.style.cssText=`left:${cx}px;top:${cy}px;--fs:${Math.round(Math.max(30,Math.min(110,w*.42)))}px`;document.body.append(e);setTimeout(()=>e.remove(),1150)},
 /* heal ala Pocket: angka hijau besar di tengah kartu ±0,65 dtk + healFx, baru HP menghitung naik (o.hold) */
 heal:(id,n)=>{const o=OV.get(id);if(o)o.hold=performance.now()+(RMO?0:650);sync();const g=M.get(id);if(!g)return;if(!RMO)healFx(g);
  const T=g.userData.t,p=T?new THREE.Vector3(T.x,T.y,T.z):g.position,[cx,cy]=px2(p.x,p.y,p.z),w=Math.abs(px2(p.x+.5*g.scale.x,p.y,p.z)[0]-px2(p.x-.5*g.scale.x,p.y,p.z)[0]),e=document.createElement('div');
  e.className='dmg heal';e.textContent=n;e.style.cssText=`left:${cx}px;top:${cy}px;--fs:${Math.round(Math.max(30,Math.min(110,w*.42)))}px`;document.body.append(e);setTimeout(()=>e.remove(),1150)},
 energy:async(m,e)=>{sync();const g=M.get(m.id),o=OV.get(m.id);if(!g||!o||!o.g.visible)return;o.g.updateMatrixWorld(true);
  const k=e.key==='prism'?'prism':e.t,i=m.en.length<=4?m.en.indexOf(e):orbList(m).findIndex(x=>x[0]===k),sl=o.sub.children.find(c=>c.userData.slot===i);
  const to=sl?sl.getWorldPosition(new THREE.Vector3()):g.position.clone(),fr=g.position.clone().setY(g.position.y+1),s1=g.scale.x,b=orbMesh(k,1);if(sl)sl.visible=false;b.rotation.x=-Math.PI/2;scene.add(b);
  FXL.push({o:b,t0:performance.now(),dur:900,upd(p){const q=Math.min(1,p/.28),gr=1+2.6*(1-(1-q)**3)*(1+.22*Math.sin(q*Math.PI)),f=p<.45?0:(p-.45)/.55,ef=f*f*(3-2*f);b.position.lerpVectors(fr,to,ef);b.scale.setScalar(s1*(gr+(1-gr)*ef))}});
  await sleep(900);if(sl)sl.visible=true;g.userData.pop=.35;ring(g.position.x,g.position.z,0x67e8f9);burst(to.x,to.z,AURAC[k]||0x67e8f9,24,1.2)},
 /* KO: kartu berkilat merah & bergetar, meredup abu-abu lalu terangkat miring; sesudahnya terbang melengkung ke discard (flyTo), Energi/Tool menyusul */
 ko:async id=>{const o=OV.get(id);if(o&&o.a&&!RMO)await sleep(Math.max(0,o.a.t0+o.a.D-performance.now())+200);   // tunggu angka damage & HP turun ke 0 dulu (ala Pocket)
  const g=M.get(id);if(!g){await sleep(300);return}const u=g.userData,p=g.position;u.sh=1.6;u.fl=1;shake(.22);ring(p.x,p.z,0xff4d4d);burst(p.x,p.z,0xffffff,40,2.4);burst(p.x,p.z,0xff5a3c,50,2.2,.2);flashc('#ff3b3b');
  await sleep(RMO?100:420);u.ko=1;u.lift=.8;u.stz=(Math.random()<.5?-1:1)*.35;await sleep(RMO?100:430)},
 /* evolusi ala TCG Pocket, satu timeline tanpa jeda (evoCurve di loop): kartu evolusi langsung meluncur menumpuk di atas Pokémon (0-0,3 dtk),
    kartu baru terangkat & membesar dgn sunburst dua lapis + kilau di belakangnya, berkilat putih, turun lagi ke slot (s/d 1,35 dtk) lalu
    pilar cahaya naik + bingkai cyan. HP baru berubah sesudah mendarat (o.hold) */
 evolve:async id=>{const T0=performance.now(),o=OV.get(id);if(o)o.hold=T0+(RMO?0:1380);sync();const g=M.get(id),it=LI.get(id),mon=it&&it.mon;if(!g||!mon)return;
  const u=g.userData,nc=mon.card,oc=mon.under[mon.under.length-1],P=new THREE.Vector3(it.x,it.y,it.z),col=VC(nc.type);
  if(RMO||!oc){ring(P.x,P.z,0xfcd34d);u.pop=1;return}
  const hm=M.get(nc.id),a=hm?hm.position.clone():P.clone().setY(P.y+1.6),r0=hm?hm.rotation.x:-Math.PI/2,s0=hm?hm.scale.x:it.s;if(hm){scene.remove(hm);M.delete(nc.id)}
  u.evoT=1e15;u.f.material.map=cardTex(oc);u.f.material.needsUpdate=true;u.key='';u.evo={t0:T0};   // kartu lama tetap tampil di bawah sampai ditukar
  const gh=newCardMesh();gh.userData.f.material.map=cardTex(nc);gh.position.copy(a);gh.rotation.x=r0;gh.scale.setScalar(s0);scene.add(gh);
  FXL.push({o:gh,t0:T0,dur:300,upd(p){const e=1-(1-p)**3;gh.position.set(a.x+(P.x-a.x)*e,a.y+(P.y+.03-a.y)*e,a.z+(P.z-a.z)*e);gh.rotation.x=r0+(-Math.PI/2-r0)*e;gh.scale.setScalar(s0+(it.s-s0)*e)}});
  const halo=(c,dur,f,d=0)=>{const m=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({map:RG[0].material.map,color:c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));m.rotation.x=-Math.PI/2;scene.add(m);
   FXL.push({o:m,t0:performance.now()+d,dur,upd(p){if(p<0)return;m.position.set(P.x,.21,P.z);f(m,p)}})};
  halo(0x4ade80,520,(m,p)=>{m.scale.setScalar(it.s*1.16);m.material.opacity=Math.sin(Math.PI*p)});   // slot berpendar hijau saat kartu menumpuk
  await sleep(300);u.evoT=0;sync();sunburst(g,col,1050);burst(P.x,P.z,0xfff1a8,30,2);   // tukar ke kartu baru, langsung terangkat
  const wf=new THREE.Mesh(GEO,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(wf);
  FXL.push({o:wf,t0:performance.now()+260,dur:560,upd(p){if(p<0)return;wf.position.copy(g.position);wf.position.y+=.02;wf.rotation.copy(g.rotation);wf.scale.copy(g.scale);wf.material.opacity=p<.3?p/.3*.95:.95*(1-(p-.3)/.7)}});   // kilat putih di kartu
  await sleep(1060);pillars(P,it.s,col);halo(0x67e8f9,900,(m,p)=>{m.scale.setScalar(it.s*(1.13+p*.06));m.material.opacity=p<.15?p/.15:1-(p-.15)/.85});ring(P.x,P.z,0x67e8f9);burst(P.x,P.z,col,26,1.6);shake(.05);
  await sleep(380);u.evo=null},
 announce:async o=>{const c=o.mon.card;
  if(o.kind==='Jurus')return atkIntro(o);
  /* Ability: kartu berkilat putih + percikan emas, label nama menempel di atas kartu sampai efeknya selesai (abend) */
  const g=M.get(o.mon.id);tyVars(showTag(`<b><em>Ability</em>${o.name}</b>`,g),c.type);
  if(g){const p=g.position;cardFlash(g);ring(p.x,p.z,0xfcd34d);burst(p.x,p.z,0xfcd34d,90,3,.3);burst(p.x,p.z,0xffffff,30,2,.22);g.userData.pop=.6}
  await sleep(1100)},
 abend:()=>$('abt').classList.remove('on'),
 revealPrizes:async(sd,ch)=>{if(sd!=='p'){await sleep(500);return}   // kartu Prize di meja tetap tertutup; hanya ditampilkan di depan layar
  $('ann').innerHTML=`<div class="prz">${ch.map(c=>`<img src="${imgOf(c)}" alt="${cname(c)}">`).join('')}</div><b>Kartu Prize yang kamu ambil</b>`;$('ann').classList.add('on');await sleep(2400);$('ann').classList.remove('on');await sleep(250)},
 /* kartu yang diambil Bot & wajib diperlihatkan (mis. hasil PokéPad): keluar dari deck Bot sambil berbalik, berjajar besar di tengah, lalu terbang ke tangan Bot (ala PTCGL) */
 reveal:async(sd,cards,src)=>{if(sd==='p')return;const dk=Z.dk(-1);say(`Bot memperlihatkan ${cards.map(cname).join(', ')} (${cname(src)})`,3400,'bot');
  await cardShow(cards,px2(dk[0],.1,dk[1]),px2(0,.4,LAY.ohandZ||-5),Math.round((900+SPD[UI.si][1])*[1,.75,.45][UI.si]))},
 flips:(sd,rs,why,tx,slow)=>pocketFlips(sd,rs,why,tx,slow),
 /* kartu Trainer dimainkan: kartumu langsung ke tempat main di arena (tanpa pop-up; Bos/Prime Catcher langsung seret di arena), kartu Bot meluncur ala PTCGL */
 playcard:async(c,sd)=>{UI.limbo={c,sd,pos:sd==='p'?'side':'hidden'};sync();
  if(sd==='p'){playSplash(c,sd);await sleep(420)}
  else{say(`Bot memakai ${cname(c)}`,4200,'bot');await cardFlyIn(c,sd);UI.limbo.pos='side';sync();playSplash(c,sd);await sleep(500)}},
 endcard:async(c,sd,cancelled)=>{if(!cancelled)await sleep(sd==='p'?350:Math.round(900*[1,.75,.45][UI.si]));UI.limbo=null;sync()},   // lalu terbang ke discard (flyTo)
 /* bagi 7 kartu awal ala PTCGL: punyamu tampil tegak menghadap layar (grid 4+3) lalu turun ke tangan (dealShow); punya Bot keluar dari deck satu per satu ke tangannya */
 deal:async sides=>{const t0=performance.now()+150,me=sides.includes('p');UI.deal=UI.deal||{};sides.forEach(sd=>{if(sd!=='p')UI.deal[sd]={t0};else delete UI.deal.p});sync();
  const w=sleep(RMO?300:150+7*85+600);if(me)await handShow([...G.p.hand]);await w;sides.forEach(sd=>delete UI.deal[sd]);sync()},
 /* kartu dari efek (Lillie, Iris, Taring Rakus, kartu ekstra mulligan, Kartu Merah dari Bot): punyamu ditunjukkan menghadap layar dulu */
 drawn:async(sd,cards)=>{if(sd==='p')await handShow(cards);else sync()},
 mullWait:async sd=>{say(sd==='o'?'Bot tidak punya Pokémon Basic. Siapkan Active & Bench-mu dulu, lalu Bot mulligan.':'Kamu tidak punya Pokémon Basic. Bot bersiap dulu, lalu kamu mulligan.',3600,sd==='o'?'bot':'info');await sleep(900)},
 /* mulligan: tangan dibuka berjajar di tengah, lalu terbang kembali ke deck (mesin) dan dikocok; kartu baru ditahan di deck sampai dibagi */
 /* mulligan (kamu & Bot sama): pita MULLIGAN! (biru = kamu, merah = Bot) + tangan ditunjukkan lurus menghadap layar, lalu masuk ke deck */
 mullShow:async(sd,k)=>{const me=sd==='p',m=me?1:-1,dk=Z.dk(m),D=px2(dk[0],.1,dk[1]);UI.mull={sd};sync();   // kartu 3D tangan disembunyikan selama ditunjukkan
  const hb=banner(`<i>${ic(me?'user':'bot')}</i><span><b>MULLIGAN!</b><small>${me?'Kamu':'Bot'} tidak punya Pokémon Basic${k>1?` · ke-${k}`:''}</small></span>`,sd);
  await cardShow(G[sd].hand,me?px2(0,.95,LAY.handZ||5):px2(0,.4,LAY.ohandZ||-5),D,1700,{dy:innerHeight*.06,hk:.7});hb();UI.mull=null},
 mulligan:async(sd,hands)=>{const me=sd==='p',bx=$('dlg-b');bx.classList.add('mlw');   // panel lebar; daftar kartu bergulir sendiri, tombol Selesai selalu terlihat
  await dlg(`<div class="mlh ${sd}"><small>${me?'Kamu':'Bot'}</small><b>MULLIGAN</b></div><p>${me?'Kamu':'Bot'} harus mulligan ${hands.length} kali sebelum mendapat Pokémon Basic.</p><div class="mlsc">${hands.map((h,i)=>`<div class="mls"><b>MULLIGAN ${i+1}</b><div class="mlg">${h.map(c=>`<img src="${imgOf(c)}" alt="${cname(c)}">`).join('')}</div></div>`).join('')}</div>`,[['Selesai',1,'go']]);bx.classList.remove('mlw')},
 dealPrizes:async()=>{say('Membagikan kartu Prize...',1500);await sleep(900)},
 /* pertandingan dimulai: label START! besar + lampu samping menyala dua warna (merah sisi Bot, biru sisimu) berdenyut; turnstart menggantinya */
 revealSetup:async()=>{const l=$('tl'),go=$('go');l.className='';void l.offsetWidth;l.className='start';go.innerHTML='<b>START!</b>';go.className='';void go.offsetWidth;go.className='on';
  for(const sd of['p','o']){const a=G[sd].active;if(a){const g=M.get(a.id);if(g)ring(g.position.x,g.position.z,0x7dd3fc)}}await sleep(RMO?700:2100);go.className=''},
 /* tunggu angka damage, HP turun, & kartu terbang selesai (efek serangan/Checkup) sebelum lanjut; ms = jeda tambahan */
 settle:async(ms=0)=>{for(let i=0;i<120;i++){const now=performance.now();let busy=!!document.querySelector('.dmg');for(const o of OV.values())if(o.a&&now<o.a.t0+o.a.D+120)busy=true;for(const g of M.values())if(g.userData.fly)busy=true;if(!busy)break;await sleep(50)}if(ms&&!RMO)await sleep(ms)},
 turnstart:async sd=>{await FX.settle([700,550,350][UI.si]);closeAm();const l=$('tl');l.className='';void l.offsetWidth;l.className='on '+sd;const t=$('turn');t.textContent=sd==='p'?'Giliran Kamu':'Giliran Bot';t.className='on '+sd;
  if(sd==='p')say('Seret kartu dari tangan ke arena. Kartu bercahaya kuning = Ability bisa dipakai.',4500,'good');
  await sleep(3000);t.className=''},
 end:r=>{setTimeout(()=>showEnd(r),700)},
 decideFirst:async()=>{
  const method=Math.random()<.5?'coin':'dice';
  await dlg(`<h2>${method==='coin'?ic('coin')+' Lempar koin':ic('dice')+' Lempar dadu'}</h2><p>Penentu siapa jalan duluan dipilih acak oleh sistem untuk pertandingan ini. Pemenang boleh memilih jalan duluan atau kedua.</p>`,[['Mulai',1]]);
  let win;
  if(method==='coin'){const call=await dlg('<h2>Tebak koin</h2>',[[`<img class="ic" src="${coinUrl(1)}" alt=""> Kepala`,1],[`<img class="ic" src="${coinUrl(0)}" alt=""> Ekor`,0,'atk']]);const heads=Math.random()<.5;await tossCoin(heads);win=heads===!!call?'p':'o';say(`Hasil: ${heads?'Kepala':'Ekor'}, ${win==='p'?'kamu':'Bot'} menang koin`,2500)}
  else{const call=await dlg('<h2>Tebak dadu</h2><p>Satu dadu (1–6). Tebak angka yang keluar ganjil atau genap.</p>',[['Ganjil',1],['Genap',0,'atk']]);const v=1+rnd(6);await rollDice(v);win=(v%2===1)===!!call?'p':'o';say(`Dadu: ${v} (${v%2?'ganjil':'genap'}), ${win==='p'?'kamu':'Bot'} menang`,2500)}
  await sleep(900);let first='o';
  if(win==='p')first=await dlg('<h2>Kamu menang!</h2><p>Mau jalan duluan atau kedua?</p>',[['Jalan duluan','p'],['Jalan kedua','o','atk']]);else say('Bot memilih jalan duluan',2000);
  return{first,msg:`${method==='coin'?'Koin':'Dadu'}: ${win==='p'?'Kamu':'Bot'} menang; ${first==='p'?'Kamu':'Bot'} jalan duluan`}}
});
const showRes=t=>{const e=$('res');e.textContent=t;e.classList.remove('on');void e.offsetWidth;e.classList.add('on')};
/* koin/dadu 3D: gerak hasil simulasi fisika (simCoin/simDie) diputar ulang per frame di loop; label hasil muncul saat benda diam */
const tossCoin=heads=>new Promise(res=>{const S=simCoin(),C=COIN,top=S.up===heads;C.m.material[1]=top?C.HM:C.TM;C.m.material[2]=top?C.TM:C.HM;coinPose(S.F[0]);C.g.visible=C.sh.visible=true;
 CS={t0:performance.now(),F:S.F,res:()=>{showRes(heads?'KEPALA':'EKOR');setTimeout(()=>{C.g.visible=C.sh.visible=false;CS=null;res()},1500)},done:0}});
const rollDice=v=>new Promise(res=>{const F=simDie(v),D=DIE;diePose(F[0]);D.m.visible=D.sh.visible=true;DS={t0:performance.now(),F,res:()=>{showRes(String(v));setTimeout(()=>{D.m.visible=D.sh.visible=false;DS=null;res()},1500)},done:0}});
function showEnd(r){const b=$('end-b');b.innerHTML=`<h2>${r==='p'?ic('win')+' Kamu menang!':r==='o'?(G.why==='menyerah'?ic('flag')+' Kamu menyerah':ic('skull')+' Bot menang'):ic('tie')+' Seri'}</h2><p>${G.log.slice(-3).map(iconize).join('<br>')}</p>`;
 const add=(l,cls,f)=>{const e=document.createElement('button');e.className='b '+cls;e.textContent=l;e.onclick=()=>{$('end').classList.remove('on');f()};b.append(e)};
 if(r==='tie')add('Sudden Death (1 Prize)','atk',()=>startBattle(UI.last.list,UI.last.fmt,{prizes:1}));
 add('Main lagi','go',()=>startBattle(UI.last.list,UI.last.fmt));add('Menu utama','ghost',()=>toMenu());$('end').classList.add('on')}
/* --- Lempar koin dalam permainan ala TCG Pocket: layar meredup, teks aturan di atas, pil jumlah Kepala/Ekor + jumlah lemparan.
   Koin pertama dilempar dari bawah ke tengah lalu pindah ke slotnya; koin berikutnya dilempar langsung di slotnya (3 per baris); hasil ditahan sebentar lalu tutup (tanpa layar biru muda: permintaan user) --- */
const coinUrl=(()=>{const U={};return h=>U[h]||(U[h]=coinArt(h,256).toDataURL())})();
async function pocketFlips(sd,rs,why,tx,slow){closeAm();if(slow)await sleep(350);const o=$('flp'),n=rs.length,f=slow?1.6:UI.si===2?.7:1,W=innerWidth,H=innerHeight,D=Math.round(Math.min(W*.27,H*.2,190)),gp=Math.round(D*.18),A=(e,kf,ms,ez)=>e.animate(kf,{duration:Math.round(ms*f),easing:ez||'ease-out',fill:'forwards'}).finished;
 o.innerHTML=`<div class="ftx"><small>${sd==='p'?'Lemparan koinmu':'Lemparan koin Bot'} • ${why}</small>${tx||''}</div><div class="fpill"><span><img src="${coinUrl(1)}" alt="Kepala"><b class="fh">0</b></span><span><img src="${coinUrl(0)}" alt="Ekor"><b class="ft">0</b></span><em>Lemparan: <b>${n}</b></em></div>`;
 o.className='on '+sd;let hN=0,tN=0;
 const slot=i=>n===1?[W/2,H*.5]:[W/2+(i%3-1)*(D+gp),H*.42+((i/3)|0)*(D+gp)],pos=(x,y,k=1)=>`translate(${x-D/2}px,${y-D/2}px) scale(${k})`,
  bump=(c,v)=>{const b=o.querySelector('.'+c);b.textContent=v;b.classList.remove('pu');void b.offsetWidth;b.classList.add('pu')};
 for(let i=0;i<n;i++){const h=rs[i],el=document.createElement('div'),[x1,y1]=i?slot(i):[W/2,H*.5],[x0,y0]=i?[x1,y1+D*.7]:[W/2,H*.86],end=(4+i%2)*360+(h?0:180);
  el.className='fc';el.style.cssText=`width:${D}px;height:${D}px;--t:${Math.max(5,Math.round(D*.07))}px;transform:${pos(x0,y0,.75)}`;
  el.innerHTML=`<div class="fcn"><i class="fa" style="background-image:url(${coinUrl(1)})"></i>${'<i class="ed"></i>'.repeat(5)}<i class="fb" style="background-image:url(${coinUrl(0)})"></i></div><s class="fsh"></s>`;o.append(el);if(slow&&!i)await sleep(800);   // pelan: koin diam dulu di bawah, baru dilempar
  A(el,[{transform:pos(x0,y0,.75)},{transform:pos((x0+x1)/2,Math.min(y0,y1)-D*1.1,1.3),offset:.48},{transform:pos(x1,y1,1)}],900,'cubic-bezier(.3,.6,.4,1)');   // naik lalu jatuh (makin dekat = makin besar)
  await A(el.firstChild,[{transform:'rotateX(0deg)'},{transform:`rotateX(${end+14}deg)`,offset:.86},{transform:`rotateX(${end-7}deg)`,offset:.94},{transform:`rotateX(${end}deg)`}],1000,'cubic-bezier(.2,.7,.3,1)');   // berputar, mendarat sedikit memantul
  if(!i&&n>1){await sleep(380*f);const[x2,y2]=slot(0);await A(el,[{transform:pos(x1,y1)},{transform:pos(x2,y2)}],320,'ease-in-out')}
  h?bump('fh',++hN):bump('ft',++tN);await sleep(120*f)}
 await sleep(slow?1300:380*f);await sleep(slow?950:950*f);o.className='';o.innerHTML=''}
/* --- Menu Pokémon ala PTCGL (pengganti zoom lama): kartu besar + tumpukan (Stage 2/1 → Basic, Energi, Tool; ketuk untuk melihat) + panel Ability,
   serangan (biaya, nama, damage), kelemahan/resistansi, mundur. Tombol aksi hanya untuk Pokémon-mu di giliranmu; selain itu panel info.
   Desktop: di tengah layar; HP: di atas posisi Pokémon (dijepit di layar) --- */
const costIcons=c=>[...c].map(t=>`<img class="ci" src="${ICONS.type[t]||ICONS.type.C}" alt="${(TYPES[t]||['Normal'])[0]}">`).join('');
function monMenu(mon,sd,pick){const c=mon.card,el=$('am'),me=sd==='p',my=me&&canAct(),isAct=G[sd].active===mon,setup=me&&G.phase==='setup'&&UI.placing&&(!UI.placeOnly||!isAct&&UI.placeOnly.has(c.id)),
  dm=a=>a.dmg?a.dmg+(a.plus?'+':a.times?'×':''):'',stg=k=>k.stage===2?'Stage 2':k.stage===1?'Stage 1':'Basic',T=TYB[c.type]||TYB.C,sc=spChip(mon),
  st=[[c,stg(c)],...[...mon.under].reverse().map(u=>[u,stg(u)]),...mon.en.map(e=>[e,'Energi']),...(mon.tool?[[mon.tool,'Tool']]:[])],si=Math.max(0,st.findIndex(x=>x[0]===pick)),
  ab=c.ab&&!c.ab.passive&&!c.ab.setup,abw=my&&ab?abWhy('p',mon):null,rw=my&&isAct?whyRetreat('p'):null,rc=rcost(mon),
  row=(a,k)=>{const w=my&&isAct?whyAttack('p',k):null,h=`<span class="amt"><span class="cost">${costIcons(a.cost)}</span><b>${a.n}</b><i>${dm(a)}</i></span>${a.tx?`<p>${a.tx}</p>`:''}`;
   return w===null?`<div class="amr info">${h}</div>`:`<button class="amr${w?' off':''}" data-a="${k}"${w?' disabled':''}>${h}${w?`<small>${w}</small>`:''}</button>`};
 el.innerHTML=`<div class="amw"><div class="amc"><img src="${imgOf(st[si][0])}" alt="${cname(c)}">${st.length>1?`<div class="ams">${st.map(([cd,l],i)=>`<button class="zt${i===si?' on':''}" data-i="${i}"><img src="${imgOf(cd)}" alt="${cname(cd)}"><span>${l}</span></button>`).join('')}</div>`:''}</div>
 <div class="amp"><div class="amh" style="--b1:${T[0]};--b2:${T[1]};--tt:${T[2]}"><b>${cname(c)}</b><span>HP ${Math.max(0,hp(mon))}/${c.hp}</span></div>${sc.length?`<div class="amchips">${sc.map(q=>`<span class="chip">${q}</span>`).join('')}</div>`:''}
 ${c.ab?(abw===null?`<div class="amr ab info"><span class="amt"><em>Ability</em><b>${c.ab.n}</b></span><p>${c.ab.tx}</p></div>`:`<button class="amr ab${abw?' off':''}" data-a="ab"${abw?' disabled':''}><span class="amt"><em>Ability</em><b>${c.ab.n}</b></span><p>${c.ab.tx}</p>${abw?`<small>${abw}</small>`:''}</button>`):''}
 ${c.atk.map(row).join('')}
 <div class="amf"><span>Lemah ${c.weak?costIcons(c.weak)+' ×2':'–'}</span><span>Tahan ${c.res?costIcons(c.res)+' −30':'–'}</span>${rw===null?`<span class="amri">Mundur ${rc?costIcons('C'.repeat(rc)):'0'}</span>`:`<button class="amret" data-a="ret"${rw?` disabled title="${rw}"`:''}>Mundur ${rc?costIcons('C'.repeat(rc)):'0'}</button>`}</div>
 ${setup?`<button class="b ghost" data-a="back">${ic('undo')} Kembalikan ke tangan</button>`:''}</div></div>`;
 el.classList.add('on');UI.am=1;hideHv();
 const w=el.firstChild,q=w.querySelector('.amc'),it=LI.get(mon.id);
 if(LAYMODE){w.style.left=Math.max(6,(innerWidth-w.offsetWidth)/2)+'px';w.style.top=Math.max(6,(innerHeight-w.offsetHeight)/2)+'px'}   // desktop: tengah layar
 else{const[ax,ay]=it?px2(it.x,.12,it.z):[innerWidth/2,innerHeight/2];w.style.left=Math.max(6,Math.min(innerWidth-w.offsetWidth-6,ax-q.offsetLeft-q.offsetWidth/2))+'px';w.style.top=Math.max(6,Math.min(innerHeight-w.offsetHeight-6,ay-q.offsetTop-q.offsetHeight/2))+'px'}
 el.onclick=e=>{const t=e.target.closest('.zt');if(t){const i=+t.dataset.i;q.firstChild.src=imgOf(st[i][0]);q.querySelectorAll('.zt').forEach(z=>z.classList.toggle('on',z===t));return}
  const b=e.target.closest('[data-a]');if(!b){if(!e.target.closest('.amp,.amc'))closeAm();return}if(b.disabled)return;const a=b.dataset.a;closeAm();
  if(a==='back')setupRemove('p',mon);else if(a==='ab')run(()=>actAbility('p',mon));else if(a==='ret')run(()=>actRetreat('p'));else run(()=>actAttack('p',+a))}}
const closeAm=()=>{$('am').classList.remove('on');UI.am=0};
/* --- Drag & drop + tap + pratinjau --- */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),PL=new THREE.Plane(new THREE.Vector3(0,1,0),-.9),PT=new THREE.Vector3();
const aim=e=>{ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,cam)};
function hitId(e){aim(e);const h=ray.intersectObjects([...PX.values()],false)[0];return h?h.object.userData.id:null}
const hitCoin=e=>{if(!UI.stage)return -1;aim(e);const h=ray.intersectObjects(DCS.filter(m=>m.visible),false)[0];return h?DCS.indexOf(h.object):-1};
const ownMons=()=>[...LI.values()].filter(it=>it.sd==='p'&&(it.zone==='act'||it.zone==='ben'));
const overMon=(x,z,list)=>list.find(it=>Math.abs(x-it.x)<.5*it.s+.12&&Math.abs(z-it.z)<.7*it.s+.12);
function showHv(c){$('hv-i').src=imgOf(c);$('hv').classList.add('on')}const hideHv=()=>$('hv').classList.remove('on');
const canPrev=it=>it&&it.c&&!it.hide&&(it.up||it.sd==='p')&&!(G.hidden&&it.sd==='o')&&!['dk','pz','ohand'].includes(it.zone);
function startDrag(it){
 if(it.zone==='hand'){const c=G.p.hand[it.idx];if(!c)return;if(!(UI.candy?UI.candy.cards.includes(c):G.phase==='setup'?UI.placing&&!UI.panel:canAct()))return;UI.drag={id:it.id,card:c,x:it.x,z:it.z,hi:null,txt:'',candy:!!UI.candy};hov=null}
 else if(it.zone==='pend'&&UI.attach){UI.drag={id:it.id,card:UI.attach.list[it.idx],pend:1,x:it.x,z:it.z,hi:null,txt:''}}
 else if(UI.want&&UI.want.drag&&it.mon&&UI.want.mons.includes(it.mon)){UI.drag={id:it.id,mon:it.mon,x:it.x,z:it.z,hi:null,txt:''}}
 if(UI.drag){cvs.style.cursor='grabbing';hideHv();UI.hp=null;UI.handUp=false;$('tip').style.display='none'}}
function moveDrag(e){
 aim(e);const p=ray.ray.intersectPlane(PL,PT);if(!p)return;const d=UI.drag;d.x=p.x;d.z=p.z-(e.pointerType==='touch'?1.1:.2);d.hi=null;d.zone=null;let txt='';
 if(d.coin){const opp=[...LI.values()].filter(it=>it.sd==='o'&&(it.zone==='act'||it.zone==='ben')&&UI.stage.tgts.includes(it.mon)&&(!UI.stage.tgt||it.mon===UI.stage.tgt)),ov=overMon(d.x,d.z,opp);d.tgt=ov?ov.mon:null;d.hi=ov?{x:ov.x,z:ov.z,s:ov.s,ok:1}:null;txt=ov?`Lepas untuk memindahkan 10 damage ke ${cname(ov.mon.card)}`:'Seret koin ke Pokémon lawan yang bercahaya'}
 else if(d.pend){const tg=[...LI.values()].filter(q=>q.sd==='p'&&q.zone==='ben'&&UI.attach.tgts.includes(q.mon)),ov=overMon(d.x,d.z,tg);d.ov=ov;d.hi=ov?{x:ov.x,z:ov.z,s:ov.s,ok:1}:null;txt=ov?`Lepas untuk memasang ${cname(d.card)} ke ${cname(ov.mon.card)}`:'Seret kartu Energi ke Pokémon Bench tujuan'}
 else if(d.candy){const tg=ownMons().filter(q=>UI.candy.mons.includes(q.mon)&&UI.candy.ok(d.card,q.mon)),ov=overMon(d.x,d.z,tg);d.ov=ov;d.hi=ov?{x:ov.x,z:ov.z,s:ov.s,ok:1}:null;
  txt=ov?`Lepas untuk mengevolusikan ${cname(ov.mon.card)} menjadi ${cname(d.card)}`:`Seret ${cname(d.card)} ke Pokémon Basic yang bercahaya`}
 else if(d.mon){const w=UI.want,m=w.sd==='p'?1:-1,[ax,az]=Z.act(m);const over=Math.abs(d.x-ax)<1&&Math.abs(d.z-az)<1.2;d.over=over;d.hi={x:ax,z:az,s:Z.act(m)[2],ok:1};txt=over?'Lepas untuk memajukan '+cname(d.mon.card):'Seret ke kotak ACTIVE yang menyala'}
 else{const c=d.card,S=G.p,mons=ownMons(),ov=overMon(d.x,d.z,mons);d.ov=ov;d.act=0;d.dz=0;
  const az=Z.act(1)[1],as=Z.act(1)[2],nb=Z.ben(S.bench.length,1),benZone=Math.abs(d.x-nb[0])<nb[2]*.5+.2&&Math.abs(d.z-nb[1])<nb[2]*.7+.25,actZone=Math.abs(d.x)<as*.5+.3&&Math.abs(d.z-az)<as*.7+.3;
  const slotBen=Z.ben(S.bench.length,1);
  if(G.phase==='setup'){const wantAct=!S.active,elig=(isBasic(c)||(c.ab&&c.ab.setup&&wantAct))&&(!UI.placeOnly||UI.placeOnly.has(c.id)),sl=wantAct?Z.act(1):slotBen;   // placeOnly: hanya Basic dari kartu ekstra
   d.hi={x:sl[0],z:sl[1],s:sl[2],ok:elig};d.act=elig&&(wantAct?actZone:benZone)?1:0;
   txt=!elig?(UI.placeOnly?'Hanya Pokémon Basic dari kartu ekstra yang boleh ditaruh':'Hanya Pokémon Basic yang bisa ditaruh'):d.act?(wantAct?'Lepas di kotak ACTIVE (tertutup)':'Lepas di kotak BENCH (tertutup)'):(wantAct?'Seret ke kotak ACTIVE yang menyala':'Seret ke kotak BENCH yang menyala')}
  else if(c.k==='pokemon'&&c.stage>0||isEn(c)||c.k==='tool'){
   if(ov){const w=c.k==='pokemon'?whyEvolve('p',c,ov.mon):isEn(c)?whyEnergy('p'):whyTool('p',c,ov.mon);d.act=w?0:1;d.hi={x:ov.x,z:ov.z,s:ov.s,ok:!w};txt=w?'⛔ '+w:(c.k==='pokemon'?'Evolusikan':isEn(c)?'Pasang Energi ke':'Pasang Tool ke')+' '+cname(ov.mon.card)}
   else txt=c.k==='pokemon'?`Seret ke ${c.from} untuk evolusi`:'Seret ke Pokémon tujuan'}
  else if(c.k==='pokemon'){const w=whyBasic('p');d.act=!w&&benZone?1:0;d.hi={x:slotBen[0],z:slotBen[1],s:slotBen[2],ok:!w};txt=w?'⛔ '+w:benZone?'Lepas di kotak BENCH':'Seret ke kotak BENCH yang menyala'}
  else{const w=whyTrainer('p',c),inZ=Math.abs(d.x)<2.3&&Math.abs(d.z)<.65;d.dz=1;d.act=!w&&inZ?1:0;d.dzc=w?0xff5a5a:inZ?0x4dff88:0xb6ffcc;txt=w?'⛔ '+w:inZ?'Lepas sekarang untuk memainkan kartu':'Seret ke kotak "Lepas di sini" di tengah arena'}}
 if(txt!==d.txt){d.txt=txt;say(txt,6000)}}
function drop(){
 const d=UI.drag;UI.drag=null;cvs.style.cursor='';
 if(d.coin){const st=UI.stage;
  if(d.tgt&&st.tgt&&st.tgt!==d.tgt){say('⛔ Semua damage counter harus dipindah ke Pokémon lawan yang sama',2600);return}
  if(d.tgt){st.tgt=d.tgt;st.moved++;DCS[d.ci].visible=false;fxCoin(d.tgt);st.apply(st.mon,d.tgt,1);
   if(st.moved>=st.max)finishStage();else{pickShow(`${st.moved} koin dipindah ke ${cname(st.tgt.card)}. Seret koin lain ke Pokémon yang sama, atau tekan Selesai.`,null);$('pk-ok').style.display='';$('pk-ok').onclick=finishStage}}
  else say('Koin kembali ke posisi semula',1500);return}
 if(d.pend){if(d.ov){const a=UI.attach;a.list.splice(a.list.indexOf(d.card),1);a.apply(d.card,d.ov.mon);fxCoin(d.ov.mon);if(!a.list.length){UI.attach=null;pickHide();sync();a.res()}else sync()}else say('Kartu Energi kembali. Seret ke Pokémon Bench yang bercahaya.');return}
 if(d.mon){if(d.over)wantEnd(d.mon);else say('Kartu kembali. Seret tepat ke kotak ACTIVE yang menyala.');return}
 if(d.candy){const k=UI.candy;if(d.ov&&k){UI.candy=null;pickHide();k.res({card:d.card,mon:d.ov.mon})}else say('Kartu kembali. Seret ke Pokémon Basic yang bercahaya.',2600);sync();return}
 const c=d.card;if(!d.act){say(d.txt&&d.txt.startsWith('⛔')?d.txt:'Kartu kembali ke tangan. Lepas di tempat yang menyala.',2600);sync();return}
 if(G.phase==='setup'){const r=setupPlace('p',c,!G.p.active?'active':'bench');if(r)say('⛔ '+r);return}
 if(c.k==='pokemon'&&c.stage>0)run(()=>actEvolve('p',c,d.ov.mon));
 else if(c.k==='pokemon')run(()=>actBasic('p',c));
 else if(isEn(c))run(()=>actEnergy('p',c,d.ov.mon));
 else if(c.k==='tool')run(()=>actTool('p',c,d.ov.mon));
 else run(()=>actTrainer('p',c))}
function finishStage(){const st=UI.stage;if(!st)return;UI.stage=null;DCS.forEach(m=>m.visible=false);pickHide();sync();st.res({src:st.mon,tgt:st.tgt,k:st.moved,applied:true})}
function fxCoin(m){const it=LI.get(m.id);if(it){ring(it.x,it.z,0xfcd34d);burst(it.x,it.z,0xffe27a,24,1.6)}}
function tap(id){
 const it=LI.get(id);if(!it||!G)return;
 if(UI.want){const m=it.mon||it.par;if(!UI.want.drag&&m&&UI.want.mons.includes(m))wantEnd(m);else say(UI.want.drag?'Seret Pokémon yang bercahaya ke kotak ACTIVE':'Tap Pokémon yang bercahaya');return}
 if(UI.attach)return say('Seret kartu Energi ke Pokémon tujuan');
 if(UI.candy&&it.zone!=='hand')return say('Seret kartu Stage 2 dari tanganmu ke Pokémon Basic yang bercahaya');
 if(UI.panel||UI.stage||G.over)return;
 if(G.hidden&&it.sd==='o')return say('Pokémon lawan masih tertutup',1500);
 if(it.zone==='hand')return zoomCard(it.c);
 if(it.mon)return monMenu(it.mon,it.sd);
 if(it.zone==='att'&&it.par)return monMenu(it.par,it.sd,it.c);   // Energi/Tool yang menempel: menu Pokémon-nya, kartu itu terpilih
 if(it.zone==='stad')return zoomCard(it.c);
 if(it.zone==='dis')return openDisc(it.sd);
 if(it.zone==='ohand')return say(`Tangan Bot: ${G.o.hand.length} kartu`,1500);
 if(it.zone==='dk')return say(`Deck ${it.sd==='p'?'kamu':'Bot'}: ${G[it.sd].deck.length} kartu`,1500)}
const PL0=new THREE.Plane(new THREE.Vector3(0,1,0),-.06);
function slotAt(px,pz){const hit=p=>Math.abs(px-p[0])<=p[2]/2+.07&&Math.abs(pz-p[1])<=.7*p[2]+.07;
 for(const m of[1,-1]){const sd=m===1?'p':'o',nm=m===1?'Anda':'Musuh',S=G[sd],nmon=mn=>mn&&!(G.hidden&&sd==='o')?` — ${cname(mn.card)}`:'';
  if(hit(Z.act(m)))return{t:`Active ${nm}${nmon(S.active)}\nTempat Pokémon yang bertarung`,p:Z.act(m),mon:S.active};
  for(let i=0;i<BENCHN;i++)if(hit(Z.ben(i,m)))return{t:`Bench ${nm} (slot ${i+1} dari ${BENCHN})${nmon(S.bench[i])}\nTempat Pokémon cadangan`,p:Z.ben(i,m),mon:S.bench[i]};
  if(hit(Z.dk(m)))return{t:`Deck ${nm} (${S.deck.length} kartu)`,p:Z.dk(m)};
  if(hit(Z.dis(m)))return{t:`Discard/Trash ${nm} (${S.discard.length} kartu)${S.discard.length?'\nKlik untuk melihat isinya':''}`,p:Z.dis(m)};
  for(let i=0;i<6;i++)if(hit(Z.pri(i,m)))return{t:`Prize ${nm} (${S.prizes.length} kartu tersisa)\nKartu hadiah tertutup; diambil saat lawan KO`,p:Z.pri(i,m)}}
 if(hit(LAY.stad))return{t:G.stadium?`Stadium aktif: ${cname(G.stadium.card)}\nBerlaku untuk kedua pemain`:'Stadium (kosong)\nStadium yang aktif berlaku untuk kedua pemain',p:LAY.stad};return null}
const pileTip=it=>{const w=it.sd==='p'?'Anda':'Musuh',S=G[it.sd];return it.zone==='dis'?`Discard/Trash ${w} (${S.discard.length} kartu) — klik untuk melihat isi`:it.zone==='dk'?`Deck ${w} (${S.deck.length} kartu)`:it.zone==='pz'?`Prize ${w} (${S.prizes.length} kartu)`:it.zone==='ohand'?`Tangan musuh (${S.hand.length} kartu)`:''};
cvs.addEventListener('pointerdown',e=>{
 UI.dn={i:hitId(e),x:e.clientX,y:e.clientY,lx:e.clientX};try{cvs.setPointerCapture(e.pointerId)}catch(_){}
 {const ci=hitCoin(e);if(ci>=0){UI.drag={coin:1,ci,x:0,z:0,hi:null,txt:'',tgt:null};cvs.style.cursor='grabbing';UI.dn.coin=1;return}}

 const dn=UI.dn;if(!UI.drag)hideHv();
 {const it0=dn.i!==null&&LI.get(dn.i);if(it0&&it0.zone==='hand'&&e.pointerType==='touch'&&G&&!UI.panel&&!G.hidden){hov=dn.i;showHv(it0.c);dn.lpOn=1;dn.br=1;return}}
 if(dn.i!==null)dn.lp=setTimeout(()=>{if(UI.dn===dn&&!UI.drag&&G){const it=LI.get(dn.i);if(canPrev(it)){showHv(it.c);dn.lpOn=1}}},420)});
cvs.addEventListener('pointermove',e=>{
 if(UI.drag)return moveDrag(e);
 const dn=UI.dn;
 if(dn){const mv=Math.hypot(e.clientX-dn.x,e.clientY-dn.y);
  if(dn.br){   // jari di kartu tangan (HP): menyamping = lihat kartu lain ala Pocket, naik = seret kartu yang sedang dilihat
   const up=dn.y-e.clientY;if(mv<=9)return;if(dn.br===1&&up<Math.abs(e.clientX-dn.x))dn.br=2;
   if(dn.br===1||up>28){dn.br=0;dn.lpOn=0;dn.pan=1;hideHv();const it=LI.get(hov);if(it){startDrag(it);if(UI.drag)return moveDrag(e)}hov=null;return}
   const i=hitId(e),it=i!==null&&LI.get(i);if(it&&it.zone==='hand'&&i!==hov){hov=i;showHv(it.c)}dn.pan=1;return}
  if(mv>9){clearTimeout(dn.lp);if(dn.lpOn){hideHv();dn.lpOn=0}}
  if(mv>9&&dn.i!==null&&!dn.pan){const it=LI.get(dn.i);if(it&&G){startDrag(it);if(UI.drag)return moveDrag(e)}dn.pan=1}
  if(mv>9)dn.pan=1;return}
 if(e.pointerType==='mouse'&&G&&G.p){const i=hitId(e),it=i!==null&&LI.get(i);hov=it&&it.zone==='hand'?i:null;
  let overHand=false;
  if(LAYMODE&&!UI.drag&&!UI.stage&&!UI.attach&&!UI.panel){const bz=Z.ben(2,1),by=px2(0,.06,bz[1]+.7*bz[2])[1],sh=(1-LAY.hvis)*1.4*LAY.hs+.3,topY=px2(0,.95,(LAY.handZ||5)-sh-.7*LAY.hs)[1];
   if(!UI.handUp&&e.clientY>by+2)UI.handUp=true;else if(UI.handUp&&e.clientY<topY-6)UI.handUp=false;overHand=UI.handUp&&e.clientY>topY}else UI.handUp=false;
  if(canPrev(it)&&!UI.panel&&!$('zoom').classList.contains('on'))showHv(it.c);else hideHv();
  const tip=$('tip');let tt='',rg=null;
  if(it&&it.zone==='ohand'){tt=`Tangan musuh (${G.o.hand.length} kartu)`}
  else if(!(it&&it.zone==='hand')&&!overHand){aim(e);const gp=ray.ray.intersectPlane(PL0,PT),sl=gp&&slotAt(gp.x,gp.z);if(sl){tt=sl.t;rg={x:sl.p[0],z:sl.p[1],s:sl.p[2],ok:3};if(sl.mon&&UI.abl&&UI.abl.includes(sl.mon.id))tt+=`\n✨ Ability siap dipakai: ${sl.mon.card.ab.n}`}}
  if(tt){tip.innerHTML=iconize(tt);tip.style.display='block';tip.style.left=Math.min(e.clientX+14,innerWidth-270)+'px';tip.style.top=e.clientY+16+'px';UI.hp=rg}else{tip.style.display='none';UI.hp=null}}});
const endDn=()=>{const dn=UI.dn;if(dn){clearTimeout(dn.lp);if(dn.lpOn){hideHv();if(hov===dn.i||dn.br)hov=null}}};
cvs.addEventListener('pointerup',e=>{
 if(UI.drag){endDn();UI.dn=null;return drop()}
 const dn=UI.dn;endDn();UI.dn=null;if(!dn||dn.pan||dn.lpOn)return;if(Math.hypot(e.clientX-dn.x,e.clientY-dn.y)<=9){if(dn.i!==null)tap(dn.i);else if(G&&G.p&&!UI.want&&!UI.panel&&!UI.stage){aim(e);const gp=ray.ray.intersectPlane(PL0,PT),sl=gp&&slotAt(gp.x,gp.z);if(sl)say(sl.t.replace(/\n/g,' — '),2600)}}});
cvs.addEventListener('pointercancel',()=>{endDn();UI.dn=null;if(UI.drag){UI.drag=null;cvs.style.cursor='';sync()}});
cvs.addEventListener('pointerleave',()=>{UI.handUp=false;$('tip').style.display='none';UI.hp=null;if(!UI.dn)hideHv()});
/* --- cincin sorot --- */
function glows(){const L=[];if(!G||!G.p)return L;
 if(UI.drag&&UI.drag.hi)L.push(UI.drag.hi);
 if(UI.want)for(const m of UI.want.mons){const it=LI.get(m.id);if(it)L.push({x:it.x,z:it.z,s:it.s,ok:1})}
 if(UI.stage&&!UI.drag)for(const m of (UI.stage.tgt?[UI.stage.tgt]:UI.stage.tgts)){const it=LI.get(m.id);if(it)L.push({x:it.x,z:it.z,s:it.s,ok:1})}
 if(UI.candy&&!UI.drag)for(const m of UI.candy.mons){const it=LI.get(m.id);if(it)L.push({x:it.x,z:it.z,s:it.s,ok:1})}   // Permen Langka: Basic sasaran
 if(!UI.drag)for(const id of UI.abl||[]){const it=LI.get(id);if(it)L.push({x:it.x,z:it.z,s:it.s,ok:1})}   // Ability siap: cahaya tepi kuning ala Pocket (tak saat drag, agar tak tertukar dgn sasaran)
 if(UI.hp)L.push(UI.hp);
 return L}
/* lift & skala tambahan kartu yang berevolusi menurut waktu t (dtk): diam saat kartu baru menumpuk, naik (ease-out-back), melayang, turun (ease-in-out) */
function evoCurve(t){const ob=x=>1+2.2*(x-1)**3+1.2*(x-1)**2,io=x=>x<.5?2*x*x:1-(-2*x+2)**2/2;
 if(t<.3)return[0,0];if(t<.75){const e=ob((t-.3)/.45);return[1.3*e,.45*e]}if(t<1.05)return[1.3+.05*Math.sin((t-.75)*12),.45];if(t<1.35){const e=1-io((t-1.05)/.3);return[1.3*e,.45*e]}return[0,0]}
/* --- loop render --- */
function loop(t){
 requestAnimationFrame(loop);const s=t/1000,now=performance.now();camUpd();
 for(const[id,g]of M){const d=g.userData,T=d.t;if(!T)continue;
  if(d.die){
   if(d.fly&&d.dest){const[dx,dz,ds,up]=d.dest;if(flyStep(g,d.fly,now,dx,.08,dz,ds*.95,up)){scene.remove(g);M.delete(id)}}
   else if(d.dest){const[dx,dz,ds]=d.dest;g.position.x+=(dx-g.position.x)*.13;g.position.z+=(dz-g.position.z)*.13;g.position.y+=(.5-g.position.y)*.13;g.scale.x+=(ds*.95-g.scale.x)*.13;g.scale.y=g.scale.z=g.scale.x;g.rotation.x+=(Math.PI/2-g.rotation.x)*.1;
    if((Math.hypot(g.position.x-dx,g.position.z-dz)<.18&&g.rotation.x>1.2)||now-d.dieT>1600){scene.remove(g);M.delete(id)}}
   else{g.scale.multiplyScalar(.86);g.position.y+=.03;if(g.scale.x<.04){scene.remove(g);M.delete(id)}}
   continue}
  if(d.fly){if(now>=d.fly.t0&&flyStep(g,d.fly,now,T.x,T.y,T.z,T.s,1))d.fly=null;continue}   // sedang terbang melengkung ke discard
  const dr=UI.drag&&UI.drag.id===id,hv=hov===id&&T.zone==='hand',ev=d.evo&&evoCurve((now-d.evo.t0)/1000),k=dr?.4:d.dash?.32:T.dl?.22:.17,ky=ev?1:k,lf=ev?ev[0]:d.lift||0;   // ev: timeline evolusi (tanpa lerp = tanpa jeda)
  let tx=T.x+d.off.x,tz=T.z+d.off.z-(hv?(T.s*.55):0)-((UI.handUp&&!UI.drag&&T.zone==='hand')?((1-LAY.hvis)*1.4*LAY.hs+.3):0),ty=T.y+(hv?.9:0)+lf*1.1,ts=T.s*(1+d.pop*.25+lf*.12+(ev?ev[1]:d.big||0)),rx=T.up?-Math.PI/2+(T.tilt||0)+(hv?.1:0):Math.PI/2;
  if(T.zone==='dk'&&shufT[T.sd]>t){const i=+id.slice(3);tx+=Math.sin(t/60+i*2)*.5;tz+=Math.cos(t/55+i)*.18;ty+=.12*Math.abs(Math.sin(t/90+i))}
  if(UI.candy&&T.zone==='hand'&&!dr&&UI.candy.cards.includes(T.c)){ty+=.35;tz-=.3;ts*=1.04+Math.sin(s*6)*.025}   // Permen Langka: kartu Stage 2 yang bisa dipakai terangkat & berdenyut
  if(T.dl&&!dr&&now<T.dl.t1){const P=Z.dk(T.sd==='p'?1:-1);tx=P[0];tz=P[1];ty=.14;ts=P[2];rx=Math.PI/2}   // bagi kartu awal: tunggu di deck
  if(d.grow){if(now<d.grow)ts=.001;else d.grow=0}   // Energi/Tool baru: tumbuh di bawah Pokémon setelah hantunya masuk (tuck)
  if(dr){tx=UI.drag.x;tz=UI.drag.z;ty=1.6;ts=1.2;rx=-Math.PI/2+.3}
  else if(UI.drag&&UI.drag.hi&&T.mon&&Math.abs(T.x-UI.drag.hi.x)<.01&&Math.abs(T.z-UI.drag.hi.z)<.01)ts*=1.07+Math.sin(s*8)*.015;
  g.position.x+=(tx+(d.sh>.02?(Math.random()-.5)*.25*d.sh:0)-g.position.x)*k;g.position.z+=(tz-g.position.z)*k;g.position.y+=(ty-g.position.y)*ky;
  g.scale.x+=(ts-g.scale.x)*ky;g.scale.y=g.scale.z=g.scale.x;g.rotation.x+=(rx-g.rotation.x)*(dr?.3:.14);d.rzb=(d.rzb??g.rotation.z)+((T.rz||0)-(d.rzb??g.rotation.z))*.12;d.st=(d.st||0)+((d.stz||0)-(d.st||0))*.12;g.rotation.z=d.rzb+d.st;
  d.sh*=.9;d.fl*=.92;d.pop*=.9;const c=d.fl>.02?1-d.fl*.7:1;if(d.fl>.02||d.glow){d.f.material.color.setRGB(1,d.glow?1:c,d.glow?Math.min(1,c+.2):c);if(d.fl<=.02)d.glow=0}else if(d.ko)d.f.material.color.setRGB(.6,.52,.56);else d.f.material.color.setRGB(1,1,1);   // KO: meredup
  const o=OV.get(id);if(o){o.g.position.set(g.position.x,g.position.y+.045*g.scale.x,g.position.z);o.g.scale.setScalar(g.scale.x);o.g.rotation.x=g.rotation.x;o.g.rotation.z=d.st||0}   // ikut miring & skala kartu (stage ×1.5), kalau tidak panel HP tertutup kartu
  if(T.zone==='hand'){const q=PX.get(id);if(q){q.position.z=T.z-((UI.handUp&&!UI.drag)?((1-LAY.hvis)*1.4*LAY.hs+.3):0);q.updateMatrixWorld()}}}
 updHp();cfUpdate(s);
 for(const k in AURA_M)AURA_M[k].opacity=.55+Math.sin(s*3)*.2;glowUpd(s);
 ZH.visible=false;
 const dzv=!!(UI.drag&&UI.drag.dz);DZ.visible=dzv;if(dzv){DZ.material.color.setHex(UI.drag.dzc||0x4dff88);DZ.material.opacity=.75+Math.sin(s*7)*.25}
 if(UI.stage){DCS.forEach((m,i)=>{if(!m.visible)return;const dc=UI.drag&&UI.drag.coin&&UI.drag.ci===i;if(dc)m.position.set(UI.drag.x,1.8,UI.drag.z);else m.position.set(-(LAY.W/2-.9)+i*.75,1.6+Math.sin(s*3+i)*.07,(LAY.handZ||5)-1.4)})}
 const gl=glows();RG.forEach((m,i)=>{const g=gl[i];if(!g){m.visible=false;return}m.visible=true;m.position.set(g.x,.2,g.z);m.scale.setScalar(g.s*1.14);m.material.color.setHex(g.ok===3?0x9bdcff:g.ok?0xfcd34d:0xfb7185);m.material.opacity=.7+Math.sin(s*9)*.3});
 if(CS){const i=Math.min(CS.F.length-1,((now-CS.t0)*.12)|0);coinPose(CS.F[i]);if(i>=CS.F.length-1&&!CS.done){CS.done=1;CS.res()}}   // simulasi 120 langkah/dtk
 if(DS){const i=Math.min(DS.F.length-1,((now-DS.t0)*.12)|0);diePose(DS.F[i]);if(i>=DS.F.length-1&&!DS.done){DS.done=1;DS.res()}}
 for(let i=FXL.length-1;i>=0;i--){const f=FXL[i],p=(now-f.t0)/f.dur;if(p>=1){scene.remove(f.o);FXL.splice(i,1)}else f.upd(p)}
 const pp=spk.geometry.attributes.position;for(let i=0;i<90;i++){SP[i*3+1]+=.004;if(SP[i*3+1]>5)SP[i*3+1]=0}pp.needsUpdate=true;
 ren.render(scene,cam)}
requestAnimationFrame(loop);
/* --- mulai / akhir pertandingan --- */
function resetScene(){for(const g of M.values())scene.remove(g);for(const g of PX.values())scene.remove(g);for(const o of OV.values())scene.remove(o.g);for(const id of [...CF.keys()])cfDrop(id);M.clear();PX.clear();OV.clear();LI=new Map();DCS.forEach(m=>m.visible=false);DZ.visible=false;$('tl').className='';COIN.g.visible=COIN.sh.visible=DIE.m.visible=DIE.sh.visible=false;CS=DS=null}
async function startBattle(list,fmt,opt){
 UI.last={list,fmt};closeAll();resetScene();UI.placing=null;UI.si=UI.si||0;
 ['menu','pre','db'].forEach(i=>$(i).classList.remove('on'));$('end').classList.remove('on');
 document.body.classList.add('bt');$('log-b').innerHTML='';
 UI.themeI=(UI.themeI+1+rnd(2))%THEMES.length;const tn=setTheme(UI.themeI);
 DEC.p=UIDEC;DEC.o={...BOT,turn:s=>botTurn(s)};
 const bd=buildDeck(fmt);say(`Arena: ${tn} • Deck Bot: ${bd.name}`,3400);   // Bot menyusun deck kustomnya sendiri
 try{await setup(list,bd.L,opt)}catch(e){console.error(e);say('Terjadi galat: '+e.message,8000)}}
function toMenu(){closeAll();document.body.classList.remove('bt');resetScene();G=null;$('menu').classList.add('on')}
