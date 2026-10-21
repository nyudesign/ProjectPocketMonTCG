/* ===== INTERAKSI & ALUR UI ===== */
let BACKURL='';const backUrl=()=>BACKURL||(BACKURL=(BACKT.image&&BACKT.image.toDataURL?BACKT.image.toDataURL():''));
const px2=(wx,wy,wz)=>{const v=new THREE.Vector3(wx,wy,wz).project(cam);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]};
async function cardFlyIn(c,sd){
 const box=$('cfx'),cf=document.createElement('div');cf.className='cf';cf.innerHTML=`<div class="face fr"><img src="${imgOf(c)}" alt="${cname(c)}"></div><div class="face bk"><img src="${backUrl()}" alt=""></div>`;box.append(cf);box.style.display='block';
 const[sx,sy]=px2(0,.4,sd==='o'?(LAY.ohandZ||-5):(LAY.handZ||5)),[tx,ty]=px2(1.55,1.8,Z.act(sd==='p'?1:-1)[1]),cx=innerWidth/2,cy=innerHeight/2,dx=sx-cx,dy=sy-cy,f=UI.si===0?1:UI.si===1?.7:.4;
 const A=(kf,o)=>cf.animate(kf,{fill:'forwards',...o}).finished;
 await A([{transform:`translate(${dx}px,${dy}px) scale(.14) rotateY(180deg)`},{transform:`translate(${dx*.35}px,${dy*.25-40}px) scale(.55) rotateY(180deg) rotateZ(-8deg)`,offset:.55},{transform:'translate(0,0) scale(1) rotateY(180deg)'}],{duration:850,easing:'cubic-bezier(.2,.8,.2,1)'});
 await A([{transform:'translate(0,0) scale(1) rotateY(180deg)'},{transform:'translate(0,-14px) scale(1.06) rotateY(180deg) rotateZ(2deg)'},{transform:'translate(0,0) scale(1) rotateY(180deg)'}],{duration:300});
 await A([{transform:'scale(1) rotateY(180deg)'},{transform:'scale(1.1) rotateY(90deg)',offset:.5},{transform:'scale(1) rotateY(0deg)'}],{duration:650,easing:'ease-in-out'});
 await sleep(Math.round(2600*f));
 await A([{transform:'translate(0,0) scale(1) rotateY(0deg)'},{transform:`translate(${tx-cx}px,${ty-cy}px) scale(.2) rotateY(0deg)`}],{duration:700,easing:'ease-in'});
 cf.remove();box.style.display='none'}
const TYC={D:0xb06cff,P:0xff7ad9,R:0xff8a30,C:0xfff3c4,G:0x6ee26e,F:0xd08a4a,W:0x5ac8ff},UI0=0;
const UI={limbo:null,want:null,panel:null,drag:null,dn:null,last:null,stage:null,si:0,themeI:Math.random()*3|0,hp:null};
const say=(t,ms=2600,kind)=>{const m=$('msg');let ic='💡';kind=kind||'info';if(t.startsWith('⛔')){kind='warn';ic='⛔';t=t.replace(/^⛔\s*/,'')}else if(kind==='bot')ic='🤖';else if(kind==='good')ic='✨';
 m.className=kind;m.innerHTML='<i></i><span></span>';m.firstChild.textContent=ic;m.lastChild.textContent=t;void m.offsetWidth;m.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>m.classList.remove('on'),ms)};
const canAct=()=>G&&G.phase==='play'&&G.cur==='p'&&!G.busy&&!G.over&&!UI.want&&!UI.panel&&!UI.stage&&!UI.attach;
const run=async fn=>{const r=await act(fn);if(typeof r==='string')say('⛔ '+r)};
const imgOf=c=>IMG[c.img];
/* --- HUD --- */
function hud(){
 if(!G||!G.p)return;const o=G.o,p=G.p,n=G.prizeN;
 $('oi').innerHTML=`Deck ${o.deck.length} • Tangan ${o.hand.length}<span class="xx"> • Discard ${o.discard.length} • Prize ${o.prizes.length}</span>`;
 $('pi').innerHTML=`Deck ${p.deck.length} • Tangan ${p.hand.length}<span class="xx"> • Discard ${p.discard.length} • Prize ${p.prizes.length}</span>`;
 const pips=(id,rem)=>$(id).innerHTML=Array.from({length:n},(_,i)=>`<i class="${i<rem?'on':''}"></i>`).join('');
 pips('op',o.prizes.length);pips('pp',p.prizes.length);
 const setup=G.phase==='setup';$('b-end').textContent=setup?'Siap ▶':'Akhiri';$('b-end').disabled=setup?(!p.active||!!UI.panel||!UI.placing):!canAct();$('b-atk').disabled=setup||!canAct()||!p.active;
 UI.abl=canAct()?ownMons().filter(it=>it.mon.card.ab&&!it.mon.card.ab.passive&&!it.mon.card.ab.setup&&!abWhy('p',it.mon)).map(it=>it.id):[]}
$('b-end').onclick=()=>{if(G.phase==='setup'){if(UI.placing&&G.p.active){const r=UI.placing;UI.placing=null;r()}}else if(canAct())confirmEnd()};
$('b-atk').onclick=()=>{if(canAct()&&G.p.active)zoomMon(G.p.active,'p')};
$('b-log').onclick=()=>$('log').classList.toggle('on');$('log-x').onclick=()=>$('log').classList.remove('on');
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
async function confirmEnd(){const pend=pendingActions('p');if(!pend.length||lsGet('ptcg.confirmEnd','1')!=='1')return finishTurn();
 const b=$('dlg-b');b.innerHTML=`<h2>Akhiri giliran?</h2><p>Yang belum kamu lakukan:</p><ul class="todo">${pend.map(t=>`<li><span>☐</span>${t}</li>`).join('')}</ul><label class="skip"><input type="checkbox" id="ce-skip"> Jangan tanya lagi (bisa diaktifkan lagi di Menu)</label>`;
 const v=await new Promise(res=>{[['Kembali bermain','n','go'],['Akhiri giliran','y','atk']].forEach(([l,val,cls])=>{const e=document.createElement('button');e.className='b '+cls;e.textContent=l;e.onclick=()=>{$('dlg').classList.remove('on');res(val)};b.append(e)});$('dlg').classList.add('on')});
 if($('ce-skip').checked)lsSet('ptcg.confirmEnd','0');if(v==='y'&&canAct())finishTurn()}
const SPD=[['Pelan',1900],['Normal',1100],['Cepat',450]];FX.pause=()=>sleep(SPD[UI.si][1]);
$('b-menu').onclick=async()=>{if(!G)return;const v=await dlg('<h2>☰ Menu</h2>',[['📜 Battle Log','log','go'],[`⏱ Kecepatan Bot: ${SPD[UI.si][0]} (ketuk untuk ganti)`,'spd','ghost'],[`Konfirmasi akhiri giliran: ${lsGet('ptcg.confirmEnd','1')==='1'?'Aktif':'Mati'}`,'ce','ghost'],['📖 Aturan main','rules','ghost'],['🏳️ Menyerah','conc','atk'],['Tutup',0,'ghost']]);
 if(v==='log')$('log').classList.add('on');else if(v==='spd'){UI.si=(UI.si+1)%3;say('Kecepatan Bot: '+SPD[UI.si][0],1600)}else if(v==='ce'){const on=lsGet('ptcg.confirmEnd','1')==='1';lsSet('ptcg.confirmEnd',on?'0':'1');say('Konfirmasi akhiri giliran: '+(on?'Mati':'Aktif'),1800)}else if(v==='rules')showRules();else if(v==='conc')askConcede()};
async function askConcede(){const v=await dlg('<h2>🏳️ Menyerah?</h2><p>Kalau kamu menyerah, pertandingan ini dihitung <b>kalah</b>. Apakah kamu yakin?</p>',[['Ya, saya menyerah','y','atk'],['Lanjut bermain','n','go']]);if(v==='y'&&G&&!G.over){closeAll();concede('p')}}
function closeAll(){UI.attach=null;UI.reveal=null;$('cfx').style.display='none';UI.want=null;UI.stage=null;UI.limbo=null;UI.drag=null;DCS.forEach(m=>m.visible=false);pickHide();['panel','zoom','disc','dlg'].forEach(i=>$(i).classList.remove('on'));UI.panel=null;$('pback').style.display='none';$('ann').classList.remove('on');$('ann2').classList.remove('on');$('turn').className=''}
/* --- Log --- */
FX.log=t=>{const d=document.createElement('div');if(t.startsWith('—'))d.className='t';d.textContent=t;const b=$('log-b');b.append(d);b.scrollTop=1e9;if(!t.startsWith('—')&&!t.startsWith('Kamu'))say(t,2400,'bot')};
FX.sync=()=>sync();
/* --- Zoom --- */
const spChip=m=>[m.sp==='asleep'?'💤 Asleep':'',m.sp==='confused'?'😵 Confused':'',m.sp==='paralyzed'?'⚡ Paralyzed':'',m.poison?'☠️ Poisoned':'',m.burn?'🔥 Burned':''].filter(Boolean);
function cardText(c){if(c.k!=='pokemon')return`<div>${c.tx||''}</div>`;
 const t=TYPES[c.type]||['',''];
 return`<div><span class="chip">${c.stage===0?'Basic':'Stage '+c.stage+(c.from?' dari '+c.from:'')}</span><span class="chip">${t[0]}</span><span class="chip">HP ${c.hp}</span>${c.mega?'<span class="chip">Mega ex • 3 Prize</span>':c.prize>1?'<span class="chip">ex • 2 Prize</span>':''}</div>`+
 (c.ab?`<div><b>Ability: ${c.ab.n}</b><br>${c.ab.tx}</div>`:'')+c.atk.map(a=>`<div><b>${a.n}</b> [${a.cost}] ${a.dmg?a.dmg+(a.plus?'+':a.times?'×':''):''}<br>${a.tx}</div>`).join('')+
 `<div>Lemah: ${c.weak?TYPES[c.weak][0]+' ×2':'-'} • Tahan: ${c.res?TYPES[c.res][0]+' −30':'-'} • Mundur: ${c.retreat}</div>`}
function zoomCard(c,mon,sd){
 const stage=k=>k.stage===2?'Stage 2':k.stage===1?'Stage 1':'Basic',stack=[];
 if(mon){stack.push([mon.card,stage(mon.card)]);[...mon.under].reverse().forEach(u=>stack.push([u,stage(u)]));mon.en.forEach(e=>stack.push([e,'Energi']));if(mon.tool)stack.push([mon.tool,'Tool'])}else stack.push([c,'']);
 const zs=$('zstack');zs.innerHTML='';zs.style.display=stack.length>1?'flex':'none';
 const show=(cd,i)=>{$('zimg').src=imgOf(cd);$('zct').innerHTML=`<div><b>${cname(cd)}</b>${stack.length>1?` <span class="chip">${stack[i][1]}</span>`:''}</div>`+cardText(cd);[...zs.children].forEach((q,j)=>q.classList.toggle('on',j===i))};
 let h='';
 if(mon){h+=`<div><b>${cname(c)}</b> • HP <b>${hp(mon)}</b> / ${c.hp}${mon.dmg?` • ${mon.dmg/10} damage counter`:''}</div>`;
  const sc=spChip(mon);if(sc.length)h+=`<div>${sc.map(q=>`<span class="chip">${q}</span>`).join('')}</div>`;
  h+=`<div>Tumpukan: ${stack.map(s=>s[1]).join(' › ')} <i>(ketuk kartu di bawah gambar untuk melihat tiap kartu)</i></div>`}
 h+='<div id="zct"></div>';$('zinfo').innerHTML=h;const bz=$('zbtn');bz.innerHTML='';
 stack.forEach(([cd,lb],i)=>{const t=document.createElement('button');t.className='zt';t.innerHTML=`<img src="${imgOf(cd)}" alt=""><span>${lb}</span>`;t.onclick=()=>show(cd,i);zs.append(t)});show(stack[0][0],0);
 const btn=(l,cls,dis,f)=>{const b=document.createElement('button');b.className='b '+cls;b.innerHTML=l+(dis?`<small>${dis}</small>`:'');b.disabled=!!dis;b.onclick=()=>{closeZoom();f()};bz.append(b)};
 if(mon&&sd==='p'&&G.phase==='setup'&&UI.placing)btn('↩ Kembalikan ke tangan','ghost','',()=>setupRemove('p',mon));
 else if(mon&&sd==='p'&&canAct()){
  const isAct=G.p.active===mon;
  if(isAct)c.atk.forEach((a,k)=>btn(`⚔️ ${a.n} — ${a.dmg?a.dmg+(a.plus?'+':a.times?'×':''):'efek'}`,'atk',whyAttack('p',k),()=>run(()=>actAttack('p',k))));
  if(c.ab&&!c.ab.passive&&!c.ab.setup)btn(`✨ Ability: ${c.ab.n}`,'go',abWhy('p',mon),()=>run(()=>actAbility('p',mon)));
  if(isAct)btn(`🔄 Mundur (biaya ${rcost(mon)} Energi)`,'ghost',whyRetreat('p'),()=>run(()=>actRetreat('p')))}
 $('zoom').classList.add('on')}
const zoomMon=(m,sd)=>zoomCard(m.card,m,sd),closeZoom=()=>$('zoom').classList.remove('on');
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
function dlg(html,btns){return new Promise(res=>{const b=$('dlg-b');b.innerHTML=html;btns.forEach(([l,v,cls])=>{const e=document.createElement('button');e.className='b '+(cls||'go');e.textContent=l;e.onclick=()=>{$('dlg').classList.remove('on');res(v)};b.append(e)});$('dlg').classList.add('on')})}
/* --- Panel efek Trainer & pilihan kartu --- */
function panelOpen(card,title){UI.panel=1;$('pimg').src=card?imgOf(card):'';$('pimg').style.display=card?'':'none';$('ptitle').textContent=title;$('pcar').innerHTML='';
 ['p-done','p-cancel'].forEach(i=>$(i).style.display='none');$('panel').classList.remove('look');$('pback').style.display='none';$('panel').classList.add('on');hud()}
function panelClose(){UI.panel=null;$('panel').classList.remove('on','look');$('pback').style.display='none';hud()}
$('p-look').onclick=()=>{$('panel').classList.add('look');$('pback').style.display='block'};$('pback').onclick=()=>{$('panel').classList.remove('look');$('pback').style.display='none'};
function panelPick(o){return new Promise(res=>{
 const{cards,min=0,max,card,title,cost}=o,can=o.pick||(()=>true),nPick=cards.filter(can).length,sel=new Set();panelOpen(card,title+(max>1?` (maks ${max})`:''));
 const car=$('pcar');if(!cards.length)car.innerHTML='<div class="empty">Tidak ada kartu yang cocok.</div>';
 const done=$('p-done'),cancel=$('p-cancel');done.style.display='';const upd=()=>{const ok=sel.size>=min&&sel.size<=max;done.disabled=!ok;done.textContent=cost?`Buang ${sel.size}/${min}`:(sel.size?`Ambil ${sel.size} kartu`:(min?'Pilih kartu':'Selesai (tanpa memilih)'))};
 cards.forEach(c=>{const d=document.createElement('div');d.className='cc';d.innerHTML=`<img src="${imgOf(c)}" alt="${cname(c)}">`;if(!can(c)){d.style.opacity=.4;d.title='Tidak bisa dipilih';d.setAttribute('aria-disabled','true');car.append(d);return}d.onclick=()=>{if(sel.has(c)){sel.delete(c);d.classList.remove('sel')}else if(sel.size<max){sel.add(c);d.classList.add('sel')}else if(max===1){car.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));sel.clear();sel.add(c);d.classList.add('sel')}upd()};car.append(d)});
 if(cost){cancel.style.display='';cancel.onclick=()=>{panelClose();res(null)}}
 done.onclick=async()=>{
  if(!cost&&sel.size<max&&nPick>sel.size){const v=await dlg(`<h2>Ambil lebih sedikit?</h2><p>Kamu baru memilih <b>${sel.size}</b> kartu, padahal kartu ini membolehkan sampai <b>${max}</b> dan masih ada kartu yang cocok. Yakin lanjut dengan ${sel.size} kartu?</p>`,[['Ya, lanjut','y','atk'],['Kembali memilih','n','go']]);if(v!=='y')return}
  panelClose();res([...sel])};upd()})}
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
 confirm:o=>dlg(`<h2>${o.title}</h2><p>${o.tx}</p>`,[['Pakai',true,'go'],['Lewati',false,'ghost']]),
 num:async o=>dlg(`<h2>${o.title}</h2>`,Array.from({length:o.max-o.min+1},(_,i)=>[String(o.min+i),o.min+i])),
 moveDmg:async o=>{
  const src=await wantStart({title:'Pilih Pokémonmu yang damage counter-nya mau dipindah',mons:o.srcs,sd:'p',ctx:'target',cancel:true},false);
  if(!src)return null;
  return new Promise(res=>{const mx=Math.min(o.max,src.dmg/10);UI.stage={mon:src,max:mx,tgts:o.tgts,res,moved:0,tgt:null,apply:o.apply};DCS.forEach((m,i)=>m.visible=i<mx);
   pickShow(`Kartu dan damage counter-nya naik ke area tangan. Ada ${mx} koin (1 koin = 10 damage). Seret koin ke Pokémon lawan, boleh sampai ${mx} koin ke Pokémon yang sama.`,()=>{UI.stage=null;DCS.forEach(m=>m.visible=false);sync();res(null)});sync()})},
 attachEnergies:o=>new Promise(res=>{UI.attach={list:[...o.energies],tgts:o.targets,apply:o.apply,res};pickShow(`Pasang Energi Dasar ke Pokémon Bench, sesuai teks ${cname(o.card)}. Seret tiap kartu Energi ke Pokémon tujuan. Tiap Energi bebas ke Pokémon mana pun.`,null);sync()}),
 mullDraw:async o=>{const opts=[['Tidak ambil',0,'ghost'],...Array.from({length:o.max},(_,i)=>[`Ambil ${i+1}`,i+1])];
  return dlg(`<h2>Kartu ekstra</h2><p>Bot mulligan ${o.theirs} kali${o.mine?`, kamu ${o.mine} kali`:''}. Kamu boleh ambil sampai ${o.max} kartu ekstra. Mau ambil berapa?</p>`,opts)},
 prizes:o=>new Promise(res=>{const n=o.prizes.length,k=o.n,back=BACKT.image.toDataURL?BACKT.image.toDataURL():'',b=$('dlg-b'),sel=[];
  b.innerHTML=`<h2>🎁 Ambil kartu Prize</h2><p>Kamu mengambil <b>${k}</b> kartu Prize. Pilih <b>${k}</b> dari ${n} kartu tertutup sekaligus (cincin kuning = pilihanmu), lalu tekan <b>Ambil Kartu</b>.</p><div class="pzg" style="grid-template-columns:repeat(${n>3?3:n},1fr)"></div>`;
  const grid=b.querySelector('.pzg'),ok=document.createElement('button'),upd=()=>{ok.disabled=sel.length!==k;ok.textContent=`Ambil Kartu (${sel.length}/${k})`};ok.className='b atk';
  o.prizes.forEach((c,i)=>{const e=document.createElement('button');e.className='pz';e.innerHTML=`<img src="${back}" alt=""><span>Prize ${i+1}</span>`;e.onclick=()=>{const j=sel.indexOf(c);if(j>=0){sel.splice(j,1);e.classList.remove('sel')}else if(sel.length<k){sel.push(c);e.classList.add('sel')}else if(k===1){grid.querySelectorAll('.pz').forEach(q=>q.classList.remove('sel'));sel.length=0;sel.push(c);e.classList.add('sel')}upd()};grid.append(e)});
  ok.onclick=()=>{$('dlg').classList.remove('on');res([...sel])};b.append(ok);upd();$('dlg').classList.add('on')}),
 place:async()=>{UI.placing=null;say('Seret Pokémon Basic ke kotak ACTIVE, lalu BENCH (opsional). Kartu tetap tertutup sampai semua siap.',9000);await new Promise(r=>{UI.placing=r;hud()});say('Menunggu lawan...',1200)},
 turn:async()=>{}};
DEC.p=UIDEC;DEC.o={...BOT,turn:s=>botTurn(s)};
/* --- Efek visual / FX dari mesin --- */
Object.assign(FX,{
 shuffle:async sd=>{shufT[sd]=performance.now()+800;await sleep(820)},
 hit:(id,d,type)=>{const g=M.get(id);if(!g)return;g.userData.sh=1.2;g.userData.fl=1;const p=g.position,col=TYC[type];
  if(col){ring(p.x,p.z,col);burst(p.x,p.z,col,60,2.6);const f=$('flash');f.style.setProperty('--fc','#'+col.toString(16).padStart(6,'0'));f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
  const v=p.clone().project(cam),e=document.createElement('div');e.className='pop big';e.textContent='-'+d;e.style.left=(v.x+1)/2*innerWidth+'px';e.style.top=(1-v.y)/2*innerHeight-30+'px';document.body.append(e);setTimeout(()=>e.remove(),1300)},
 lunge:async(id,sd,type)=>{const g=M.get(id);if(!g)return;const col=TYC[type]||0xffffff;ring(g.position.x,g.position.z,col);g.userData.pop=.5;g.userData.fl=.6;await sleep(500);g.userData.off.z=(sd==='p'?-1:1)*2.2;await sleep(260);g.userData.off.z=0;await sleep(380)},
 ko:async id=>{const g=M.get(id);if(g){g.userData.sh=1.5;g.userData.fl=1}await sleep(650)},
 evolve:id=>{const g=M.get(id);if(!g)return;const p=g.position;ring(p.x,p.z,0xfcd34d);burst(p.x,p.z,0xfff1a8,70,3);burst(p.x,p.z,0x7dd3fc,30,2);g.userData.pop=1;g.userData.fl=1;g.userData.glow=1},
 announce:async o=>{const c=o.mon.card;$('ann2').innerHTML=`<img src="${imgOf(c)}" alt=""><div><small>${o.sd==='p'?'Kamu':'Bot'} • ${o.kind}</small><b>${o.name}</b><span>${cname(c)}${o.tx?' — '+o.tx:''}</span></div>`;{const g=M.get(o.mon.id);if(g)g.userData.pop=.6}$('ann2').classList.add('on');await sleep(3000);$('ann2').classList.remove('on')},
 revealPrizes:async(sd,ch)=>{if(sd!=='p'){await sleep(500);return}UI.reveal=new Set(ch.map(c=>c.id));sync();
  $('ann').innerHTML=`<div class="prz">${ch.map(c=>`<img src="${imgOf(c)}" alt="${cname(c)}">`).join('')}</div><b>Kartu Prize yang kamu ambil</b>`;$('ann').classList.add('on');await sleep(2400);$('ann').classList.remove('on');UI.reveal=null;sync();await sleep(250)},
 reveal:async(sd,cards,src)=>{if(sd==='p')return;$('ann').innerHTML=`<div class="prz">${cards.map(c=>`<img src="${imgOf(c)}" alt="${cname(c)}" style="max-width:calc((100vw - 32px)/${cards.length} - 14px);height:auto;max-height:min(52dvh,460px)">`).join('')}</div><b>Bot memperlihatkan kartu (${cname(src)})</b>`;
  $('ann').querySelectorAll('img').forEach((im,i)=>im.animate([{transform:'rotateY(90deg) scale(.6)',opacity:0},{transform:'rotateY(0) scale(1)',opacity:1}],{duration:450,delay:i*180,easing:'ease-out',fill:'backwards'}));
  $('ann').classList.add('on');await sleep(1400+SPD[UI.si][1]+cards.length*180);$('ann').classList.remove('on');await sleep(250)},
 toolspot:async(tool,sd)=>{const g=M.get(tool.id);if(g){ring(g.position.x,g.position.z,0xfcd34d);burst(g.position.x,g.position.z,0xfff1a8,30,1.6);g.userData.pop=.9;g.userData.fl=.8;g.userData.glow=1}say(`${cname(tool)} aktif: penyerang terkena damage balik`,2600,'good');await sleep(1500)},
 ability:async m=>{const g=M.get(m.id);if(g){ring(g.position.x,g.position.z,0xa78bfa);g.userData.pop=.5}await sleep(450)},
 flip:(sd,heads,why)=>new Promise(res=>{say(`🪙 ${why}...`,1800);COIN.visible=true;CS={t0:performance.now(),D:1500,end:(8+(heads?0:1))*Math.PI,res:()=>setTimeout(()=>{COIN.visible=false;CS=null;res()},650),done:0,fast:1}}),
 playcard:async(c,sd)=>{if(sd==='p'){panelOpen(c,`Kartu digunakan: ${cname(c)}. ${c.tx}`)}else{UI.limbo={c,sd,pos:'hidden'};sync();say(`Bot memakai ${cname(c)}`,4200,'bot');await cardFlyIn(c,sd);UI.limbo.pos='side';sync();await sleep(1100)}},
 endcard:async(c,sd,cancelled)=>{if(sd==='p'){if(!cancelled)await sleep(700);panelClose()}else{await sleep(800);UI.limbo=null;sync()}},
 mulligan:async(sd,hand,k)=>{const me=sd==='p',arrow='<svg viewBox="0 0 24 24" class="ar"><path d="M4 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  await dlg(`<h2>Mulligan${k>1?` ke-${k}`:''}</h2><p>${me?'Tanganmu':'Tangan Bot'} tidak punya Pokémon Basic.</p>
   <div class="mull"><div class="ms"><div class="mh">${hand.map(c=>`<img src="${imgOf(c)}" alt="">`).join('')}<b>✕</b></div><small>Tanpa Basic</small></div>${arrow}
   <div class="ms"><div class="sh"><i></i><i></i><i></i></div><small>Dikocok ke deck</small></div>${arrow}
   <div class="ms"><div class="nh">${Array.from({length:7},()=>'<i></i>').join('')}</div><small>7 kartu baru</small></div></div>
   <p class="sub">${me?'Lawan boleh ambil kartu ekstra.':'Kamu boleh ambil kartu ekstra.'}</p>`,[['Lanjut',1]])},
 dealPrizes:async()=>{say('Membagikan kartu Prize...',1500);await sleep(900)},
 revealSetup:async()=>{for(const sd of['p','o']){const a=G[sd].active;if(a){const g=M.get(a.id);if(g)ring(g.position.x,g.position.z,0x7dd3fc)}}await sleep(900)},
 turnstart:async sd=>{TURN={cur:sd,t0:performance.now()};const t=$('turn');t.textContent=sd==='p'?'Giliran Kamu':'Giliran Bot';t.className='on '+sd;
  if(sd==='p')say('Seret kartu dari tangan ke arena. Ikon hijau ✨ pada kartu = Ability bisa dipakai (arahkan kursor untuk nama Abilitynya).',4500,'good');
  await sleep(3000);t.className=''},
 end:r=>{setTimeout(()=>showEnd(r),700)},
 decideFirst:async()=>{
  const method=Math.random()<.5?'coin':'dice';
  await dlg(`<h2>${method==='coin'?'🪙 Lempar koin':'🎲 Lempar dadu'}</h2><p>Penentu siapa jalan duluan dipilih acak oleh sistem untuk pertandingan ini. Pemenang boleh memilih jalan duluan atau kedua.</p>`,[['Mulai',1]]);
  let win;
  if(method==='coin'){const call=await dlg('<h2>Tebak koin</h2>',[['⚡ Kepala',1],['🔴 Ekor',0,'atk']]);const heads=Math.random()<.5;await tossCoin(heads);win=heads===!!call?'p':'o';say(`Hasil: ${heads?'Kepala':'Ekor'} — ${win==='p'?'kamu':'Bot'} menang koin`,2500)}
  else{const call=await dlg('<h2>Tebak dadu</h2><p>Satu dadu (1–6). Tebak angka yang keluar ganjil atau genap.</p>',[['Ganjil',1],['Genap',0,'atk']]);const v=1+rnd(6);await rollDice(v);win=(v%2===1)===!!call?'p':'o';say(`Dadu: ${v} (${v%2?'ganjil':'genap'}) — ${win==='p'?'kamu':'Bot'} menang`,2500)}
  await sleep(900);let first='o';
  if(win==='p')first=await dlg('<h2>Kamu menang!</h2><p>Mau jalan duluan atau kedua?</p>',[['Jalan duluan','p'],['Jalan kedua','o','atk']]);else say('Bot memilih jalan duluan',2000);
  return{first,msg:`${method==='coin'?'Koin':'Dadu'}: ${win==='p'?'Kamu':'Bot'} menang; ${first==='p'?'Kamu':'Bot'} jalan duluan`}}
});
const tossCoin=heads=>new Promise(res=>{COIN.visible=true;CS={t0:performance.now(),D:2800,end:(14+(heads?0:1))*Math.PI,res:()=>setTimeout(()=>{COIN.visible=false;CS=null;res()},1300),done:0}});
const rollDice=v=>new Promise(res=>{const d=DICE[0];d.visible=true;d.userData.s=[0,0,0].map(()=>(Math.random()<.5?-1:1)*(2+rnd(3))*Math.PI*2);d.userData.v=v;DS={t0:performance.now(),D:2200,res:()=>setTimeout(()=>{d.visible=false;DS=null;res()},1600),done:0}});
function showEnd(r){const b=$('end-b');b.innerHTML=`<h2>${r==='p'?'🏆 Kamu menang!':r==='o'?(G.why==='menyerah'?'🏳️ Kamu menyerah':'💀 Bot menang'):'🤝 Seri'}</h2><p>${G.log.slice(-3).join('<br>')}</p>`;
 const add=(l,cls,f)=>{const e=document.createElement('button');e.className='b '+cls;e.textContent=l;e.onclick=()=>{$('end').classList.remove('on');f()};b.append(e)};
 if(r==='tie')add('Sudden Death (1 Prize)','atk',()=>startBattle(UI.last.list,UI.last.fmt,{prizes:1}));
 add('Main lagi','go',()=>startBattle(UI.last.list,UI.last.fmt));add('Menu utama','ghost',()=>toMenu());$('end').classList.add('on')}
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
 if(it.zone==='hand'){const c=G.p.hand[it.idx];if(!c)return;if(!(G.phase==='setup'?UI.placing&&!UI.panel:canAct()))return;UI.drag={id:it.id,card:c,x:it.x,z:it.z,hi:null,txt:''};hov=null}
 else if(it.zone==='pend'&&UI.attach){UI.drag={id:it.id,card:UI.attach.list[it.idx],pend:1,x:it.x,z:it.z,hi:null,txt:''}}
 else if(UI.want&&UI.want.drag&&it.mon&&UI.want.mons.includes(it.mon)){UI.drag={id:it.id,mon:it.mon,x:it.x,z:it.z,hi:null,txt:''}}
 if(UI.drag){cvs.style.cursor='grabbing';hideHv();UI.hp=null;UI.handUp=false;$('tip').style.display='none'}}
function moveDrag(e){
 aim(e);const p=ray.ray.intersectPlane(PL,PT);if(!p)return;const d=UI.drag;d.x=p.x;d.z=p.z-(e.pointerType==='touch'?1.1:.2);d.hi=null;d.zone=null;let txt='';
 if(d.coin){const opp=[...LI.values()].filter(it=>it.sd==='o'&&(it.zone==='act'||it.zone==='ben')&&UI.stage.tgts.includes(it.mon)&&(!UI.stage.tgt||it.mon===UI.stage.tgt)),ov=overMon(d.x,d.z,opp);d.tgt=ov?ov.mon:null;d.hi=ov?{x:ov.x,z:ov.z,s:ov.s,ok:1}:null;txt=ov?`Lepas untuk memindahkan 10 damage ke ${cname(ov.mon.card)}`:'Seret koin ke Pokémon lawan yang bercahaya'}
 else if(d.pend){const tg=[...LI.values()].filter(q=>q.sd==='p'&&q.zone==='ben'&&UI.attach.tgts.includes(q.mon)),ov=overMon(d.x,d.z,tg);d.ov=ov;d.hi=ov?{x:ov.x,z:ov.z,s:ov.s,ok:1}:null;txt=ov?`Lepas untuk memasang ${cname(d.card)} ke ${cname(ov.mon.card)}`:'Seret kartu Energi ke Pokémon Bench tujuan'}
 else if(d.mon){const w=UI.want,m=w.sd==='p'?1:-1,[ax,az]=Z.act(m);const over=Math.abs(d.x-ax)<1&&Math.abs(d.z-az)<1.2;d.over=over;d.hi={x:ax,z:az,s:Z.act(m)[2],ok:1};txt=over?'Lepas untuk memajukan '+cname(d.mon.card):'Seret ke kotak ACTIVE yang menyala'}
 else{const c=d.card,S=G.p,mons=ownMons(),ov=overMon(d.x,d.z,mons);d.ov=ov;d.act=0;d.dz=0;
  const az=Z.act(1)[1],as=Z.act(1)[2],nb=Z.ben(S.bench.length,1),benZone=Math.abs(d.x-nb[0])<nb[2]*.5+.2&&Math.abs(d.z-nb[1])<nb[2]*.7+.25,actZone=Math.abs(d.x)<as*.5+.3&&Math.abs(d.z-az)<as*.7+.3;
  const slotBen=Z.ben(S.bench.length,1);
  if(G.phase==='setup'){const wantAct=!S.active,elig=isBasic(c)||(c.ab&&c.ab.setup&&wantAct);const sl=wantAct?Z.act(1):slotBen;d.hi={x:sl[0],z:sl[1],s:sl[2],ok:elig};d.act=elig&&(wantAct?actZone:benZone)?1:0;
   txt=!elig?'Hanya Pokémon Basic yang bisa ditaruh':d.act?(wantAct?'Lepas di kotak ACTIVE (tertutup)':'Lepas di kotak BENCH (tertutup)'):(wantAct?'Seret ke kotak ACTIVE yang menyala':'Seret ke kotak BENCH yang menyala')}
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
 if(UI.panel||UI.stage||G.over)return;
 if(G.hidden&&it.sd==='o')return say('Pokémon lawan masih tertutup',1500);
 if(it.zone==='hand')return zoomCard(it.c);
 if(it.mon)return zoomMon(it.mon,it.sd);
 if(it.zone==='att'||it.zone==='stad')return zoomCard(it.c);
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
 {const it0=dn.i!==null&&LI.get(dn.i);if(it0&&it0.zone==='hand'&&e.pointerType==='touch'&&G&&!UI.panel&&!G.hidden){hov=dn.i;showHv(it0.c);dn.lpOn=1;return}}
 if(dn.i!==null)dn.lp=setTimeout(()=>{if(UI.dn===dn&&!UI.drag&&G){const it=LI.get(dn.i);if(canPrev(it)){showHv(it.c);dn.lpOn=1}}},420)});
cvs.addEventListener('pointermove',e=>{
 if(UI.drag)return moveDrag(e);
 const dn=UI.dn;
 if(dn){const mv=Math.hypot(e.clientX-dn.x,e.clientY-dn.y);
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
  if(tt){tip.textContent=tt;tip.style.display='block';tip.style.left=Math.min(e.clientX+14,innerWidth-270)+'px';tip.style.top=e.clientY+16+'px';UI.hp=rg}else{tip.style.display='none';UI.hp=null}}});
const endDn=()=>{const dn=UI.dn;if(dn){clearTimeout(dn.lp);if(dn.lpOn){hideHv();if(hov===dn.i)hov=null}}};
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
 for(const id of UI.abl||[]){const it=LI.get(id);if(it)L.push({x:it.x,z:it.z,s:it.s,ok:2})}
 if(UI.hp)L.push(UI.hp);
 return L}
/* --- loop render --- */
function loop(t){
 requestAnimationFrame(loop);const s=t/1000,now=performance.now();camUpd();
 for(const[id,g]of M){const d=g.userData,T=d.t;if(!T)continue;
  if(d.die){
   if(d.dest){const[dx,dz,ds]=d.dest;g.position.x+=(dx-g.position.x)*.13;g.position.z+=(dz-g.position.z)*.13;g.position.y+=(.5-g.position.y)*.13;g.scale.x+=(ds*.95-g.scale.x)*.13;g.scale.y=g.scale.z=g.scale.x;g.rotation.x+=(Math.PI/2-g.rotation.x)*.1;
    if((Math.hypot(g.position.x-dx,g.position.z-dz)<.18&&g.rotation.x>1.2)||now-d.dieT>1600){scene.remove(g);M.delete(id)}}
   else{g.scale.multiplyScalar(.86);g.position.y+=.03;if(g.scale.x<.04){scene.remove(g);M.delete(id)}}
   continue}
  const dr=UI.drag&&UI.drag.id===id,hv=hov===id&&T.zone==='hand',k=dr?.4:.17;
  let tx=T.x+d.off.x,tz=T.z+d.off.z-(hv?(T.s*.55):0)-((UI.handUp&&!UI.drag&&T.zone==='hand')?((1-LAY.hvis)*1.4*LAY.hs+.3):0),ty=T.y+(hv?.9:0),ts=T.s*(1+d.pop*.25),rx=T.up?-Math.PI/2+(T.tilt||0)+(hv?.1:0):Math.PI/2;
  if(T.zone==='dk'&&shufT[T.sd]>t){const i=+id.slice(3);tx+=Math.sin(t/60+i*2)*.5;tz+=Math.cos(t/55+i)*.18;ty+=.12*Math.abs(Math.sin(t/90+i))}
  if(dr){tx=UI.drag.x;tz=UI.drag.z;ty=1.6;ts=1.2;rx=-Math.PI/2+.3}
  else if(UI.drag&&UI.drag.hi&&T.mon&&Math.abs(T.x-UI.drag.hi.x)<.01&&Math.abs(T.z-UI.drag.hi.z)<.01)ts*=1.07+Math.sin(s*8)*.015;
  g.position.x+=(tx+(d.sh>.02?(Math.random()-.5)*.25*d.sh:0)-g.position.x)*k;g.position.z+=(tz-g.position.z)*k;g.position.y+=(ty-g.position.y)*k;
  g.scale.x+=(ts-g.scale.x)*k;g.scale.y=g.scale.z=g.scale.x;g.rotation.x+=(rx-g.rotation.x)*(dr?.3:.14);g.rotation.z+=((T.rz||0)-g.rotation.z)*.12;
  d.sh*=.9;d.fl*=.92;d.pop*=.9;const c=d.fl>.02?1-d.fl*.7:1;if(d.fl>.02||d.glow){d.f.material.color.setRGB(1,d.glow?1:c,d.glow?Math.min(1,c+.2):c);if(d.fl<=.02)d.glow=0}else d.f.material.color.setRGB(1,1,1);
  const o=OV.get(id);if(o){o.g.position.set(g.position.x,g.position.y+.045,g.position.z);o.g.scale.setScalar(g.scale.x)}
  if(T.zone==='hand'){const q=PX.get(id);if(q){q.position.z=T.z-((UI.handUp&&!UI.drag)?((1-LAY.hvis)*1.4*LAY.hs+.3):0);q.updateMatrixWorld()}}}
 updHp();turnUpd(s,now);cfUpdate(s);
 for(const k in AURA_M)AURA_M[k].opacity=.75+Math.sin(s*3)*.25;
 {const ids=UI.abl||[];ABG.forEach((m,i)=>{const it=ids[i]!==undefined&&LI.get(ids[i]);if(!it){m.visible=false;return}m.visible=true;m.position.set(it.x,.7+Math.sin(s*4+i)*.05,it.z+.5*it.s);m.scale.set(.42*(1+Math.sin(s*5)*.06),.42*(1+Math.sin(s*5)*.06),1)})}
 ZH.visible=false;
 const dzv=!!(UI.drag&&UI.drag.dz);DZ.visible=dzv;if(dzv){DZ.material.color.setHex(UI.drag.dzc||0x4dff88);DZ.material.opacity=.75+Math.sin(s*7)*.25}
 if(UI.stage){DCS.forEach((m,i)=>{if(!m.visible)return;const dc=UI.drag&&UI.drag.coin&&UI.drag.ci===i;if(dc)m.position.set(UI.drag.x,1.8,UI.drag.z);else m.position.set(-(LAY.W/2-1.1)+i*1.05,1.6+Math.sin(s*3+i)*.07,(LAY.handZ||5)-1.4)})}
 const gl=glows();RG.forEach((m,i)=>{const g=gl[i];if(!g){m.visible=false;return}m.visible=true;m.position.set(g.x,.2,g.z);m.scale.setScalar(g.s*(g.ok===2?1.22+Math.sin(s*5)*.07:1.14));m.material.color.setHex(g.ok===2?0x3dff7a:g.ok===3?0x9bdcff:g.ok?0xfcd34d:0xfb7185);m.material.opacity=.7+Math.sin(s*9)*.3});
 if(CS){const p=Math.min((now-CS.t0)/CS.D,1),q=Math.min(p/.86,1),e=1-Math.pow(1-q,3);COIN.rotation.x=CS.end*e;COIN.position.set(0,.3+Math.sin(Math.PI*q)*4.2,LAY.zc);if(p>=1&&!CS.done){CS.done=1;CS.res()}}
 if(DS){const p=Math.min((now-DS.t0)/DS.D,1),q=Math.min(p/.85,1),e=1-Math.pow(1-q,3);{const d=DICE[0],f=DROT[d.userData.v],sp=d.userData.s;d.rotation.set(f[0]+sp[0]*(1-e),f[1]+sp[1]*(1-e),f[2]+sp[2]*(1-e));d.position.set(0,.65+Math.sin(Math.PI*q)*2.8,LAY.zc)}if(p>=1&&!DS.done){DS.done=1;DS.res()}}
 for(let i=FXL.length-1;i>=0;i--){const f=FXL[i],p=(now-f.t0)/f.dur;if(p>=1){scene.remove(f.o);FXL.splice(i,1)}else f.upd(p)}
 const pp=spk.geometry.attributes.position;for(let i=0;i<90;i++){SP[i*3+1]+=.004;if(SP[i*3+1]>5)SP[i*3+1]=0}pp.needsUpdate=true;
 ren.render(scene,cam)}
requestAnimationFrame(loop);
/* --- mulai / akhir pertandingan --- */
function resetScene(){for(const g of M.values())scene.remove(g);for(const g of PX.values())scene.remove(g);for(const o of OV.values())scene.remove(o.g);for(const id of [...CF.keys()])cfDrop(id);M.clear();PX.clear();OV.clear();LI=new Map();DCS.forEach(m=>m.visible=false);DZ.visible=false}
async function startBattle(list,fmt,opt){
 UI.last={list,fmt};closeAll();resetScene();UI.placing=null;UI.si=UI.si||0;
 ['menu','pre','db'].forEach(i=>$(i).classList.remove('on'));$('end').classList.remove('on');
 document.body.classList.add('bt');$('log-b').innerHTML='';
 UI.themeI=(UI.themeI+1+rnd(2))%THEMES.length;const tn=setTheme(UI.themeI);
 DEC.p=UIDEC;DEC.o={...BOT,turn:s=>botTurn(s)};
 const lo=randomDeck();say(`Arena: ${tn} • Bot memilih deck acak`,2800);
 try{await setup(list,lo,opt)}catch(e){console.error(e);say('Terjadi galat: '+e.message,8000)}}
function toMenu(){closeAll();document.body.classList.remove('bt');resetScene();G=null;$('menu').classList.add('on')}
