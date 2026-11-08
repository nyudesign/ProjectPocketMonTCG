/* ===== EFEK UMUM KARTU H/I/J =====
   Tiap serangan/Trainer hasil tools/gen-cards.py membawa daftar langkah `g` (dibaca dari teks resmi Indonesia).
   Serangan: langkah "pra" mengubah damage/sasaran sebelum kena (koin, kelipatan, pilih sasaran), langkah lain dijalankan sesudah damage.
   Efek "giliran berikutnya" disimpan di m.x dan hilang saat Pokémon pindah ke Cadangan atau berevolusi (aturan resmi). */
const GPRE=new Set(['notFirst2','flipMul','flipAddPer','flipUntilMul','flipUntilAdd','flipAdd','flip2Add','flipFail','addPer','mul','addIf','snipe','gustFirst','discToolOpp','ignoreEff','ignoreRes','failIfNot','flipMulEn','optBoost']);
const mx=m=>m.x||(m.x={});
const ctrs=m=>m?m.dmg/10:0;
/* hitungan untuk addPer/mul */
function gCount(of,sd,a,s){const S=G[sd],E=G[opp(sd)],d=E.active;
 return of==='selfEn'?a.en.length:of==='oppEn'?(d?d.en.length:0):of==='selfCtr'?ctrs(a):of==='oppCtr'?ctrs(d):of==='myBench'?S.bench.length:of==='oppBench'?E.bench.length:of==='allBench'?S.bench.length+E.bench.length:
  of==='myInPlay'?inPlay(S).length:of==='myEnAll'?inPlay(S).reduce((n,m)=>n+m.en.length,0):of==='myTools'?inPlay(S).filter(m=>m.tool).length:of==='myHand'?S.hand.length:of==='oppHand'?E.hand.length:
  of==='oppTaken'?G.prizeN-E.prizes.length:of==='selfEnT'?a.en.filter(e=>e.t===s.t||e.k==='senergy').length:of==='oppEnAll'?inPlay(E).reduce((n,m)=>n+m.en.length,0):of==='myTaken'?G.prizeN-S.prizes.length:
  of==='oppConds'?(d?conds(d).length:0):of==='oppRetreat'?(d?rcost(d):0):of==='bothActEn'?a.en.length+(d?d.en.length:0):of==='myDiscEn'?S.discard.filter(isEn).length:0}
function gCond(c,sd,a,s={},at){const S=G[sd],E=G[opp(sd)],d=E.active;
 return c==='oppEx'?!!(d&&rule(d.card)):c==='oppDmg'?!!(d&&d.dmg>0):c==='selfDmg'?a.dmg>0:c==='benchDmg'?S.bench.some(m=>m.dmg>0):c==='koLast'?!!S.koFlag:c==='oppCond'?!!(d&&conds(d).length):c==='oppPoison'?!!(d&&d.poison):
  c==='oppBasic'?!!(d&&d.card.stage===0):c==='oppEvo'?!!(d&&d.card.stage>0):c==='stadium'?!!G.stadium:c==='oppHas'?!!(d&&conds(d).includes(s.c)):c==='movedIn'?a.inTn===S.tn:
  c==='extraEn'?a.en.length>=(at?at.cost.length:0)+s.k:c==='selfTool'?!!a.tool:c==='selfEnT'?a.en.some(e=>e.t===s.t):c==='benchType'?S.bench.some(m=>m.card.type===s.t):c==='oppPrizeLE'?E.prizes.length<=s.k:
  c==='behind'?S.prizes.length>E.prizes.length:c==='oppHandLE'?E.hand.length<=s.k:c==='oppStage'?!!(d&&d.card.stage===s.k):false}
async function flipsUntil(sd,why,tx){const rs=[];while(rs.length<40&&Math.random()<.5)rs.push(true);rs.push(false);await fx('flips',sd,rs,why,tx);log(`🪙 ${why}: ${rs.filter(Boolean).length} sisi depan sebelum sisi belakang`);return rs.filter(Boolean).length}
/* pra: X={base,tgt,fail,ign} */
async function genPre(sd,a,at,X){const o=opp(sd),E=G[o];
 for(const s of at.g){if(!GPRE.has(s.op))continue;
  switch(s.op){
   case'flipFail':if(!await flip(sd,at.n,at.tx)){X.fail=1;return}break;
   case'flipMul':X.base=s.per*(await flips(sd,s.n,at.n,at.tx)).filter(Boolean).length;break;
   case'flipAddPer':X.base+=s.per*(await flips(sd,s.n,at.n,at.tx)).filter(Boolean).length;break;
   case'flipUntilMul':X.base=s.per*await flipsUntil(sd,at.n,at.tx);break;
   case'flipUntilAdd':X.base+=s.per*await flipsUntil(sd,at.n,at.tx);break;
   case'flipAdd':if(await flip(sd,at.n,at.tx))X.base+=s.add;break;
   case'flip2Add':if((await flips(sd,2,at.n,at.tx)).every(Boolean))X.base+=s.add;break;
   case'addPer':X.base+=s.per*gCount(s.of,sd,a,s);break;
   case'mul':X.base=s.per*gCount(s.of,sd,a,s);break;
   case'addIf':if(gCond(s.if,sd,a,s,at))X.base+=s.add;break;
   case'failIfNot':if(!gCond('oppHas',sd,a,s)){X.fail=1;return}break;
   case'flipMulEn':X.base=a.en.length?s.per*(await flips(sd,a.en.length,at.n,at.tx)).filter(Boolean).length:0;break;
   case'optBoost':{const d=E.active,kill=d&&hp(d)>X.base&&hp(d)<=X.base+s.add,ok=sd==='p'?await ask(sd,'confirm',{title:`Tambah ${s.add} kerusakan?`,tx:`${cname(a.card)} juga menerima ${s.self} kerusakan.`,card:a.card}):kill&&hp(a)>s.self;if(ok){X.base+=s.add;X.optSelf=s.self}break}
   case'ignoreEff':X.ign.eff=1;break;
   case'ignoreRes':X.ign.res=1;if(s.weak)X.ign.weak=1;break;
   case'discToolOpp':if(E.active&&E.active.tool){E.discard.push(E.active.tool);log(`${cname(E.active.tool)} dibuang dari ${cname(E.active.card)}`);E.active.tool=null;fx('sync')}break;
   case'gustFirst':if(E.bench.length){const t=await ask(sd,'mon',{title:'Tarik 1 Pokémon Cadangan lawan',mons:E.bench,ctx:'gust',sd:o,pref:x=>(100-hp(x)/10)+(x.card.prize||1)*20});swapActive(o,t);log(`${cname(t.card)} ditarik ke Arena Bertarung lawan`)}X.tgt=E.active;break;
   case'snipe':{const ms=s.bench?E.bench:inPlay(E);X.base=s.n;X.tgt=ms.length?await ask(sd,'mon',{title:`Pilih Pokémon lawan yang terkena ${s.n} kerusakan`,mons:ms,ctx:'target',sd:o,pref:x=>hp(x)<=s.n?1000+(x.card.prize||1)*10:-hp(x)}):null;break}}}
 X.base=Math.max(0,X.base)}
function ownerOf(m){return inPlay(G.p).includes(m)?'p':'o'}
/* efek ke Pokémon lawan dicegah bila Pokémon itu terlindung "kerusakan dan efek" pada giliran ini */
const effBlocked=m=>!!(m&&m.x&&m.x.shield&&m.x.shield.all&&G[G.cur].tn===m.x.shield.tn&&ownerOf(m)!==G.cur);
async function chooseEn(sd,mon,n,title,card){if(!mon.en.length)return[];if(mon.en.length<=n)return[...mon.en];
 return await ask(sd,'cards',{title,cards:mon.en,min:n,max:n,card,pref:e=>e.k==='senergy'?0:1,cost:true})||mon.en.slice(0,n)}
async function genStep(sd,a,at,X,s){const S=G[sd],o=opp(sd),E=G[o],d=X.tgt&&X.tgt===E.active?X.tgt:E.active;
 switch(s.op){
  case'self':await fx('settle');a.dmg+=s.n;fx('hit',a.id,s.n);log(`${cname(a.card)} juga menerima ${s.n} kerusakan`);break;
  case'status':if(d&&hp(d)>0&&!effBlocked(d))for(const k of s.s){if(k==='poison')d.poison=s.pn?s.pn:1;else if(k==='burn')d.burn=1;else setSp(d,o,k);if(k==='poison'||k==='burn')log(`${cname(d.card)} menjadi ${CONDN[k]}`)}fx('sync');break;
  case'flipIf':if(await flip(sd,at.n,at.tx)===!s.tails)for(const t of s.then)await genStep(sd,a,at,X,t);break;
  case'discEnSelf':{const es=s.all?[...a.en]:s.t?await chooseEn(sd,{en:a.en.filter(e=>e.t===s.t)},s.n,`Pilih ${s.n} Energi ${cname(a.card)} untuk dibuang`,a.card):await chooseEn(sd,a,s.n,`Pilih ${s.n} Energi ${cname(a.card)} untuk dibuang`,a.card);es.forEach(e=>{a.en.splice(a.en.indexOf(e),1);S.discard.push(e)});if(es.length)log(`${who(sd)} membuang ${es.length} Energi dari ${cname(a.card)}`);fx('sync');break}
  case'retEnHand':{const es=await chooseEn(sd,a,s.n,`Pilih ${s.n} Energi yang kembali ke tangan`,a.card);es.forEach(e=>{a.en.splice(a.en.indexOf(e),1);S.hand.push(e)});fx('sync');break}
  case'moveEnBench':{if(!S.bench.length||!a.en.length)break;const es=await chooseEn(sd,a,s.n,`Pilih ${s.n} Energi untuk dipindah ke Cadangan`,a.card);
   const t=await ask(sd,'mon',{title:'Pilih Pokémon Cadangan penerima Energi',mons:S.bench,ctx:'target',sd,pref:x=>x.card.hp-x.en.length*30});es.forEach(e=>{a.en.splice(a.en.indexOf(e),1);t.en.push(e)});fx('sync');log(`${who(sd)} memindahkan ${es.length} Energi ke ${cname(t.card)}`);break}
  case'draw':{const n=await drawShow(sd,s.n);log(`${who(sd)} mengambil ${n} kartu`);break}
  case'drawUntil':{const n=await drawShow(sd,Math.max(0,s.n-S.hand.length));log(`${who(sd)} mengambil ${n} kartu`);break}
  case'noAtkNext':mx(a).noAtk=S.tn+1;break;
  case'noAtkNamed':mx(a).noAtkN={n:s.name,tn:S.tn+1};break;
  case'healSelf':heal(sd,a,s.n);break;
  case'healDealt':heal(sd,a,X.dealt||0);break;
  case'healAll':inPlay(S).forEach(m=>heal(sd,m,s.n));break;
  case'healOne':{const ms=inPlay(S).filter(m=>m.dmg>0);if(!ms.length)break;const t=await ask(sd,'mon',{title:`Pilih Pokémon-mu yang dipulihkan ${s.n} HP`,mons:ms,ctx:'target',sd,pref:m=>Math.min(s.n,m.dmg)});heal(sd,t,s.n);break}
  case'noRetDef':if(d&&!effBlocked(d))mx(d).noRet=E.tn+1;break;
  case'noAtkDef':if(d&&!effBlocked(d))mx(d).noAtk=E.tn+1;break;
  case'weakNext':if(d&&!effBlocked(d))mx(d).weak={n:s.n,tn:E.tn+1};break;
  case'redNext':mx(a).red={n:s.n,tn:E.tn+1};break;
  case'shield':mx(a).shield={tn:E.tn+1,all:!!s.all};log(`${cname(a.card)} terlindung di giliran lawan berikutnya`);break;
  case'benchDmg':for(let i=0;i<s.k&&E.bench.length;i++){const t=await ask(sd,'mon',{title:`Pilih Pokémon Cadangan lawan yang terkena ${s.n} kerusakan`,mons:E.bench,ctx:'target',sd:o,pref:x=>hp(x)<=s.n?1000+(x.card.prize||1)*10:-hp(x)});await hitMon(a,t,o,s.n)}break;
  case'benchDmgAll':for(const t of[...E.bench])await hitMon(a,t,o,s.n);break;
  case'benchSelfAll':for(const t of[...S.bench])await hitMon(a,t,sd,s.n);break;
  case'placeCtrBench':case'placeCtrAny':{const ts=s.op==='placeCtrBench'?E.bench:inPlay(E);if(ts.length)await ask(sd,'placeDmg',{tgts:ts,n:s.n,card:a.card,from:a,apply:(_,t,n)=>{t.dmg+=10*n;fx('hit',t.id,10*n,null,1);log(`${cname(t.card)} menerima ${n} Token Kerusakan`)}});break}
  case'mill':{const T=s.self?S:E,k=Math.min(s.n,T.deck.length);const cs=T.deck.splice(T.deck.length-k,k);T.discard.push(...cs);fx('sync');log(`${who(s.self?sd:o)} membuang ${k} kartu teratas Deck ke Trash`);break}
  case'switchSelf':if(S.bench.length&&S.active===a){if(s.may&&!await ask(sd,'confirm',{title:'Tukar dengan Pokémon Cadangan?',tx:at.tx,card:a.card}))break;const m=await ask(sd,'mon',{title:'Majukan 1 Pokémon Cadangan-mu',mons:S.bench,ctx:'promote',sd});swapActive(sd,m);log(`${who(sd)} menukar ${cname(a.card)} dengan ${cname(m.card)}`)}break;
  case'callBasic':{const r=await pickDeck(sd,a.card,{title:`Pilih s/d ${s.n} Pokémon Basic untuk Cadangan`,pred:isBasic,max:Math.min(s.n,bmax(sd)-S.bench.length),pref:x=>x.hp});r.forEach(x=>S.bench.push(mkMon(x,sd)));log(`${who(sd)} menaruh ${r.length} Pokémon ke Cadangan`);await shuffleDeck(sd);break}
  case'search':await genSearch(sd,a.card,s);break;
  case'discEnOpp':if(d&&d.en.length&&!effBlocked(d)&&(!s.special||d.en.some(e=>e.k==='senergy'))){const es=await chooseEn(sd,s.special?{en:d.en.filter(e=>e.k==='senergy')}:d,s.n,`Pilih ${s.n} Energi ${cname(d.card)} untuk dibuang`,a.card);es.forEach(e=>{d.en.splice(d.en.indexOf(e),1);E.discard.push(e)});log(`${who(sd)} membuang ${es.length} Energi dari ${cname(d.card)}`);fx('sync')}break;
  case'discHandRand':{const k=Math.min(s.n,E.hand.length),cs=shuf([...E.hand]).slice(0,k);cs.forEach(c=>{E.hand.splice(E.hand.indexOf(c),1);E.discard.push(c)});fx('sync');if(k)log(`${who(o)} membuang ${cs.map(cname).join(', ')} dari tangan`);break}
  case'lookHand':if(sd==='p')await fx('lookHand',[...E.hand]);break;
  case'oppSwitch':if(E.bench.length&&E.active){const m=await ask(o,'mon',{title:'Lawan menukar Pokémon Bertarung-mu. Pilih pengganti dari Cadangan',mons:E.bench,ctx:'promote',sd:o});swapActive(o,m);log(`${who(o)} memajukan ${cname(m.card)}`)}break;
  case'gustAfter':if(E.bench.length&&E.active){const t=await ask(sd,'mon',{title:'Tarik 1 Pokémon Cadangan lawan',mons:E.bench,ctx:'gust',sd:o,pref:x=>(100-hp(x)/10)+(x.card.prize||1)*20});swapActive(o,t);log(`${cname(t.card)} ditarik ke Arena Bertarung lawan`)}break;
  case'selfStatus':if(s.s==='poison')a.poison=1;else if(s.s==='burn')a.burn=1;else setSp(a,sd,s.s);fx('sync');break;
  case'discStadium':if(G.stadium){if(s.may&&!await ask(sd,'confirm',{title:'Buang Stadium?',tx:`${cname(G.stadium.card)} dibuang ke Trash.`,card:G.stadium.card}))break;const st=G.stadium;G[st.owner].discard.push(st.card);G.stadium=null;log(`${cname(st.card)} dibuang ke Trash`);fx('sync');await enforceBoth(st.owner)}break;
  case'lookTopBench':{const top=S.deck.slice(-s.n).reverse(),pool=top.filter(isBasic),r=pool.length&&S.bench.length<bmax(sd)?await ask(sd,'cards',{title:`Pilih Pokémon Basic dari ${s.n} kartu teratas untuk Cadangan`,cards:top,pick:isBasic,max:Math.min(pool.length,bmax(sd)-S.bench.length),card:a.card,pref:x=>x.hp,from:'deck'}):[];
   r.forEach(x=>{S.deck.splice(S.deck.indexOf(x),1);S.bench.push(mkMon(x,sd))});log(`${who(sd)} menaruh ${r.length} Pokémon ke Cadangan`);await shuffleDeck(sd);break}
  case'handToDeck':{const k=Math.min(s.n,E.hand.length),cs=shuf([...E.hand]).slice(0,k);if(sd==='p')await fx('lookHand',cs);cs.forEach(c=>{E.hand.splice(E.hand.indexOf(c),1);E.deck.push(c)});shuf(E.deck);fx('sync');if(k)log(`${k} kartu dari tangan ${who(o)} dikocok ke Deck`);break}
  case'accelDeck':{const ts=s.to==='bench'?S.bench:inPlay(S);if(!ts.length)break;const r=await pickDeck(sd,a.card,{title:`Ambil s/d ${s.n} Energi Dasar dari Deck`,pred:x=>x.k==='energy',max:s.n,pref:()=>1});
   if(r.length)await ask(sd,'attachEnergies',{energies:r,targets:ts,card:a.card,apply:(en,t)=>{t.en.push(en);fx('sync');fx('energy',t,en)}});for(const en of r)if(!inPlay(S).some(m=>m.en.includes(en)))ts[0].en.push(en);if(r.length)log(`${who(sd)} memasang ${r.length} Energi`);await shuffleDeck(sd);break}
  case'accelDisc':{if(!S.bench.length)break;const pool=S.discard.filter(x=>x.k==='energy').slice(0,s.n);if(!pool.length)break;const t=await ask(sd,'mon',{title:`Pilih Pokémon Cadangan yang menerima ${pool.length} Energi dari Trash`,mons:S.bench,ctx:'target',sd,pref:x=>x.card.hp});
   pool.forEach(e=>{S.discard.splice(S.discard.indexOf(e),1);t.en.push(e);fx('energy',t,e)});fx('sync');log(`${who(sd)} memasang ${pool.length} Energi dari Trash ke ${cname(t.card)}`);break}
  case'itemLock':G[o].noItem=E.tn+1;log(`${who(o)} tidak bisa memainkan Item di giliran berikutnya`);break;
  case'shuffleDraw':{S.deck.push(...S.hand.splice(0));fx('sync');await shuffleDeck(sd);const n=await drawShow(sd,s.n);log(`${who(sd)} mengocok tangan ke Deck dan mengambil ${n} kartu`);break}
  case'attachHandSelf':{const pool=S.hand.filter(x=>x.k==='energy');if(!pool.length)break;const r=await ask(sd,'cards',{title:`Pasang s/d ${s.n} Energi Dasar dari tangan ke ${cname(a.card)}`,cards:pool,max:s.n,card:a.card,pref:()=>1});
   r.forEach(e=>{S.hand.splice(S.hand.indexOf(e),1);a.en.push(e);fx('energy',a,e)});fx('sync');break}
  case'boostNext':mx(a).boost={n:s.n,tn:S.tn+1};break;
  case'benchSelfOne':if(S.bench.length){const t=await ask(sd,'mon',{title:`Pilih Pokémon Cadangan-mu yang terkena ${s.n} kerusakan`,mons:S.bench,ctx:'target',sd,pref:x=>hp(x)});await hitMon(a,t,sd,s.n)}break;
  case'ctrOne':for(let i=0;i<s.k;i++){const ts=inPlay(E);if(!ts.length)break;const t=await ask(sd,'mon',{title:`Pilih Pokémon lawan yang menerima ${s.n} Token Kerusakan`,mons:ts,ctx:'target',sd:o,pref:x=>hp(x)<=10*s.n?1000+(x.card.prize||1)*10:-hp(x)});t.dmg+=10*s.n;fx('hit',t.id,10*s.n,null,1);log(`${cname(t.card)} menerima ${s.n} Token Kerusakan`)}break;
  case'ctrUntil':if(d&&hp(d)>s.n){const k=hp(d)-s.n;d.dmg+=k;fx('hit',d.id,k,null,1);log(`${cname(d.card)} menerima ${k/10} Token Kerusakan`)}break;
  case'flipDiscEnOpp':{const h=(await flips(sd,s.n,at.n,at.tx)).filter(Boolean).length;if(h&&d&&d.en.length&&!effBlocked(d)){const es=await chooseEn(sd,d,Math.min(h,d.en.length),`Pilih ${h} Energi ${cname(d.card)} untuk dibuang`,a.card);es.forEach(e=>{d.en.splice(d.en.indexOf(e),1);E.discard.push(e)});fx('sync');log(`${who(sd)} membuang ${es.length} Energi dari ${cname(d.card)}`)}break}
  case'multiHit':{const left=[...inPlay(E)];for(let i=0;i<s.k&&left.length;i++){const t=await ask(sd,'mon',{title:`Pilih Pokémon lawan yang terkena ${s.n} kerusakan (${i+1}/${s.k})`,mons:left,ctx:'target',sd:o,pref:x=>hp(x)<=s.n?1000+(x.card.prize||1)*10:-hp(x)});left.splice(left.indexOf(t),1);await hitMon(a,t,o,s.n)}break}
  case'oppDiscard':{const k=Math.min(s.n,E.hand.length);if(!k)break;const r=await ask(o,'cards',{title:`Efek ${at.n}: buang ${k} kartu dari tanganmu`,cards:E.hand,min:k,max:k,card:a.card,cost:true,pref:x=>isEn(x)?3:isMon(x)?1:2});r.forEach(c=>{E.hand.splice(E.hand.indexOf(c),1);E.discard.push(c)});fx('sync');log(`${who(o)} membuang ${r.map(cname).join(', ')}`);break}
  case'recover':{const pool=S.discard.filter(SRCP[s.what]);if(!pool.length)break;const r=await ask(sd,'cards',{title:`Ambil s/d ${s.n} ${SRCN[s.what]} dari Trash`,cards:pool,all:S.discard,max:s.n,card:a.card,pref:x=>isMon(x)?x.hp/100:1,from:'discard'});r.forEach(x=>S.discard.splice(S.discard.indexOf(x),1));await toHand(sd,a.card,r);break}
  case'discHandPick':{if(!E.hand.length)break;if(sd==='p')await fx('lookHand',[...E.hand]);const r=await ask(sd,'cards',{title:`Pilih ${s.n} kartu dari tangan lawan untuk dibuang`,cards:E.hand,min:Math.min(s.n,E.hand.length),max:s.n,card:a.card,cost:true,pref:x=>x.k==='supporter'?3:isEn(x)?2:1});r.forEach(c=>{E.hand.splice(E.hand.indexOf(c),1);E.discard.push(c)});fx('sync');log(`${who(o)} membuang ${r.map(cname).join(', ')}`);break}}}
async function genPost(sd,a,at,X){for(const s of at.g)if(!GPRE.has(s.op))await genStep(sd,a,at,X,s);if(X.optSelf){await fx('settle');a.dmg+=X.optSelf;fx('hit',a.id,X.optSelf);log(`${cname(a.card)} juga menerima ${X.optSelf} kerusakan`)}}
/* cari kartu dari Deck ke tangan (diperlihatkan) */
const SRCP={mon:isMon,basic:isBasic,benergy:x=>x.k==='energy',energy:isEn,item:x=>x.k==='item',supporter:x=>x.k==='supporter',tool:x=>x.k==='tool',stadium:x=>x.k==='stadium',trainer:isTrainer,evo:x=>isMon(x)&&x.stage>0};
const SRCN={mon:'Pokémon',basic:'Pokémon Basic',benergy:'Energi Dasar',energy:'Energi',item:'Item',supporter:'Supporter',tool:'Pokémon Tool',stadium:'Stadium',trainer:'Trainer',evo:'Pokémon Evolusi'};
async function genSearch(sd,card,s){const r=await pickDeck(sd,card,{title:`Pilih s/d ${s.n} ${SRCN[s.what]} untuk tangan`,pred:SRCP[s.what],max:s.n,pref:s.what==='mon'||s.what==='basic'||s.what==='evo'?wantPoke(sd):()=>1});await toHand(sd,card,r);log(`${who(sd)} mengambil ${r.length} kartu dari Deck`);await shuffleDeck(sd)}
/* perkiraan damage untuk Bot (koin = nilai harapan) */
function genDmg(a,at,sd){let b=at.dmg;for(const s of at.g||[]){
 if(s.op==='flipMul')b=s.per*s.n/2;else if(s.op==='flipAddPer')b+=s.per*s.n/2;else if(s.op==='flipUntilMul')b=s.per;else if(s.op==='flipUntilAdd')b+=s.per;else if(s.op==='flipAdd')b+=s.add/2;else if(s.op==='flip2Add')b+=s.add/4;
 else if(s.op==='flipFail')b/=2;else if(s.op==='addPer')b+=s.per*gCount(s.of,sd,a,s);else if(s.op==='mul')b=s.per*gCount(s.of,sd,a,s);else if(s.op==='addIf'&&gCond(s.if,sd,a))b+=s.add;else if(s.op==='snipe')b=s.n}
 return b}
/* ---------- Trainer umum ---------- */
function genWhy(sd,c){const S=G[sd],E=G[opp(sd)];for(const s of c.g){
 if(s.op==='costDiscard'&&S.hand.filter(x=>x!==c).length<s.n)return`Butuh ${s.n} kartu lain di tangan untuk dibuang`;
 if(s.op==='switch'&&!S.bench.length)return'Cadangan kosong';
 if(s.op==='gust'&&!E.bench.length)return'Lawan tidak punya Pokémon Cadangan';
 if((s.op==='draw'||s.op==='search'||s.op==='shuffleDraw'||s.op==='discardDraw')&&!S.deck.length)return'Deck kosong';
 if(s.op==='callBasic'&&S.bench.length>=bmax(sd))return'Cadangan penuh';
 if(s.op==='healOne'&&!inPlay(S).some(m=>m.dmg>0))return'Tidak ada Pokémon-mu yang terkena kerusakan';
 if(s.op==='healActive'&&!(S.active&&S.active.dmg>0))return'Pokémon Bertarung tidak terkena kerusakan';
 if(s.op==='recover'&&!S.discard.some(SRCP[s.what]))return`Tidak ada ${SRCN[s.what]} di Trash`;
 if(s.op==='recoverDeck'&&!S.discard.some(x=>x.k==='energy'))return'Tidak ada Energi Dasar di Trash';
 if(s.op==='moveEnOwn'&&!(inPlay(S).length>1&&inPlay(S).some(m=>m.en.some(e=>e.k==='energy'))))return'Tidak ada Energi Dasar yang bisa dipindah';
 if(s.op==='healCure'&&!inPlay(S).some(m=>m.dmg>0||conds(m).length))return'Tidak ada Pokémon-mu yang perlu dipulihkan'}
 return''}
async function genTrainer(sd,c,list){const S=G[sd],E=G[opp(sd)],o=opp(sd);
 for(const s of list||c.g){switch(s.op){
  case'flipIf':if(await flip(sd,cname(c),c.tx)){const r=await genTrainer(sd,c,s.then);if(r==='cancel')return}break;
  case'bothShuffleDraw':for(const x of[sd,o]){const T=G[x];T.deck.push(...T.hand.splice(0));fx('sync');await shuffleDeck(x)}for(const x of[sd,o]){const n=await drawShow(x,s.n);log(`${who(x)} mengambil ${n} kartu`)}break;
  case'discEnOppAny':{const ms=inPlay(E).filter(m=>m.en.length);if(!ms.length)break;const t=await ask(sd,'mon',{title:'Pilih Pokémon lawan yang Energinya dibuang',mons:ms,ctx:'target',sd:o,pref:m=>m.en.length+(m===E.active?2:0)});
   const es=await chooseEn(sd,t,1,`Pilih 1 Energi ${cname(t.card)} untuk dibuang`,c);es.forEach(e=>{t.en.splice(t.en.indexOf(e),1);E.discard.push(e)});fx('sync');log(`${who(sd)} membuang Energi dari ${cname(t.card)}`);break}
  case'moveEnOwn':{const src=await ask(sd,'mon',{title:'Pilih Pokémon-mu yang Energi Dasarnya dipindah',mons:inPlay(S).filter(m=>m.en.some(e=>e.k==='energy')),ctx:'target',sd,cancel:true,pref:m=>m===S.active?-1:m.en.length});if(!src)return'cancel';
   const es=await chooseEn(sd,{en:src.en.filter(e=>e.k==='energy')},1,'Pilih 1 Energi Dasar',c),dst=await ask(sd,'mon',{title:'Pilih Pokémon penerima Energi',mons:inPlay(S).filter(m=>m!==src),ctx:'target',sd,pref:m=>m===S.active?3:1});
   es.forEach(e=>{src.en.splice(src.en.indexOf(e),1);dst.en.push(e);fx('energy',dst,e)});fx('sync');log(`${who(sd)} memindahkan Energi ke ${cname(dst.card)}`);break}
  case'recoverDeck':{const pool=S.discard.filter(x=>x.k==='energy'),r=await ask(sd,'cards',{title:`Kocok s/d ${s.n} Energi Dasar dari Trash ke Deck`,cards:pool,all:S.discard,max:s.n,card:c,pref:()=>1,from:'discard'});r.forEach(x=>{S.discard.splice(S.discard.indexOf(x),1);S.deck.push(x)});await shuffleDeck(sd);log(`${who(sd)} mengocok ${r.length} Energi ke Deck`);break}
  case'healCure':{const t=await ask(sd,'mon',{title:`Pilih Pokémon-mu yang dipulihkan ${s.n} HP dan Kondisi Khususnya`,mons:inPlay(S).filter(m=>m.dmg>0||conds(m).length),ctx:'target',sd,cancel:true,pref:m=>Math.min(s.n,m.dmg)+conds(m).length*20});if(!t)return'cancel';heal(sd,t,s.n);for(const k of conds(t))cureOne(t,k);break}
  case'costDiscard':{const d=await ask(sd,'cards',{title:`Buang ${s.n} kartu lain dari tangan`,cards:S.hand.filter(x=>x!==c),min:s.n,max:s.n,card:c,cost:true,pref:x=>isEn(x)?3:isMon(x)?(x.stage>0?1:2):2});if(!d||d.length<s.n)return'cancel';d.forEach(x=>{S.hand.splice(S.hand.indexOf(x),1);S.discard.push(x)});fx('sync');break}
  case'draw':{const n=await drawShow(sd,s.n);log(`${who(sd)} mengambil ${n} kartu`);break}
  case'shuffleDraw':{S.deck.push(...S.hand.splice(0));fx('sync');await shuffleDeck(sd);const n=await drawShow(sd,s.n);log(`${who(sd)} mengocok tangan ke Deck dan mengambil ${n} kartu`);break}
  case'discardDraw':{S.discard.push(...S.hand.splice(0));fx('sync');const n=await drawShow(sd,s.n);log(`${who(sd)} membuang tangan dan mengambil ${n} kartu`);break}
  case'switch':{const m=await ask(sd,'mon',{title:'Majukan 1 Pokémon Cadangan-mu',mons:S.bench,ctx:'promote',sd,cancel:true,pref:x=>x.card.atk.some(t=>afford(x,t.cost))?100+hp(x):hp(x)});if(!m)return'cancel';swapActive(sd,m);log(`${who(sd)} menukar Pokémon Bertarung dengan ${cname(m.card)}`);break}
  case'gust':{const t=await ask(sd,'mon',{title:'Tarik 1 Pokémon Cadangan lawan',mons:E.bench,ctx:'gust',sd:o,cancel:true,pref:x=>(100-hp(x)/10)+(x.card.prize||1)*20});if(!t)return'cancel';swapActive(o,t);log(`${cname(t.card)} ditarik ke Arena Bertarung lawan`);break}
  case'search':await genSearch(sd,c,s);break;
  case'callBasic':{const r=await pickDeck(sd,c,{title:`Pilih s/d ${s.n} Pokémon Basic untuk Cadangan`,pred:isBasic,max:Math.min(s.n,bmax(sd)-S.bench.length),pref:x=>x.hp});r.forEach(x=>S.bench.push(mkMon(x,sd)));log(`${who(sd)} menaruh ${r.length} Pokémon ke Cadangan`);await shuffleDeck(sd);break}
  case'healOne':{const t=await ask(sd,'mon',{title:`Pilih Pokémon-mu yang dipulihkan ${s.n} HP`,mons:inPlay(S).filter(m=>m.dmg>0),ctx:'target',sd,cancel:true,pref:m=>Math.min(s.n,m.dmg)+(m===S.active?15:0)});if(!t)return'cancel';heal(sd,t,s.n);break}
  case'healActive':heal(sd,S.active,s.n);break;
  case'recover':{const pool=S.discard.filter(SRCP[s.what]),r=await ask(sd,'cards',{title:`Ambil s/d ${s.n} ${SRCN[s.what]} dari Trash`,cards:pool,all:S.discard,max:s.n,card:c,pref:()=>1,from:'discard'});r.forEach(x=>S.discard.splice(S.discard.indexOf(x),1));await toHand(sd,c,r);break}}}}
/* Ability umum yang dipakai (1x/giliran) atau saat berevolusi dari tangan (evo=1): langkahnya sama dengan Trainer umum */
AB.gen={why:(sd,m,evo)=>{const S=G[sd],g=m.card.ab.g||[];if(!evo&&m.used.gen)return'Sudah dipakai giliran ini';
 for(const s of g){if(s.op==='draw'&&!S.deck.length)return'Deck kosong';if(s.op==='healOne'&&!inPlay(S).some(x=>x.dmg>0))return'Tidak ada Pokémon-mu yang terkena kerusakan';if(s.op==='costDiscard'&&S.hand.length<s.n)return`Butuh ${s.n} kartu di tangan untuk dibuang`;if(s.op==='gust'&&!G[opp(sd)].bench.length)return'Lawan tidak punya Pokémon Cadangan'}return''},
 async run(sd,m){const r=await genTrainer(sd,m.card,m.card.ab.g.filter(s=>s.op!=='once'&&s.op!=='onEvo'));if(r==='cancel')return'cancel';m.used.gen=1}};
/* Bot: Trainer umum dipakai bila masuk akal */
function genUseful(sd,c){const S=G[sd],E=G[opp(sd)],a=S.active;for(const s of c.g){
 if(s.op==='costDiscard'&&S.hand.length<s.n+3)return false;
 if((s.op==='draw'||s.op==='shuffleDraw')&&S.hand.length>5)return false;
 if(s.op==='discardDraw'&&S.hand.length>3)return false;
 if(s.op==='search'&&!S.deck.some(SRCP[s.what]))return false;
 if(s.op==='callBasic'&&S.bench.length>=Math.min(4,bmax(sd)))return false;
 if(s.op==='switch'&&!(a&&!a.card.atk.some((_,k)=>!whyAttack(sd,k))&&S.bench.some(m=>m.card.atk.some(t=>afford(m,t.cost)))))return false;
 if(s.op==='gust'&&!(a&&E.bench.some(t=>a.card.atk.some((x,k)=>!whyAttack(sd,k)&&dmgOf(a,k)>=hp(t)))))return false;
 if((s.op==='healOne'||s.op==='healActive'||s.op==='healCure')&&!inPlay(S).some(m=>m.dmg>=30||conds(m).length))return false;
 if(s.op==='bothShuffleDraw'&&S.hand.length>4)return false;
 if(s.op==='moveEnOwn'&&!(a&&!a.card.atk.some((_,k)=>!whyAttack(sd,k))))return false;
 if(s.op==='flipIf'&&!genUseful(sd,{g:s.then}))return false;
 if(s.op==='recover'&&S.hand.length>6)return false}
 return true}
/* ---------- deck acak dari seluruh pool yang didukung (Bot & tombol Deck acak) ----------
   1 keluarga evolusi utama (semua tahapnya didukung) + 1 pendamping, Trainer staple & umum, Energi Dasar sesuai biaya serangan; selalu dicek legal() */
let FAMS=null;
function genFams(){if(FAMS)return FAMS;const P=Object.keys(CARDS).filter(k=>CARDS[k].k==='pokemon'&&!CARDS[k].hide),by={};P.forEach(k=>(by[CARDS[k].n]=by[CARDS[k].n]||[]).push(k));
 FAMS=[];for(const k of P){const c=CARDS[k];if(c.stage===0&&!(c.prize>1||c.hp>=110))continue;const ch=[k];let cur=c,ok=1;
  while(cur.stage>0){const pre=by[cur.from];if(!pre){ok=0;break}const pk=pre.find(x=>CARDS[x].stage===cur.stage-1);if(!pk){ok=0;break}ch.unshift(pk);cur=CARDS[pk]}
  if(ok&&c.atk.some(a=>a.dmg>=60||a.g))FAMS.push(ch)}
 return FAMS}
function buildGenDeck(fmt='std'){const F=genFams();if(!F.length)return null;
 const EN={};for(const k of Object.keys(CARDS)){const c=CARDS[k];if(c.k==='energy'&&c.t&&!c.hide&&(!EN[c.t]||!/^h/.test(k)))EN[c.t]=k}
 const T=Object.keys(CARDS).filter(k=>{const c=CARDS[k];return isTrainer(c)&&!c.hide&&c.k!=='stadium'&&c.k!=='tool'&&!c.ace&&c.g});
 for(let tries=0;tries<25;tries++){const L={},q=(k,n)=>{if(!k||!CARDS[k])return;L[k]=Math.min(CARDS[k].k==='energy'?60:4,(L[k]||0)+n)};
  const main=F[rnd(F.length)],part=F[rnd(F.length)];
  main.forEach((k,i)=>q(k,main.length===1?3:[4,3,3][i]));if(part!==main)part.forEach((k,i)=>q(k,part.length===1?2:[3,2,2][i]));
  const st2=Object.keys(L).some(k=>CARDS[k].stage===2),small=Object.keys(L).some(k=>isBasic(CARDS[k])&&CARDS[k].hp<=70);
  q('ultra',4);q('boss',2);q('lillie',3);q('iris',2);q('stretcher',2);if(small)q('poffin',3);if(st2)q('candy',3);if(Math.random()<.6)q('prime',1);
  shuf([...T]).slice(0,4).forEach(k=>q(k,2));
  const need={};for(const k of Object.keys(L)){const c=CARDS[k];if(isMon(c))for(const a of c.atk)for(const t of a.cost)if(t!=='C'&&EN[t])need[t]=(need[t]||0)+1}
  const ts=Object.keys(need);if(!ts.length)ts.push(['G','R','W','L','P','F','D','M'].filter(t=>EN[t])[rnd(6)]||'D');
  const tot=ts.reduce((a,t)=>a+(need[t]||1),0),E=Math.max(0,60-countDeck(L));if(E<8)continue;let left=E;
  ts.sort((a,b)=>(need[b]||1)-(need[a]||1)).forEach((t,i)=>{const n=i===ts.length-1?left:Math.min(left,Math.max(3,Math.round(E*(need[t]||1)/tot)));q(EN[t],n);left-=n});
  if(countDeck(L)!==60||!legal(L,fmt).ok)continue;
  const top=[main,part].map(f=>CARDS[f[f.length-1]].ni).filter((v,i,a)=>a.indexOf(v)===i);return{L,name:top.join(' + ')}}
 return null}
