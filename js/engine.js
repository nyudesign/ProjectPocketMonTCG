/* ===== MESIN ATURAN (tanpa DOM/Three.js) ===== */
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),opp=s=>s==='p'?'o':'p',rnd=n=>Math.random()*n|0;
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
let UID=0,G=null;const FX={},DEC={p:null,o:null};
const fx=async(k,...a)=>FX[k]?FX[k](...a):undefined,ask=(sd,k,o)=>DEC[sd][k](o);
const mk=key=>({...CARDS[key],key,id:++UID});
const isMon=c=>c.k==='pokemon',isBasic=c=>c.k==='pokemon'&&c.stage===0,isEn=c=>c.k==='energy'||c.k==='senergy',rule=c=>(c.prize||1)>1;
const inPlay=S=>[S.active,...S.bench].filter(Boolean),hp=m=>m.card.hp-m.dmg,cname=c=>c.ni||c.n;
const mkMon=(card,sd)=>({id:card.id,card,under:[],dmg:0,en:[],tool:null,sp:null,poison:0,burn:0,t:G[sd].tn,evo:-1,used:{},paraTn:0});
const log=t=>{G.log.push(t);fx('log',t)};
const who=sd=>sd==='p'?'Kamu':'Bot';
function newSide(sd,list){/*S.stad: Stadium sudah dimainkan giliran ini*/const deck=shuf(Object.entries(list).flatMap(([k,q])=>Array.from({length:q},()=>mk(k))));
 return{sd,deck,hand:[],prizes:[],discard:[],active:null,bench:[],tn:0,en:0,sup:0,ret:0,used:{},koMark:0,koFlag:0,mull:0,ready:0,stad:0}}
/* ---------- energi & biaya ---------- */
const provides=m=>m.en.flatMap(c=>c.k==='senergy'?[m.card.stage===0?'*':'C']:[c.t]);
function afford(m,cost){const p=provides(m);let wild=p.filter(x=>x==='*').length;const pool=p.filter(x=>x!=='*');
 for(const n of [...cost].filter(x=>x!=='C')){const k=pool.indexOf(n);if(k>=0)pool.splice(k,1);else if(wild>0)wild--;else return false}
 return pool.length+wild>=[...cost].filter(x=>x==='C').length}
const hasType=(m,t)=>provides(m).some(x=>x===t||x==='*');
const rcost=m=>Math.max(0,m.card.retreat-(m.tool&&m.tool.key==='balloon'?2:0));
/* ---------- primitif ---------- */
function draw(sd,n){const S=G[sd];let k=0;while(k<n&&S.deck.length){S.hand.push(S.deck.pop());k++}return k}
async function shuffleDeck(sd){shuf(G[sd].deck);await fx('shuffle',sd)}
async function flip(sd,why){const r=Math.random()<.5;await fx('flip',sd,r,why);log(`🪙 ${why}: ${r?'Kepala':'Ekor'}`);return r}
async function enforceBench(sd){const S=G[sd];while(S.bench.length>bmax(sd)){const ex=S.bench.length-bmax(sd);
 const m=await ask(sd,'mon',{title:`Bench melebihi batas (${bmax(sd)}). Pilih Pokémon yang dibuang (${ex} lagi)`,mons:S.bench,ctx:'target',sd,pref:x=>-mval(x)});discardMon(sd,m);log(`${cname(m.card)} dibuang karena Bench melebihi batas`);fx('sync')}}
/* pemilik Stadium membuang kelebihan Bench lebih dulu (teks Gua Besar Zero) */
async function enforceBoth(first){const f=first||(G.stadium?G.stadium.owner:G.cur);await enforceBench(f);await enforceBench(opp(f))}
function swapActive(sd,m){const S=G[sd],a=S.active;if(a){a.sp=null;a.poison=0;a.burn=0;a.opal=0;S.bench.push(a)}S.bench=S.bench.filter(x=>x!==m);S.active=m;fx('sync')}
function discardMon(sd,m){const S=G[sd];S.discard.push(...m.under,m.card,...m.en);if(m.tool)S.discard.push(m.tool);if(S.active===m)S.active=null;S.bench=S.bench.filter(x=>x!==m)}
const sideMons=sd=>inPlay(G[sd]);
const bmax=sd=>{const st=G.stadium&&G.stadium.card;return st&&st.bench8&&inPlay(G[sd]).some(m=>m.card.tera)?8:5};
const firstTurn=sd=>G.first===sd&&G[sd].tn===1;
/* ---------- damage, KO, prize ---------- */
async function hitMon(att,def,defSd,base){
 let d=base;const isAct=G[defSd].active===def;
 if(!isAct&&def.card.tera){log(`${cname(def.card)} (Terastal di Bench) tidak menerima damage`);return 0}
 if(isAct&&att&&def.opal&&G.cur===opp(defSd)&&G[G.cur].tn===def.opal&&att.card.stage===0&&att.card.type!=='C'){log(`Crown Opal: ${cname(def.card)} tidak menerima damage dari Pokémon Basic`);return 0}
 if(isAct&&att){if(def.card.weak&&def.card.weak===att.card.type)d*=2;if(def.card.res&&def.card.res===att.card.type)d=Math.max(0,d-30)}
 if(d>0&&def.card.key==='cinccino'){if(await flip(defSd,'Lapisan Mulus')){log('Lapisan Mulus mencegah damage');d=0}}
 if(d>0){def.dmg+=d;fx('hit',def.id,d,att&&att.card.type);log(`${cname(def.card)} menerima ${d} damage`)}
 if(d>0&&att&&isAct&&def.tool&&def.tool.key==='helmet'&&def.card.type==='D'){await fx('pause');await fx('toolspot',def.tool,defSd,att);att.dmg+=40;fx('hit',att.id,40,def.card.type);log(`Helm Punk: ${cname(att.card)} menerima 4 damage counter`)}
 return d}
const winnersNow=()=>{const w=[];for(const sd of['p','o']){if(G[sd].prizes.length===0)w.push(sd);if(inPlay(G[opp(sd)]).length===0&&!w.includes(sd))w.push(sd)}return w};
async function resolveKO(){
 const kos=[];for(const sd of['p','o'])for(const m of inPlay(G[sd]))if(hp(m)<=0)kos.push({sd,m});
 if(!kos.length)return;
 for(const{sd,m}of kos){log(`💥 ${cname(m.card)} (${who(sd)}) KO!`);await fx('ko',m.id);discardMon(sd,m);if(sd!==G.cur&&!G.inCheck)G[sd].koMark=1;/* KO saat Checkup = di antara giliran, bukan di giliran lawan */fx('sync')}
 await sleep(0);
 for(const sd of[G.cur,opp(G.cur)]){let n=kos.filter(k=>k.sd===opp(sd)).reduce((a,k)=>a+(k.m.card.prize||1),0);
  if(n&&G.atk&&G.atk.sd===sd&&G.atk.tera&&G[sd].briar===G[sd].tn&&kos.some(k=>k.m===G.atk.act)){n++;log('Briar: +1 Prize')}
  if(n)await takePrizes(sd,n)}
 const w=winnersNow();if(w.length)return endGame(w.length>1?'tie':w[0]);
 for(const sd of[G.cur,opp(G.cur)]){const S=G[sd];if(!S.active&&S.bench.length){
   const m=await ask(sd,'mon',{title:'Active-mu KO! Seret Pokémon Bench ke Active',mons:S.bench,ctx:'promote',sd});swapActive(sd,m);log(`${who(sd)} memajukan ${cname(m.card)}`)}}
 await enforceBoth();fx('sync')}
async function takePrizes(sd,n){const S=G[sd],k=Math.min(n,S.prizes.length);if(!k)return;
 const ch=await ask(sd,'prizes',{prizes:S.prizes,n:k});
 await fx('revealPrizes',sd,ch);
 for(const c of ch){S.prizes.splice(S.prizes.indexOf(c),1);S.hand.push(c);log(`${who(sd)} mengambil 1 Prize (${S.prizes.length} tersisa)`)}fx('sync')}
function endGame(r){if(G.over)return;G.over=r;log(r==='tie'?'Seri!':`🏆 ${who(r)} menang!`);fx('end',r);if(G.turnResolve)G.turnResolve()}
/* ---------- Pokémon Checkup ---------- */
async function checkup(){
 const sides=['p','o'];let any=0;
 for(const sd of sides){const m=G[sd].active;if(m&&m.poison){m.dmg+=10;any=1;fx('hit',m.id,10);log(`☠️ ${cname(m.card)} terkena Poison (+10)`)}}
 for(const sd of sides){const m=G[sd].active;if(m&&m.burn){m.dmg+=20;any=1;fx('hit',m.id,20);log(`🔥 ${cname(m.card)} terkena Burn (+20)`);if(await flip(sd,'Burn sembuh?')){m.burn=0;log('Burn sembuh')}}}
 for(const sd of sides){const m=G[sd].active;if(m&&m.sp==='asleep'&&await flip(sd,'Asleep bangun?')){m.sp=null;log(`${cname(m.card)} bangun`)}}
 for(const sd of sides){const m=G[sd].active;if(m&&m.sp==='paralyzed'&&sd===G.cur&&G[sd].tn>m.paraTn){m.sp=null;log(`${cname(m.card)} pulih dari Paralyzed`)}}
 fx('sync');G.inCheck=1;try{await resolveKO()}finally{G.inCheck=0}void any}
const setSp=(m,sd,s)=>{m.sp=s;if(s==='paralyzed')m.paraTn=G[sd].tn;log(`${cname(m.card)} menjadi ${s==='asleep'?'Asleep':s==='confused'?'Confused':'Paralyzed'}`);fx('sync')};
/* ---------- aturan boleh/tidak ---------- */
function whyTrainer(sd,c){const S=G[sd],E=G[opp(sd)];
 if(c.k==='stadium'){if(S.stad)return'Sudah memainkan Stadium giliran ini';if(G.stadium&&G.stadium.card.n===c.n)return'Stadium dengan nama yang sama sedang aktif'}
 if(c.k==='supporter'){if(firstTurn(sd))return'Pemain pertama tidak boleh memakai Supporter di giliran pertama';if(S.sup)return'Sudah memakai Supporter giliran ini'}
 switch(c.key){
  case'poffin':if(S.bench.length>=bmax(sd))return'Bench penuh';break;
  case'eretrieval':if(!S.discard.some(x=>x.k==='energy'))return'Tidak ada Energi Dasar di discard';break;
  case'stretcher':if(!S.discard.some(x=>isMon(x)||x.k==='energy'))return'Tidak ada Pokémon/Energi Dasar di discard';break;
  case'prime':case'boss':if(!E.bench.length)return'Lawan tidak punya Pokémon di Bench';break;
  case'redcard':if(E.prizes.length>3)return'Prize lawan masih lebih dari 3';break;
  case'ultra':if(S.hand.length<3)return'Butuh 2 kartu lain di tangan untuk dibuang';break;
  case'iris':if(S.hand.length<2)return'Butuh 1 kartu lain di tangan untuk dibuang';break;
  case'briar':if(E.prizes.length!==2)return'Hanya bisa saat Prize lawan tersisa 2';break;
  case'pokegear':if(!S.deck.length)return'Deck kosong';break;
  case'candy':if(S.tn<2)return'Tidak boleh di giliran pertamamu';if(!S.hand.some(h=>inPlay(S).some(m=>candyOk(sd,h,m))))return'Tidak ada Stage 2 di tangan untuk Pokémon Basic di Arena';break}
 return''}
const candyOk=(sd,c,m)=>c.stage===2&&m.card.stage===0&&m.t!==G[sd].tn&&Object.values(CARDS).some(s=>s.n===c.from&&s.from===m.card.n);
const whyEvolve=(sd,c,m)=>{const S=G[sd];if(c.from!==m.card.n)return`Hanya bisa dari ${c.from}`;if(S.tn<2)return'Tidak boleh evolusi di giliran pertamamu';if(m.t===S.tn)return'Pokémon baru masuk lapangan giliran ini';if(m.evo===S.tn)return'Sudah berevolusi giliran ini';return''};
const whyEnergy=sd=>G[sd].en?'Sudah memasang Energi giliran ini':'';
const whyTool=(sd,c,m)=>m.tool?'Pokémon sudah memegang Tool':'';
const whyBasic=sd=>G[sd].bench.length>=bmax(sd)?`Bench penuh (maks ${bmax(sd)})`:'';
const whyRetreat=sd=>{const S=G[sd],a=S.active;if(!a)return'Tidak ada Active';if(S.ret)return'Sudah mundur giliran ini';if(a.sp==='asleep'||a.sp==='paralyzed')return'Asleep/Paralyzed tidak bisa mundur';if(!S.bench.length)return'Bench kosong';if(a.en.length<rcost(a))return`Butuh ${rcost(a)} Energi untuk mundur`;return''};
const whyAttack=(sd,k)=>{const S=G[sd],a=S.active;if(!a)return'Tidak ada Active';if(firstTurn(sd))return'Pemain pertama tidak boleh menyerang di giliran pertama';if(a.sp==='asleep')return'Asleep tidak bisa menyerang';if(a.sp==='paralyzed')return'Paralyzed tidak bisa menyerang';if(a.card.atk[k].fx==='union'&&G.first!==sd&&S.tn===1)return'Tidak bisa di giliran pertama Pemain Kedua';if(!afford(a,a.card.atk[k].cost))return'Energi belum cukup';return''};
const hasDark=m=>m.en.some(c=>c.t==='D')||(m.card.stage===0&&m.en.some(c=>c.key==='prism'));
const AB={
 adr:{why:(sd,m)=>m.used.adr?'Sudah dipakai giliran ini':!hasDark(m)?'Butuh Energi Kegelapan di Pokémon ini':!sideMons(sd).some(x=>x.dmg>0)?'Tidak ada damage counter untuk dipindah':'',
  async run(sd,m){
   const apply=(src,tgt,n)=>{src.dmg-=10*n;tgt.dmg+=10*n;fx('hit',tgt.id,10*n);log(`${who(sd)} memindahkan ${n} damage counter dari ${cname(src.card)} ke ${cname(tgt.card)}`);fx('sync')};
   const r=await ask(sd,'moveDmg',{srcs:sideMons(sd).filter(x=>x.dmg>0),tgts:sideMons(opp(sd)),max:3,card:m.card,apply});
   if(!r||!r.k)return'cancel';if(!r.applied)apply(r.src,r.tgt,r.k);
   m.used.adr=1;await resolveKO()}},
 chance:{why:(sd,m)=>G[sd].used.chance?'Ability ini sudah dipakai giliran ini':!G[sd].koFlag?'Tidak ada Pokémonmu yang KO di giliran lawan sebelumnya':'',
  async run(sd,m){G[sd].used.chance=1;m.used.chance=1;const n=draw(sd,3);log(`${who(sd)} mengambil ${n} kartu (Kesempatan dalam Kesempitan)`)}},
 chain:{why:(sd,m)=>G[sd].used.chain?'Ability ini sudah dipakai giliran ini':!G[sd].bench.some(x=>x.card.type==='D'&&x.card.key!=='pecharunt')?'Tidak ada Pokémon Kegelapan di Bench':'',
  async run(sd,m){const S=G[sd];S.used.chain=1;
   const t=await ask(sd,'mon',{title:'Seret Pokémon Kegelapan Bench ke Active',mons:S.bench.filter(x=>x.card.type==='D'&&x.card.key!=='pecharunt'),ctx:'promote',sd});
   swapActive(sd,t);t.poison=1;log(`${cname(t.card)} maju dan terkena Poison`)}},
 upper:{why:(sd,m)=>m.used.upper?'Sudah dipakai giliran ini':!G[sd].deck.some(c=>c.k==='energy'&&c.t==='D')?'Tidak ada Energi Dasar Kegelapan di Deck':!G[sd].bench.some(x=>x.card.type==='D')?'Tidak ada Pokémon Kegelapan di Bench':'',
  async run(sd,m){const S=G[sd];m.used.upper=1;const e=S.deck.find(c=>c.k==='energy'&&c.t==='D');
   const t=await ask(sd,'mon',{title:'Pilih Pokémon Kegelapan di Bench penerima Energi',mons:S.bench.filter(x=>x.card.type==='D'),ctx:'target',sd,pref:x=>x.card.hp-x.dmg});
   S.deck.splice(S.deck.indexOf(e),1);t.en.push(e);await shuffleDeck(sd);fx('energy',t,e);t.dmg+=20;fx('hit',t.id,20);log(`${who(sd)} memasang Energi ke ${cname(t.card)} (+20 damage)`);await resolveKO()}}};
const isTrainer=x=>['item','supporter','tool','stadium'].includes(x.k);
/* kartu ke tangan yang teksnya "perlihatkan ke lawan" */
async function toHand(sd,src,r){r.forEach(x=>G[sd].hand.push(x));if(r.length){log(`${who(sd)} memperlihatkan ${r.map(cname).join(', ')}`);await fx('reveal',sd,r,src)}}
AB.fan={why:(sd,m)=>G[sd].tn!==1?'Hanya di giliran pertamamu':G[sd].used.fan?'Fan Call sudah dipakai giliran ini':!G[sd].deck.some(x=>isMon(x)&&x.type==='C'&&x.hp<=100)?'Tidak ada Pokémon Normal HP ≤100 di Deck':'',
 async run(sd,m){const S=G[sd];S.used.fan=1;const r=await pickDeck(sd,m.card,{title:'Pilih s/d 3 Pokémon Normal (HP ≤100) untuk tangan',pred:x=>isMon(x)&&x.type==='C'&&x.hp<=100,max:3,pref:wantPoke(sd)});await toHand(sd,m.card,r);log(`${who(sd)} mengambil ${r.length} Pokémon (Fan Call)`);await shuffleDeck(sd)}};
AB.jewel={why:()=>'Hanya saat berevolusi dari tangan',
 async run(sd,m){const S=G[sd],pref=x=>x.k==='supporter'?(S.hand.some(h=>h.k==='supporter')?1:3):x.k==='stadium'?(G.stadium?.5:2.5):x.key==='ultra'||x.key==='poffin'?2:1;
  const r=await pickDeck(sd,m.card,{title:'Mencari Permata: pilih s/d 2 Trainer untuk tangan',pred:isTrainer,max:2,pref});await toHand(sd,m.card,r);log(`${who(sd)} mengambil ${r.length} Trainer (Mencari Permata)`);await shuffleDeck(sd)}};
AB.recon={why:(sd,m)=>m.used.recon?'Sudah dipakai giliran ini':!G[sd].deck.length?'Deck kosong':'',
 async run(sd,m){const S=G[sd],top=S.deck.slice(-2).reverse(),pref=x=>x.k==='supporter'&&!S.hand.some(h=>h.k==='supporter')?5:x.stage===2?4:x.key==='candy'?3:isEn(x)?2:1;
  const r=await ask(sd,'cards',{title:'Perintah Rekonaisans: ambil 1 ke tangan, sisanya ke bawah Deck',cards:top,min:1,max:1,card:m.card,pref,from:'deck'});if(!r||!r.length)return'cancel';
  m.used.recon=1;top.forEach(x=>S.deck.splice(S.deck.indexOf(x),1));S.hand.push(r[0]);S.deck.unshift(...top.filter(x=>x!==r[0]));log(`${who(sd)} mengambil 1 kartu dan menaruh sisanya ke bawah Deck`)}};
const abWhy=(sd,m)=>{const a=m.card.ab;if(!a||a.passive||a.setup)return'Tidak ada Ability yang bisa dipakai';if(G.cur!==sd)return'Bukan giliranmu';return AB[a.key].why(sd,m)};
/* ---------- efek Trainer ---------- */
async function pickDeck(sd,c,o){const S=G[sd],pool=S.deck.filter(o.pred);if(!pool.length||!o.max)return[];
 const r=await ask(sd,'cards',{title:o.title,cards:pool,max:o.max,card:c,pref:o.pref,from:'deck'});r.forEach(x=>S.deck.splice(S.deck.indexOf(x),1));return r}
const wantPoke=(sd)=>x=>{const S=G[sd],pl=inPlay(S);let v=x.hp/100;if(x.stage>0&&pl.some(m=>m.card.n===x.from)&&!S.hand.some(h=>h.n===x.n))v+=30;if(isBasic(x)&&!inPlay(S).length)v+=50;if(x.prize>1)v+=5;return v};
const EFF={
 async stadium(sd,c){const old=G.stadium;G.stadOld=old&&old.owner;if(old){G[old.owner].discard.push(old.card);log(`${cname(old.card)} dibuang (diganti)`)}G.stadium={card:c,owner:sd};G[sd].stad=1;log(`${who(sd)} memasang Stadium ${cname(c)}`);fx('sync')},
 async poffin(sd,c){const S=G[sd],r=await pickDeck(sd,c,{title:'Pilih s/d 2 Pokémon Basic (HP ≤70) untuk Bench',pred:x=>isBasic(x)&&x.hp<=70,max:Math.min(2,bmax(sd)-S.bench.length),pref:x=>x.hp});
  r.forEach(x=>S.bench.push(mkMon(x,sd)));log(`${who(sd)} menaruh ${r.length} Pokémon ke Bench`);await shuffleDeck(sd)},
 async eretrieval(sd,c){const S=G[sd],pool=S.discard.filter(x=>x.k==='energy');const r=await ask(sd,'cards',{title:'Ambil s/d 2 Energi Dasar dari discard',cards:pool,max:2,card:c,pref:()=>1,from:'discard'});r.forEach(x=>S.discard.splice(S.discard.indexOf(x),1));await toHand(sd,c,r);log(`${who(sd)} mengambil ${r.length} Energi dari discard`)},
 async stretcher(sd,c){const S=G[sd],pool=S.discard.filter(x=>isMon(x)||x.k==='energy');const r=await ask(sd,'cards',{title:'Ambil 1 Pokémon atau Energi Dasar dari discard',cards:pool,max:1,card:c,pref:x=>isMon(x)?x.hp/100+1:.5,from:'discard'});r.forEach(x=>S.discard.splice(S.discard.indexOf(x),1));await toHand(sd,c,r);log(`${who(sd)} mengambil ${r.length?cname(r[0]):'tidak ada'} dari discard`)},
 async pad(sd,c){const S=G[sd],r=await pickDeck(sd,c,{title:'Pilih 1 Pokémon (tanpa Rule Box) untuk tangan',pred:x=>isMon(x)&&!rule(x),max:1,pref:wantPoke(sd)});await toHand(sd,c,r);log(`${who(sd)} mencari ${r.length?'1 Pokémon':'tapi tidak mengambil apa pun'}`);await shuffleDeck(sd)},
 async prime(sd,c){const S=G[sd],E=G[opp(sd)];
  const t=await ask(sd,'mon',{title:'Seret Pokémon Bench lawan ke Active lawan',mons:E.bench,ctx:'gust',sd:opp(sd),cancel:true,pref:x=>hp(x)<=0?1:(100-hp(x)/10)+(x.card.prize||1)*20});if(!t)return'cancel';
  swapActive(opp(sd),t);log(`${cname(t.card)} ditarik ke Active lawan`);
  if(S.bench.length){const m=await ask(sd,'mon',{title:'Seret Pokémon Bench-mu ke Active',mons:S.bench,ctx:'promote',sd});swapActive(sd,m)}},
 async boss(sd,c){const E=G[opp(sd)];const t=await ask(sd,'mon',{title:'Seret Pokémon Bench lawan ke Active lawan',mons:E.bench,ctx:'gust',sd:opp(sd),cancel:true,pref:x=>(100-hp(x)/10)+(x.card.prize||1)*20});if(!t)return'cancel';swapActive(opp(sd),t);log(`${cname(t.card)} ditarik ke Active lawan`)},
 async redcard(sd,c){const E=G[opp(sd)],o=opp(sd);E.deck.unshift(...shuf(E.hand.splice(0)));draw(o,3);log(`${who(o)} mengocok tangan ke bawah Deck dan mengambil 3 kartu`);await fx('shuffle',o)},
 async ultra(sd,c){const S=G[sd];const d=await ask(sd,'cards',{title:'Buang 2 kartu lain dari tangan',cards:S.hand.filter(x=>x!==c),min:2,max:2,card:c,cost:true,pref:x=>isEn(x)?3:isMon(x)?(x.stage>0?1:2):(x.k==='item'?2:1)});
  if(!d||d.length<2)return'cancel';d.forEach(x=>{S.hand.splice(S.hand.indexOf(x),1);S.discard.push(x)});
  const r=await pickDeck(sd,c,{title:'Pilih 1 Pokémon untuk tangan',pred:isMon,max:1,pref:wantPoke(sd)});await toHand(sd,c,r);log(`${who(sd)} membuang 2 kartu dan mencari ${r.length} Pokémon`);await shuffleDeck(sd)},
 async hilda(sd,c){const S=G[sd],a=await pickDeck(sd,c,{title:'Pilih 1 Pokémon Evolusi',pred:x=>isMon(x)&&x.stage>0,max:1,pref:wantPoke(sd)}),b=await pickDeck(sd,c,{title:'Pilih 1 Energi',pred:isEn,max:1,pref:x=>x.k==='energy'?2:1});
  await toHand(sd,c,[...a,...b]);log(`${who(sd)} mengambil ${a.length+b.length} kartu dengan Hilda`);await shuffleDeck(sd)},
 async iris(sd,c){const S=G[sd];const d=await ask(sd,'cards',{title:'Buang 1 kartu lain dari tangan',cards:S.hand.filter(x=>x!==c),min:1,max:1,card:c,cost:true,pref:x=>isEn(x)?3:isMon(x)&&x.stage===0?1:2});
  if(!d||!d.length)return'cancel';S.hand.splice(S.hand.indexOf(d[0]),1);S.discard.push(d[0]);const n=draw(sd,Math.max(0,6-S.hand.length));log(`${who(sd)} membuang 1 kartu dan mengambil ${n} kartu`)},
 async briar(sd,c){G[sd].briar=G[sd].tn;log('Briar aktif: KO Active lawan oleh serangan Pokémon Terastal-mu giliran ini memberi 1 Prize tambahan')},
 async pokegear(sd,c){const S=G[sd],top=S.deck.slice(-7).reverse();
  const r=await ask(sd,'cards',{title:'Pokégear 3.0: 7 kartu teratas — ambil 1 Supporter',cards:top,pick:x=>x.k==='supporter',max:1,card:c,pref:()=>1,from:'deck'});
  r.forEach(x=>S.deck.splice(S.deck.indexOf(x),1));await toHand(sd,c,r);log(`${who(sd)} melihat 7 kartu teratas dan ${r.length?'mengambil 1 Supporter':'tidak mengambil Supporter'}`);await shuffleDeck(sd)},
 async candy(sd,c){const S=G[sd],pl=inPlay(S);
  const e=await ask(sd,'cards',{title:'Pilih 1 Pokémon Stage 2 dari tangan',cards:S.hand.filter(h=>pl.some(m=>candyOk(sd,h,m))),min:1,max:1,card:c,pref:()=>1});if(!e||!e.length)return'cancel';
  const m=await ask(sd,'mon',{title:`Pilih Pokémon Basic yang berevolusi menjadi ${cname(e[0])}`,mons:pl.filter(m=>candyOk(sd,e[0],m)),ctx:'target',sd,cancel:true,pref:x=>(x===S.active?2:1)+x.en.length});if(!m)return'cancel';
  await evolveMon(sd,e[0],m)},
 async lillie(sd,c){const S=G[sd];S.deck.push(...S.hand.splice(0));await shuffleDeck(sd);const n=draw(sd,S.prizes.length===6?8:6);log(`${who(sd)} mengocok tangan ke Deck dan mengambil ${n} kartu`)}};
/* ---------- aksi pemain/bot ---------- */
async function act(fn){if(!G||G.busy||G.over)return;G.busy=1;try{return await fn()}finally{G.busy=0;fx('sync')}}
const rmHand=(S,c)=>S.hand.splice(S.hand.indexOf(c),1);
function actBasic(sd,c){const w=whyBasic(sd);if(w)return w;const S=G[sd];rmHand(S,c);S.bench.push(mkMon(c,sd));log(`${who(sd)} menaruh ${cname(c)} ke Bench`);fx('sync')}
function actEnergy(sd,c,m){const w=whyEnergy(sd);if(w)return w;const S=G[sd];rmHand(S,c);m.en.push(c);S.en=1;log(`${who(sd)} memasang ${cname(c)} ke ${cname(m.card)}`);fx('sync');fx('energy',m,c)}
function actTool(sd,c,m){const w=whyTool(sd,c,m);if(w)return w;const S=G[sd];rmHand(S,c);m.tool=c;log(`${who(sd)} memasang ${cname(c)} ke ${cname(m.card)}`);fx('sync')}
async function actEvolve(sd,c,m){const w=whyEvolve(sd,c,m);if(w)return w;await evolveMon(sd,c,m)}
async function evolveMon(sd,c,m){const S=G[sd];rmHand(S,c);m.under.push(m.card);m.card=c;m.evo=S.tn;m.sp=null;m.poison=0;m.burn=0;log(`✨ ${who(sd)} mengevolusikan ke ${cname(c)}`);fx('evolve',m.id);fx('sync');
 if(c.ab&&c.ab.key==='jewel'&&inPlay(S).some(x=>x.card.tera)&&await ask(sd,'confirm',{title:`Pakai Ability ${c.ab.n}?`,tx:c.ab.tx,card:c})){log(`${who(sd)} memakai Ability ${c.ab.n} (${cname(c)})`);await fx('announce',{mon:m,name:c.ab.n,tx:c.ab.tx,sd,kind:'Ability'});await AB.jewel.run(sd,m);fx('abend')}}
async function actTrainer(sd,c){const w=whyTrainer(sd,c);if(w)return w;const S=G[sd];rmHand(S,c);G.limbo=c;fx('sync');
 log(`${who(sd)} memakai ${cname(c)}`);await fx('playcard',c,sd);
 const r=await(EFF[c.key]||EFF[c.k])(sd,c);G.limbo=null;
 if(r==='cancel'){S.hand.push(c);log('Dibatalkan');await fx('endcard',c,sd,true);return}
 if(c.k==='supporter')S.sup=1;if(c.k!=='stadium')S.discard.push(c);await fx('endcard',c,sd,false);if(c.k==='stadium')await enforceBoth(G.stadOld)}
async function actAbility(sd,m){const w=abWhy(sd,m);if(w)return w;log(`${who(sd)} memakai Ability ${m.card.ab.n} (${cname(m.card)})`);await fx('announce',{mon:m,name:m.card.ab.n,tx:m.card.ab.tx,sd,kind:'Ability'});const rr_=await AB[m.card.ab.key].run(sd,m);fx('abend');if(rr_==='cancel')log('Ability dibatalkan')}
async function actRetreat(sd){const w=whyRetreat(sd);if(w)return w;const S=G[sd],a=S.active;
 const m=await ask(sd,'mon',{title:'Seret Pokémon Bench ke Active untuk mundur',mons:S.bench,ctx:'retreat',sd,cancel:true,pref:x=>afford(x,x.card.atk[0].cost)?100+hp(x):hp(x)});if(!m)return;
 const cost=rcost(a);let pay=[];
 if(cost>0){pay=await ask(sd,'pay',{mon:a,cost,to:m,cancel:true});if(!pay)return}
 pay.forEach(c=>{a.en.splice(a.en.indexOf(c),1);S.discard.push(c)});swapActive(sd,m);S.ret=1;log(`${who(sd)} mundur: ${cname(a.card)} → ${cname(m.card)}`)}
const bestTarget=(sd,pref)=>{const l=sideMons(sd);return l.sort((a,b)=>pref(b)-pref(a))[0]};
async function actAttack(sd,k){const w=whyAttack(sd,k);if(w)return w;
 const S=G[sd],E=G[opp(sd)],a=S.active,at=a.card.atk[k],o=opp(sd);
 log(`⚔️ ${cname(a.card)} memakai ${at.n}`);await fx('announce',{mon:a,name:at.n,tx:at.tx,sd,kind:'Jurus'});
 if(a.sp==='confused'){const h=await flip(sd,'Confused');if(!h){await fx('strike',{a,at,sd,fail:1});a.dmg+=30;fx('hit',a.id,30);log(`${cname(a.card)} melukai dirinya sendiri (30)`);await resolveKO();return finishTurn()}}
 let base=at.dmg,tgt=E.active;
 if(at.fx==='jaw'&&a.dmg>0)base+=150;
 if(at.fx==='ledak')base=60*(G.prizeN-E.prizes.length);
 if(at.fx==='en40')base=40*a.en.length;
 if(at.fx==='union')base=30*S.bench.length;
 if(at.fx==='flip3'){let h=0;for(let i=0;i<3;i++)if(await flip(sd,'Menusuk Tiga Kali'))h++;base=10*h}
 if(at.fx==='landing'&&!G.stadium){base=0;log('Tidak ada Stadium: serangan gagal')}
 G.atk={sd,tera:!!a.card.tera,act:E.active};
 if(at.fx==='arrow'){tgt=await ask(sd,'mon',{title:'Pilih Pokémon lawan yang terkena 100 damage',mons:sideMons(o),ctx:'target',sd:o,pref:x=>hp(x)<=100?1000+(x.card.prize||1)*10:-hp(x)})}
 await fx('strike',{a,at,sd,tgt,n:base/10});
 if((at.dmg>0||at.fx==='ledak'||at.fx==='en40')&&tgt)await hitMon(a,tgt,o,at.fx==='arrow'?100:base);
 switch(at.fx){
  case'conf':if(E.active&&hp(E.active)>0)setSp(E.active,o,'confused');break;
  case'self10':a.dmg+=10;fx('hit',a.id,10);break;
  case'opal':a.opal=G[o].tn+1;log(`${cname(a.card)} terlindung dari Pokémon Basic di giliran lawan berikutnya`);break;
  case'dive':for(let i=0;i<6&&E.bench.length;i++){const t=await ask(sd,'mon',{title:`Phantom Dive: taruh damage counter ke Pokémon Bench lawan (${6-i} lagi)`,mons:E.bench,ctx:'target',sd:o,pref:x=>hp(x)<=0?-999:(hp(x)<=10*(6-i)?1000:0)+(x.card.prize||1)*20-hp(x)/10});t.dmg+=10;fx('hit',t.id,10);log(`${cname(t.card)} menerima 1 damage counter`)}break;
  case'draw2':{const n=draw(sd,2);log(`${who(sd)} mengambil ${n} kartu`);break}
  case'call':{const r=await pickDeck(sd,a.card,{title:'Pilih s/d 2 Pokémon Basic untuk Bench',pred:isBasic,max:Math.min(2,bmax(sd)-S.bench.length),pref:x=>x.hp});r.forEach(x=>S.bench.push(mkMon(x,sd)));log(`${who(sd)} memanggil ${r.length} Pokémon ke Bench`);await shuffleDeck(sd);break}
  case'turbo':{let r=await pickDeck(sd,a.card,{title:'Ambil s/d 3 Energi Dasar dari Deck',pred:x=>x.k==='energy',max:S.bench.length?3:0,pref:()=>1});
   if(r.length){await ask(sd,'attachEnergies',{energies:r,targets:S.bench,card:a.card,apply:(en,t)=>{t.en.push(en);fx('sync');fx('energy',t,en)}});
    for(const en of r)if(!S.bench.some(b=>b.en.includes(en)))S.bench[0].en.push(en)}
   if(r.length)log(`${who(sd)} memasang ${r.length} Energi ke Bench`);await shuffleDeck(sd);break}}
 fx('sync');await sleep(0);await resolveKO();G.atk=null;if(!G.over)finishTurn()}
function finishTurn(){if(G.turnResolve){const r=G.turnResolve;G.turnResolve=null;r()}}
/* ---------- Bot ---------- */
const mval=m=>m.card.hp/50+(m.card.prize||1)*3+m.en.length+(m.card.stage||0);
const dmgOf=(m,k)=>{const at=m.card.atk[k];return at.fx==='jaw'?at.dmg+(m.dmg>0?150:0):at.fx==='en40'?40*m.en.length:at.fx==='ledak'?60*(G.prizeN-G[opp(G.cur)].prizes.length):at.fx==='arrow'?100:at.fx==='union'?30*G[G.cur].bench.length:at.fx==='flip3'?15:at.fx==='landing'?(G.stadium?70:0):at.dmg};
const BOT={bot:true,
 async cards({cards,max,min=0,pref,pick}){const p=pref||(()=>1);let r=cards.filter(pick||(()=>true)).map(c=>[c,p(c)]).sort((a,b)=>b[1]-a[1]);if(min)r=r.slice(0,min);else r=r.filter(x=>x[1]>0).slice(0,max);return r.map(x=>x[0])},
 async mon({mons,pref}){const p=pref||(m=>mval(m)+(m.card.atk.some(a=>afford(m,a.cost))?20:0));return[...mons].sort((a,b)=>p(b)-p(a))[0]},
 async pay({mon,cost}){return[...mon.en].sort((a,b)=>(a.key==='prism')-(b.key==='prism')).slice(0,cost)},
 async prizes({prizes,n}){return shuf([...prizes]).slice(0,n)},
 async num({max}){return max},
 async confirm(){return true},
 async attachEnergies({energies,targets,apply}){for(const en of energies){const t=[...targets].sort((a,b)=>(b.card.hp/100-b.en.length)-(a.card.hp/100-a.en.length))[0];apply(en,t)}},
 async moveDmg({srcs,tgts,max}){const src=[...srcs].sort((a,b)=>b.dmg-a.dmg)[0],k=Math.min(max,src.dmg/10),tgt=[...tgts].sort((a,b)=>(hp(a)<=k*10?1000:(a.card.prize||1)*20-hp(a)/10)<(hp(b)<=k*10?1000:(b.card.prize||1)*20-hp(b)/10)?1:-1)[0];return{src,tgt,k}},
 async mullDraw({max}){return max},
 async place(sd){const S=G[sd],bs=S.hand.filter(isBasic).sort((a,b)=>b.hp-a.hp);let act=bs.find(c=>!rule(c))||bs[0];setupPlace(sd,act,'active');
  bs.filter(c=>c!==act).slice(0,bmax(sd)).forEach(c=>setupPlace(sd,c,'bench'))},
 async turn(sd){return botTurn(sd)}};
const pause=async()=>{fx('sync');await fx('pause')};
async function botTurn(sd){
 const S=G[sd],E=G[opp(sd)];let c,guard=0;
 const find=k=>S.hand.find(x=>x.key===k);
 const tryT=async k=>{const x=find(k);if(x&&!whyTrainer(sd,x)){await actTrainer(sd,x);await pause();return true}return false};
 if(S.active&&AB.chance&&S.active)for(const m of inPlay(S))if(m.card.ab&&m.card.ab.key==='chance'&&!abWhy(sd,m)){await actAbility(sd,m);await pause()}
 for(const m of inPlay(S))if(m.card.ab&&['fan','recon'].includes(m.card.ab.key)&&!abWhy(sd,m)){await actAbility(sd,m);await pause()}
 const cap=()=>inPlay(S).some(m=>m.card.tera)?bmax(sd):Math.min(4,bmax(sd));
 if(!S.sup&&!firstTurn(sd)&&!S.hand.some(x=>x.k==='supporter'))await tryT('pokegear');
 // Supporter
 const needCards=S.hand.length<=3;
 if(!S.sup&&!firstTurn(sd)){
  const pl=inPlay(S);const ready=a=>pl.some(m=>m.card.atk.some(t=>afford(m,t.cost)));
  const killBench=E.bench.find(b=>S.active&&Math.max(...S.active.card.atk.map((_,k)=>afford(S.active,S.active.card.atk[k].cost)?dmgOf(S.active,k):0))>=hp(b)&&hp(b)<hp(E.active||b)+1&&(b.card.prize||1)>1);
  if(find('briar')&&S.active&&S.active.card.tera&&E.active&&await tryT('briar'));
  else if(find('boss')&&killBench&&await tryT('boss'));
  else if(S.hand.length<=4&&find('lillie')&&await tryT('lillie'));
  else if(find('hilda')&&(S.hand.filter(isMon).every(x=>x.stage===0)||!S.hand.some(isEn))&&await tryT('hilda'));
  else if(S.hand.length<=3&&find('iris')&&await tryT('iris'));
  else if(find('lillie')&&S.hand.length<=5&&await tryT('lillie'));}
 // Item
 for(const st of S.hand.filter(x=>x.k==='stadium'))if((!st.bench8||inPlay(S).some(m=>m.card.tera))&&await tryT(st.key))break;
 if(S.bench.length<cap())await tryT('poffin');
 if(find('pad')&&S.deck.some(x=>isMon(x)&&!rule(x))&&(S.bench.length<3||S.hand.filter(isMon).length===0))await tryT('pad');
 if(S.hand.length>=5&&find('ultra')&&(S.bench.length<2||!S.hand.some(x=>x.stage>0)))await tryT('ultra');
 if(find('stretcher')&&S.discard.some(x=>isMon(x)&&x.prize>1)&&S.hand.length<6)await tryT('stretcher');
 if(find('eretrieval')&&S.discard.filter(x=>x.k==='energy').length>=2)await tryT('eretrieval');
 if(find('redcard')&&E.hand.length>=5)await tryT('redcard');
 // Bench & evolve
 while(S.bench.length<cap()&&(c=S.hand.find(isBasic))){actBasic(sd,c);await pause()}
 while(await tryT('candy'));
 for(const h of S.hand.filter(x=>isMon(x)&&x.stage>0)){const t=inPlay(S).sort((a,b)=>(b===S.active)-(a===S.active)).find(m=>!whyEvolve(sd,h,m));if(t){await actEvolve(sd,h,t);await pause()}}
 // Energi
 if(!S.en&&(c=S.hand.find(isEn))){
  const pl=inPlay(S),sc=m=>{const need=Math.max(...m.card.atk.map(a=>a.cost.length));let v=(m===S.active?4:0)+(m.card.stage>0||m.card.prize>1?3:0)+(m.card.tera?4:0)+(m.en.length<need?5-m.en.length:-3);if(c.k==='energy'&&(m.card.type===c.t||m.card.atk.some(a=>a.cost.includes(c.t))))v+=3;if(c.key==='prism'&&m.card.stage===0&&m.card.atk.some(a=>/P/.test(a.cost)))v+=4;return v};
  const t=pl.sort((a,b)=>sc(b)-sc(a))[0];if(t){actEnergy(sd,c,t);await pause()}}
 // Tool
 for(const tl of S.hand.filter(x=>x.k==='tool')){const t=tl.key==='helmet'?inPlay(S).find(m=>m.card.type==='D'&&!m.tool&&m===S.active)||inPlay(S).find(m=>m.card.type==='D'&&!m.tool):inPlay(S).filter(m=>!m.tool&&m.card.retreat>=1).sort((a,b)=>b.card.retreat-a.card.retreat)[0];if(t){actTool(sd,tl,t);await pause()}}
 // Ability
 for(const m of inPlay(S))if(m.card.ab&&['adr','upper','chain'].includes(m.card.ab.key)&&!abWhy(sd,m)){
  if(m.card.ab.key==='chain'&&!(S.active&&!S.active.card.atk.some(a=>afford(S.active,a.cost))))continue;
  if(m.card.ab.key==='adr'&&!sideMons(opp(sd)).length)continue;
  await actAbility(sd,m);await pause();if(G.over)return}
 // Gust jika bisa KO
 const bestAtk=()=>{const a=S.active;if(!a)return null;let b=null;a.card.atk.forEach((t,k)=>{if(!whyAttack(sd,k)){const d=dmgOf(a,k);if(!b||d>b.d)b={k,d}}});return b};
 let b=bestAtk();
 if(b&&!S.sup&&find('boss')&&!whyTrainer(sd,find('boss'))){const t=E.bench.find(x=>hp(x)<=b.d&&(x.card.prize||1)>=(E.active.card.prize||1));if(t&&hp(E.active)>b.d){await actTrainer(sd,find('boss'));await pause()}}
 if(b&&find('prime')&&!whyTrainer(sd,find('prime'))){const t=E.bench.find(x=>hp(x)<=b.d&&(x.card.prize||1)>1);if(t&&hp(E.active)>b.d){await actTrainer(sd,find('prime'));await pause()}}
 // Mundur
 if(S.active&&!bestAtk()&&!whyRetreat(sd)&&S.bench.some(m=>m.card.atk.some(t=>afford(m,t.cost)))){await actRetreat(sd);await pause()}
 b=bestAtk();
 if(b&&!G.over){await actAttack(sd,b.k);return}
 await pause()}
/* ---------- persiapan & alur permainan ---------- */
function setupPlace(sd,c,spot){const S=G[sd];if(spot==='active'&&S.active)return'Active sudah ada';if(spot==='bench'&&(S.bench.length>=bmax(sd)||!S.active))return S.active?'Bench penuh':'Pilih Active dulu';
 if(!(isBasic(c)||(spot==='active'&&c.ab&&c.ab.setup)))return'Hanya Pokémon Basic';rmHand(S,c);const m=mkMon(c,sd);m.t=0;if(spot==='active')S.active=m;else S.bench.push(m);fx('sync')}
function setupRemove(sd,m){const S=G[sd];if(S.active===m){S.bench.forEach(b=>S.hand.push(b.card));S.bench=[];S.active=null}else S.bench=S.bench.filter(x=>x!==m);S.hand.push(m.card);fx('sync')}
async function setup(deckP,deckO,opt={}){
 G={p:newSide('p',deckP),o:newSide('o',deckO),cur:null,first:null,phase:'setup',over:0,log:[],limbo:null,stadium:null,busy:0,prizeN:opt.prizes||6,hidden:1};fx('sync');
 const d=await fx('decideFirst')||{first:Math.random()<.5?'p':'o'};G.first=d.first;log(d.msg||`${who(G.first)} jalan duluan`);
 const mull={p:0,o:0};
 for(const sd of['p','o']){const S=G[sd];for(let i=0;i<7;i++)S.hand.push(S.deck.pop());
  while(!S.hand.some(isBasic)){mull[sd]++;log(`⚠️ ${who(sd)} mulligan #${mull[sd]} (tidak ada Pokémon Basic)`);await fx('mulligan',sd,[...S.hand],mull[sd]);S.deck.push(...S.hand.splice(0));shuf(S.deck);for(let i=0;i<7;i++)S.hand.push(S.deck.pop());fx('sync')}}
 for(const sd of['p','o']){const ex=mull[opp(sd)]-mull[sd];if(ex>0){const n=await ask(sd,'mullDraw',{max:ex,opp:opp(sd),mine:mull[sd],theirs:mull[opp(sd)]});if(n>0){draw(sd,n);log(`${who(sd)} mengambil ${n} kartu ekstra karena mulligan lawan`)}}}
 fx('sync');
 await ask('o','place','o');await ask('p','place','p');
 for(const sd of['p','o']){G[sd].prizes=G[sd].deck.splice(-G.prizeN)}fx('sync');await fx('dealPrizes');
 G.hidden=0;G.phase='play';log('Semua Pokémon dibuka. Pertandingan dimulai!');fx('sync');await fx('revealSetup');
 G.cur=G.first;
 while(!G.over){const sd=G.cur,S=G[sd];S.tn++;S.en=S.sup=S.ret=S.stad=0;S.used={};S.koFlag=S.koMark;S.koMark=0;inPlay(S).forEach(m=>m.used={});
  await fx('turnstart',sd);
  if(!S.deck.length){endGame(opp(sd));break}
  S.hand.push(S.deck.pop());log(`— Giliran ${who(sd)} #${S.tn} —`);fx('sync');await sleep(0);
  await new Promise(async res=>{G.turnResolve=res;try{await DEC[sd].turn(sd);if(DEC[sd].bot)finishTurn()}catch(e){console.error(e);res()}});
  if(G.over)break;await checkup();if(G.over)break;S.koFlag=0;G.cur=opp(sd)}
 return G.over}
/* ---------- deck: validasi, rekomendasi, acak ---------- */
function countDeck(l){return Object.values(l).reduce((a,b)=>a+b,0)}
function legal(list,fmt){const issues=[],warn=[],n=countDeck(list),byName={};let basics=0,ace=0;
 for(const[k,q]of Object.entries(list)){const c=CARDS[k];if(!q)continue;byName[c.n]=(byName[c.n]||0)+q;if(c.k==='pokemon'&&c.stage===0)basics+=q;if(c.ace)ace+=q;if(!FORMATS[fmt].ok(c))issues.push(`${c.n} tidak sah di format ${FORMATS[fmt].n}`)}
 if(n!==60)issues.push(`Jumlah kartu ${n}/60`);
 for(const[nm,q]of Object.entries(byName)){const c=Object.values(CARDS).find(x=>x.n===nm);if(q>4&&c.k!=='energy')issues.push(`${nm}: maks 4 salinan (ada ${q})`)}
 if(ace>1)issues.push('ACE SPEC maksimal 1 per deck');if(!basics)issues.push('Butuh minimal 1 Pokémon Basic');
 for(const[k,q]of Object.entries(list)){const c=CARDS[k];if(q&&c.k==='pokemon'&&c.stage>0&&!Object.keys(list).some(x=>list[x]&&CARDS[x].n===c.from))warn.push(`${c.n} butuh ${c.from} (tidak ada di deck)${c.ab&&c.ab.setup?' — kecuali lewat Ability':''}`)}
 return{ok:!issues.length,issues,warn,n}}
function recommend(cur){
 const L={...cur};Object.keys(L).forEach(k=>{if(!L[k])delete L[k]});
 if(!countDeck(L))return{...USER_DECK};
 const add=(k,q)=>{const c=CARDS[k],have=Object.entries(L).filter(([x])=>CARDS[x].n===c.n).reduce((a,[,v])=>a+v,0),cap=c.k==='energy'?99:c.ace?(Object.keys(L).some(x=>CARDS[x].ace&&x!==k)?0:1):4;const m=Math.max(0,Math.min(q,cap-have,60-countDeck(L)));if(m)L[k]=(L[k]||0)+m};
 for(const k of Object.keys(L)){const c=CARDS[k];if(c.from){const pre=Object.keys(CARDS).find(x=>CARDS[x].n===c.from);if(pre&&!L[pre])add(pre,L[k]+1)}}
 const basics=()=>Object.keys(L).filter(k=>CARDS[k].stage===0&&CARDS[k].k==='pokemon').reduce((a,k)=>a+L[k],0);
 if(basics()<6)['carvanha','toxel','minccino','munkidori'].forEach(k=>basics()<8&&add(k,2));
 [['ultra',4],['pad',3],['poffin',3],['lillie',4],['boss',2],['stretcher',2],['iris',2],['hilda',2],['balloon',2],['helmet',1],['eretrieval',1],['prime',1]].forEach(([k,q])=>{if(countDeck(L)<60-12)add(k,q)});
 const en=Object.keys(L).filter(k=>CARDS[k].k==='energy'||CARDS[k].k==='senergy').reduce((a,k)=>a+L[k],0);if(!en||en<10)add('denergy',60-countDeck(L)>10?10-en:60-countDeck(L));
 add('prism',1);
 const pool=['ultra','pad','poffin','lillie','boss','carvanha','toxel'];let g=0;while(countDeck(L)<60&&g++<200)add(pool[g%pool.length],1);add('denergy',60-countDeck(L));
 return L}
function randomDeck(){
 if(Math.random()<.5)return{...[TERA_DECK,DRAGA_DECK][rnd(2)]};
 const lines=[['carvanha','sharpedo'],['toxel','toxtricity'],['minccino','cinccino']],sup=['munkidori','fezan','pecharunt','cinderace'];
 const L={};const a=lines.splice(rnd(lines.length),1)[0],b=lines.splice(rnd(lines.length),1)[0];
 const add=(k,q)=>{L[k]=Math.min(4,(L[k]||0)+q)};
 add(a[0],4);add(a[1],3);if(Math.random()<.7){add(b[0],3);add(b[1],2)}
 shuf(sup).slice(0,2+rnd(2)).forEach(k=>add(k,k==='munkidori'?2:k==='cinderace'?0:1));
 const tr=[['ultra',3+rnd(2)],['pad',2+rnd(3)],['poffin',2+rnd(3)],['lillie',3+rnd(2)],['boss',2],['stretcher',1+rnd(2)],['iris',rnd(3)],['hilda',rnd(3)],['balloon',rnd(3)],['helmet',rnd(3)],['eretrieval',rnd(2)]];
 tr.forEach(([k,q])=>q&&add(k,q));if(Math.random()<.6)add(['prime','redcard'][rnd(2)],1);add('prism',rnd(2));
 let n=countDeck(L);if(n>50){for(const k of Object.keys(L).reverse()){if(n<=50)break;if(CARDS[k].k==='item'||CARDS[k].k==='tool'){const r=Math.min(L[k],n-50);L[k]-=r;n-=r}}}
 L.denergy=60-countDeck(L);return L}

function concede(sd){if(!G||G.over)return;log(`🏳️ ${who(sd)} menyerah`);G.why='menyerah';endGame(opp(sd))}

function pendingActions(sd){const S=G[sd],L=[];
 if(!S.en&&S.hand.some(isEn)&&inPlay(S).length)L.push('Pasang Energi dari tangan (belum dipasang giliran ini)');
 if(!S.sup&&S.hand.some(c=>c.k==='supporter'&&!whyTrainer(sd,c)))L.push('Supporter di tangan belum dimainkan');
 if(!S.stad&&S.hand.some(c=>c.k==='stadium'&&!whyTrainer(sd,c)))L.push('Stadium di tangan belum dimainkan');
 for(const m of inPlay(S))if(m.card.ab&&!m.card.ab.passive&&!m.card.ab.setup&&!abWhy(sd,m))L.push(`Ability ${m.card.ab.n} (${cname(m.card)}) belum dipakai`);
 if(S.active&&S.active.card.atk.some((_,k)=>!whyAttack(sd,k)))L.push('Pokémon Active bisa menyerang, tetapi belum menyerang');
 return L}
