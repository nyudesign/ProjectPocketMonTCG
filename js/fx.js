/* ===== EFEK UMUM KARTU H/I/J =====
   Tiap serangan/Trainer hasil tools/gen-cards.py membawa daftar langkah `g` (dibaca dari teks resmi Indonesia).
   Serangan: langkah "pra" mengubah damage/sasaran sebelum kena (koin, kelipatan, pilih sasaran), langkah lain dijalankan sesudah damage.
   Efek "giliran berikutnya" disimpan di m.x dan hilang saat Pokémon pindah ke Cadangan atau berevolusi (aturan resmi). */
const GPRE=new Set(['flipN','flipUntilN','mulHeads','setBase','failUnless','addLastHit','millCount','atkFirstOk','onlyFirst2','notFirst2','flipMul','flipAddPer','flipUntilMul','flipUntilAdd','flipAdd','flip2Add','flipFail','addPer','mul','addIf','snipe','gustFirst','discToolOpp','ignoreEff','ignoreRes','failIfNot','flipMulEn','optBoost']);
const mx=m=>m.x||(m.x={});
/* lempar koin umum: X.fl = hasil lemparan; cabang ifFlip & jumlah "tiap lemparan sisi depan" membacanya */
const heads=X=>(X.fl||[]).filter(Boolean).length,flipOk=(X,s)=>{const n=(X.fl||[]).length,h=heads(X);return s.c==='h'||s.c==='all'?n>0&&h===n:s.c==='t'||s.c==='allT'?h===0:s.c==='any'?h>0:s.c==='ge'?h>=s.k:s.c==='eq'?h===s.k:false};
const ctrs=m=>m?m.dmg/10:0;
/* hitungan untuk addPer/mul */
function gCount(of,sd,a,s){const S=G[sd],E=G[opp(sd)],d=E.active;
 return of==='selfEn'?a.en.length:of==='oppEn'?(d?d.en.length:0):of==='selfCtr'?ctrs(a):of==='oppCtr'?ctrs(d):of==='myBench'?S.bench.length:of==='oppBench'?E.bench.length:of==='allBench'?S.bench.length+E.bench.length:
  of==='myInPlay'?inPlay(S).length:of==='myEnAll'?inPlay(S).reduce((n,m)=>n+m.en.length,0):of==='myTools'?inPlay(S).filter(m=>m.tool).length:of==='myHand'?S.hand.length:of==='oppHand'?E.hand.length:
  of==='oppTaken'?G.prizeN-E.prizes.length:of==='selfEnT'?a.en.filter(e=>e.t===s.t||e.k==='senergy').length:of==='oppEnAll'?inPlay(E).reduce((n,m)=>n+m.en.length,0):of==='myTaken'?G.prizeN-S.prizes.length:
  of==='oppConds'?(d?conds(d).length:0):of==='oppRetreat'?(d?rcost(d):0):of==='bothActEn'?a.en.length+(d?d.en.length:0):of==='myDiscEn'?S.discard.filter(isEn).length:
  of==='oppAllCtr'?inPlay(E).reduce((n,m)=>n+ctrs(m),0):of==='myEnAllT'?inPlay(S).reduce((n,m)=>n+m.en.filter(e=>e.t===s.t).length,0):of==='oppEnAllT'?inPlay(E).reduce((n,m)=>n+m.en.filter(e=>e.t===s.t).length,0):
  of==='myTypeMons'?inPlay(S).filter(m=>m.card.type===s.t).length:of==='myStage'?inPlay(S).filter(m=>m.card.stage===s.k).length:of==='myDmgMons'?inPlay(S).filter(m=>m.dmg>0).length:of==='selfSen'?a.en.filter(e=>e.k==='senergy').length:
  of==='myDisc'?S.discard.filter(gp(sd,s.p)).length:of==='atkNamed'?inPlay(S).filter(m=>m.card.atk.some(t=>t.n===s.name)).length:of==='benchNamed'?S.bench.filter(m=>m.card.n===s.name).length:0}
function gCond(c,sd,a,s={},at){const S=G[sd],E=G[opp(sd)],d=E.active;
 return c==='oppEx'?!!(d&&rule(d.card)):c==='oppDmg'?!!(d&&d.dmg>0):c==='selfDmg'?a.dmg>0:c==='benchDmg'?S.bench.some(m=>m.dmg>0):c==='koLast'?!!S.koFlag:c==='oppCond'?!!(d&&conds(d).length):c==='oppPoison'?!!(d&&d.poison):
  c==='oppBasic'?!!(d&&d.card.stage===0):c==='oppEvo'?!!(d&&d.card.stage>0):c==='stadium'?!!G.stadium:c==='oppHas'?!!(d&&conds(d).includes(s.c)):c==='movedIn'?a.inTn===S.tn:
  c==='extraEn'?a.en.length>=(at?at.cost.length:0)+s.k:c==='selfTool'?!!a.tool:c==='selfEnT'?a.en.some(e=>e.t===s.t):c==='benchType'?S.bench.some(m=>m.card.type===s.t):c==='oppPrizeLE'?E.prizes.length<=s.k:
  c==='behind'?S.prizes.length>E.prizes.length:c==='oppHandLE'?E.hand.length<=s.k:c==='oppStage'?!!(d&&d.card.stage===s.k):
  c==='oppActType'?!!(d&&d.card.type===s.t):c==='oppHasType'?inPlay(E).some(m=>m.card.type===s.t):c==='selfNoDmg'?a.dmg===0:c==='oppTool'?!!(d&&d.tool):c==='benchNamed'?S.bench.some(m=>m.card.n===s.name):
  c==='enEqual'?!!(d&&a.en.length===d.en.length):c==='myEnGE'?inPlay(S).reduce((n,m)=>n+m.en.length,0)>=s.k:c==='allBenchDmg'?S.bench.length>0&&S.bench.every(m=>m.dmg>0):
  c==='sameType'?inPlay(S).some(m=>inPlay(E).some(q=>q.card.type===m.card.type)):c==='healedNow'?a.healTn===S.tn:c==='handEq'?S.hand.length===s.k:c==='always'}
async function flipsUntil(sd,why,tx){const rs=[];while(rs.length<40&&Math.random()<.5)rs.push(true);rs.push(false);await fx('flips',sd,rs,why,tx);log(`🪙 ${why}: ${rs.filter(Boolean).length} sisi depan sebelum sisi belakang`);return rs.filter(Boolean).length}
/* pra: X={base,tgt,fail,ign} */
async function genPre(sd,a,at,X){const o=opp(sd),E=G[o],list=X.post=[...at.g];   // X.post: langkah sesudah damage (cabang koin yang lolos ikut disisipkan)
 for(let i=0;i<list.length;i++){const s=list[i];if(s.op==='ifFlip'){if(flipOk(X,s))list.splice(i+1,0,...s.then);continue}if(!GPRE.has(s.op))continue;
  switch(s.op){
   case'flipFail':X.fl=[await flip(sd,at.n,at.tx)];if(!X.fl[0]){X.fail=1;return}break;
   case'flipMul':X.fl=await flips(sd,s.n,at.n,at.tx);X.base=s.per*heads(X);break;   // semua lemparan dicatat di X.fl untuk cabang "Jika ..."
   case'flipAddPer':X.fl=await flips(sd,s.n,at.n,at.tx);X.base+=s.per*heads(X);break;
   case'flipUntilMul':X.fl=Array(await flipsUntil(sd,at.n,at.tx)).fill(true);X.base=s.per*heads(X);break;
   case'flipUntilAdd':X.fl=Array(await flipsUntil(sd,at.n,at.tx)).fill(true);X.base+=s.per*heads(X);break;
   case'flipAdd':X.fl=[await flip(sd,at.n,at.tx)];if(X.fl[0])X.base+=s.add;break;
   case'flip2Add':X.fl=await flips(sd,2,at.n,at.tx);if(heads(X)===2)X.base+=s.add;break;
   case'addPer':X.base+=s.per*gCount(s.of,sd,a,s);break;
   case'mul':X.base=s.per*gCount(s.of,sd,a,s);break;
   case'addIf':if(gCond(s.if,sd,a,s,at))X.base+=s.add;break;
   case'failIfNot':if(!gCond('oppHas',sd,a,s)){X.fail=1;return}break;
   case'flipMulEn':X.fl=a.en.length?await flips(sd,a.en.length,at.n,at.tx):[];X.base=s.per*heads(X);break;
   case'optBoost':{const d=E.active,kill=d&&hp(d)>X.base&&hp(d)<=X.base+s.add,ok=sd==='p'?await ask(sd,'confirm',{title:`Tambah ${s.add} kerusakan?`,tx:`${cname(a.card)} juga menerima ${s.self} kerusakan.`,card:a.card}):kill&&hp(a)>s.self;if(ok){X.base+=s.add;X.optSelf=s.self}break}
   case'ignoreEff':X.ign.eff=1;break;
   case'ignoreRes':X.ign.res=1;if(s.weak)X.ign.weak=1;break;
   case'discToolOpp':if(E.active&&E.active.tool){E.discard.push(E.active.tool);log(`${cname(E.active.tool)} dibuang dari ${cname(E.active.card)}`);E.active.tool=null;fx('sync')}break;
   case'gustFirst':if(E.bench.length){const t=await ask(sd,'mon',{title:'Tarik 1 Pokémon Cadangan lawan',mons:E.bench,ctx:'gust',sd:o,pref:x=>(100-hp(x)/10)+(x.card.prize||1)*20});swapActive(o,t);log(`${cname(t.card)} ditarik ke Arena Bertarung lawan`)}X.tgt=E.active;break;
   case'snipe':{const ms=s.bench?E.bench:inPlay(E),n=s.per?s.per*a.en.length:s.n;X.base=n;X.tgt=ms.length?await ask(sd,'mon',{title:`Pilih Pokémon lawan yang terkena ${n} kerusakan`,mons:ms,ctx:'target',sd:o,pref:x=>hp(x)<=n?1000+(x.card.prize||1)*10:-hp(x)}):null;break}
   case'setBase':X.base=!s.ex||E.active&&rule(E.active.card)?s.n:0;break;   // "kepada semua Pokémon (ex) lawan": Bertarung lewat damage biasa, Cadangan di benchDmgAll
   case'failUnless':if(!gCond(s.if,sd,a,s,at)){X.fail=1;return}break;
   case'atkFirstOk':case'onlyFirst2':break;
   case'flipN':{const n=s.of?gCount(s.of,sd,a,s):s.n;X.fl=n?await flips(sd,n,at.n,at.tx):[];break}
   case'flipUntilN':X.fl=Array(await flipsUntil(sd,at.n,at.tx)).fill(true);break;
   case'mulHeads':X.base=s.per*heads(X);break;   // syarat giliran, dicek whyAttack
   case'addLastHit':if(a.hitT===E.tn)X.base+=a.hitD||0;break;   // damage serangan yang diterima di giliran lawan sebelumnya (dicatat hitMon)
   case'millCount':{let c=0;for(const T of s.both?[G[sd],E]:[G[sd]]){const k=Math.min(s.n,T.deck.length),cs=T.deck.splice(T.deck.length-k,k);T.discard.push(...cs);c+=cs.filter(gp(sd,s.p)).length;log(`${T===E?who(o):who(sd)} membuang ${k} kartu teratas Deck`)}
    fx('sync');if(s.mode==='mul')X.base=s.per*c;else X.base+=s.per*c;break}}}
 X.base=Math.max(0,X.base)}
function ownerOf(m){return inPlay(G.p).includes(m)?'p':'o'}
/* efek ke Pokémon lawan dicegah bila Pokémon itu terlindung "kerusakan dan efek" pada giliran ini */
const effBlocked=m=>!!(m&&ownerOf(m)!==G.cur&&(m.x&&m.x.shield&&m.x.shield.all&&G[G.cur].tn===m.x.shield.tn&&(!m.x.shield.exOnly||rule((G[G.cur].active||{card:{}}).card))||noEffFrom(m)));   // efek serangan lawan diblokir
async function chooseEn(sd,mon,n,title,card){if(!mon.en.length)return[];if(mon.en.length<=n)return[...mon.en];
 return await ask(sd,'cards',{title,cards:mon.en,min:n,max:n,card,pref:e=>e.k==='senergy'?0:1,cost:true})||mon.en.slice(0,n)}
async function genStep(sd,a,at,X,s){const S=G[sd],o=opp(sd),E=G[o],d=X.tgt&&X.tgt===E.active?X.tgt:E.active;
 switch(s.op){
  case'self':await fx('settle');a.dmg+=s.n;fx('hit',a.id,s.n);log(`${cname(a.card)} juga menerima ${s.n} kerusakan`);break;
  case'status':if(d&&hp(d)>0&&!effBlocked(d))for(const k of s.s){if(k==='poison')d.poison=s.pn?s.pn:1;else if(k==='burn')d.burn=1;else setSp(d,o,k);if(k==='poison'||k==='burn')log(`${cname(d.card)} menjadi ${CONDN[k]}`)}fx('sync');break;
  case'flipIf':if(await flip(sd,at.n,at.tx)===!s.tails)for(const t of s.then)await genStep(sd,a,at,X,t);break;
  case'discEnSelf':{const es=s.all?[...a.en]:s.t?await chooseEn(sd,{en:a.en.filter(e=>e.t===s.t)},s.n,`Pilih ${s.n} Energi ${cname(a.card)} untuk dibuang`,a.card):await chooseEn(sd,a,s.n,`Pilih ${s.n} Energi ${cname(a.card)} untuk dibuang`,a.card);es.forEach(e=>{a.en.splice(a.en.indexOf(e),1);S.discard.push(e)});if(es.length)log(`${who(sd)} membuang ${es.length} Energi dari ${cname(a.card)}`);X.boom=(X.boom||[]).concat(es.filter(e=>e.g&&e.g.some(q=>q.op==='boomerang')));fx('sync');break}
  case'retEnHand':{const es=await chooseEn(sd,a,s.n,`Pilih ${s.n} Energi yang kembali ke tangan`,a.card);es.forEach(e=>{a.en.splice(a.en.indexOf(e),1);S.hand.push(e)});fx('sync');break}
  case'moveEnBench':{if(!S.bench.length||!a.en.length)break;const es=await chooseEn(sd,a,s.n,`Pilih ${s.n} Energi untuk dipindah ke Cadangan`,a.card);
   const t=await ask(sd,'mon',{title:'Pilih Pokémon Cadangan penerima Energi',mons:S.bench,ctx:'target',sd,pref:x=>x.card.hp-x.en.length*30});es.forEach(e=>{a.en.splice(a.en.indexOf(e),1);t.en.push(e)});fx('sync');log(`${who(sd)} memindahkan ${es.length} Energi ke ${cname(t.card)}`);break}
  case'draw':{if(s.may&&!await ask(sd,'confirm',{title:`Ambil ${s.n} kartu?`,tx:at.tx,card:a.card}))break;const n=await drawShow(sd,s.n);log(`${who(sd)} mengambil ${n} kartu`);break}
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
  case'shield':mx(a).shield={tn:E.tn+1,all:!!s.all,basic:!!s.basic,upto:s.upto};   // basic: hanya dari Pokémon Basic (Golbat), dibaca hitMonlog(`${cname(a.card)} terlindung di giliran lawan berikutnya`);break;
  case'benchDmg':for(let i=0;i<s.k;i++){const ms=E.bench.filter(t=>!s.dmgd||t.dmg>0);if(!ms.length)break;const t=await ask(sd,'mon',{title:`Pilih Pokémon Cadangan lawan yang terkena ${s.n} kerusakan`,mons:ms,ctx:'target',sd:o,pref:x=>hp(x)<=s.n?1000+(x.card.prize||1)*10:-hp(x)});await hitMon(a,t,o,s.n)}break;
  case'benchDmgAll':for(const t of[...E.bench])if(!s.ex||rule(t.card))await hitMon(a,t,o,s.n);break;
  case'benchSelfAll':for(const t of[...S.bench])await hitMon(a,t,sd,s.n);break;
  case'placeCtrBench':case'placeCtrAny':{const ts=(s.op==='placeCtrBench'?E.bench:inPlay(E)).filter(t=>!effBlocked(t)&&!(stOp('stBenchSafe')&&t!==E.active));if(ts.length)await ask(sd,'placeDmg',{tgts:ts,n:s.n,card:a.card,from:a,apply:(_,t,n)=>{t.dmg+=10*n;fx('hit',t.id,10*n,null,1);log(`${cname(t.card)} menerima ${n} Token Kerusakan`)}});break}
  case'mill':{const T=s.self?S:E,k=Math.min(s.n,T.deck.length);const cs=T.deck.splice(T.deck.length-k,k);T.discard.push(...cs);fx('sync');log(`${who(s.self?sd:o)} membuang ${k} kartu teratas Deck ke Trash`);break}
  case'switchSelf':if(S.bench.length&&S.active===a){if(s.may&&!await ask(sd,'confirm',{title:'Tukar dengan Pokémon Cadangan?',tx:at.tx,card:a.card}))break;const m=await ask(sd,'mon',{title:'Majukan 1 Pokémon Cadangan-mu',mons:S.bench,ctx:'promote',sd});swapActive(sd,m);log(`${who(sd)} menukar ${cname(a.card)} dengan ${cname(m.card)}`)}break;
  case'callBasic':{const r=await pickDeck(sd,a.card,{title:`Pilih s/d ${s.n} Pokémon Basic untuk Cadangan`,pred:isBasic,max:Math.min(s.n,bmax(sd)-S.bench.length),pref:x=>x.hp});r.forEach(x=>toBench(sd,x));log(`${who(sd)} menaruh ${r.length} Pokémon ke Cadangan`);await shuffleDeck(sd);break}
  case'search':{const n=s.n==='heads'?heads(X):s.n;if(n)await genSearch(sd,a.card,{...s,n});break}
  case'discEnOpp':if(d&&d.en.length&&!effBlocked(d)&&(!s.special||d.en.some(e=>e.k==='senergy'))){const es=await chooseEn(sd,s.special?{en:d.en.filter(e=>e.k==='senergy')}:d,s.n,`Pilih ${s.n} Energi ${cname(d.card)} untuk dibuang`,a.card);es.forEach(e=>{d.en.splice(d.en.indexOf(e),1);E.discard.push(e)});log(`${who(sd)} membuang ${es.length} Energi dari ${cname(d.card)}`);fx('sync')}break;
  case'discHandRand':{const k=Math.min(s.n==='heads'?heads(X):s.n,E.hand.length),cs=shuf([...E.hand]).slice(0,k);cs.forEach(c=>{E.hand.splice(E.hand.indexOf(c),1);E.discard.push(c)});fx('sync');if(k)log(`${who(o)} membuang ${cs.map(cname).join(', ')} dari tangan`);break}
  case'lookHand':if(sd==='p')await fx('lookHand',[...E.hand]);break;
  case'oppSwitch':if(E.bench.length&&E.active){if(s.may&&!await ask(sd,'confirm',{title:'Tukar Pokémon Bertarung lawan?',tx:at.tx,card:a.card}))break;const m=await ask(o,'mon',{title:'Lawan menukar Pokémon Bertarung-mu. Pilih pengganti dari Cadangan',mons:E.bench,ctx:'promote',sd:o});swapActive(o,m);log(`${who(o)} memajukan ${cname(m.card)}`)}break;
  case'gustAfter':if(E.bench.length&&E.active){const t=await ask(sd,'mon',{title:'Tarik 1 Pokémon Cadangan lawan',mons:E.bench,ctx:'gust',sd:o,pref:x=>(100-hp(x)/10)+(x.card.prize||1)*20});swapActive(o,t);log(`${cname(t.card)} ditarik ke Arena Bertarung lawan`)}break;
  case'selfStatus':if(s.s==='poison')a.poison=1;else if(s.s==='burn')a.burn=1;else setSp(a,sd,s.s);fx('sync');break;
  case'discStadium':if(G.stadium){if(s.may&&!await ask(sd,'confirm',{title:'Buang Stadium?',tx:`${cname(G.stadium.card)} dibuang ke Trash.`,card:G.stadium.card}))break;const st=G.stadium;G[st.owner].discard.push(st.card);G.stadium=null;log(`${cname(st.card)} dibuang ke Trash`);fx('sync');await enforceBoth(st.owner)}break;
  case'lookTopBench':{const top=S.deck.slice(-s.n).reverse(),pool=top.filter(isBasic),r=pool.length&&S.bench.length<bmax(sd)?await ask(sd,'cards',{title:`Pilih Pokémon Basic dari ${s.n} kartu teratas untuk Cadangan`,cards:top,pick:isBasic,max:Math.min(pool.length,bmax(sd)-S.bench.length),card:a.card,pref:x=>x.hp,from:'deck'}):[];
   r.forEach(x=>{S.deck.splice(S.deck.indexOf(x),1);toBench(sd,x)});log(`${who(sd)} menaruh ${r.length} Pokémon ke Cadangan`);await shuffleDeck(sd);break}
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
  case'recover':{const n=s.n==='heads'?heads(X):s.n,pool=S.discard.filter(x=>SRCP[s.what](x)&&noRecov(x));if(!pool.length||!n)break;const r=await ask(sd,'cards',{title:`Ambil s/d ${n} ${SRCN[s.what]} dari Trash`,cards:pool,all:S.discard,max:n,card:a.card,pref:x=>isMon(x)?x.hp/100:1,from:'discard'});r.forEach(x=>S.discard.splice(S.discard.indexOf(x),1));await toHand(sd,a.card,r);break}
  case'millPer':{const k=Math.min(heads(X),E.deck.length),cs=E.deck.splice(E.deck.length-k,k);E.discard.push(...cs);fx('sync');if(k)log(`${who(o)} membuang ${k} kartu teratas Deck ke Trash`);break}
  case'discEnPer':{const k=s.side==='h'?heads(X):(X.fl||[]).length-heads(X),m=s.who==='self'?a:d;if(!k||!m||!m.en.length||s.who==='opp'&&effBlocked(m))break;
   const es=await chooseEn(sd,m,Math.min(k,m.en.length),`Pilih ${Math.min(k,m.en.length)} Energi ${cname(m.card)} untuk dibuang`,a.card);es.forEach(e=>{m.en.splice(m.en.indexOf(e),1);G[s.who==='self'?sd:o].discard.push(e)});fx('sync');log(`${es.length} Energi ${cname(m.card)} dibuang`);break}
  case'oppMonToDeck':for(let i=0;i<s.n;i++){const ms=(s.bench?E.bench:inPlay(E)).filter(t=>!effBlocked(t));if(!ms.length)break;const t=await ask(sd,'mon',{title:'Pilih Pokémon lawan yang dikocok kembali ke Deck lawan',mons:ms,ctx:'target',sd:o,pref:x=>mval(x)});
   const cs=[...t.under,t.card,...t.en,...(t.tool?[t.tool]:[])],wasAct=E.active===t;if(wasAct)E.active=null;E.bench=E.bench.filter(x=>x!==t);E.deck.push(...cs);await shuffleDeck(o);log(`${cname(t.card)} dan semua kartunya dikocok ke Deck ${who(o)}`);
   if(wasAct){if(E.bench.length){const m=await ask(o,'mon',{title:'Pilih Pokémon Cadangan yang maju',mons:E.bench,ctx:'promote',sd:o});swapActive(o,m)}else endGame(sd)}}break;
  case'healFullPick':for(let i=0;i<s.n;i++){const ms=inPlay(S).filter(m=>m.dmg>0);if(!ms.length)break;const t=ms.length>1?await ask(sd,'mon',{title:'Pilih Pokémon-mu yang dipulihkan sepenuhnya',mons:ms,ctx:'target',sd,pref:m=>m.dmg}):ms[0];heal(sd,t,t.dmg)}break;
  case'koPick':for(let i=0;i<s.n;i++){const ms=inPlay(E).filter(t=>hp(t)>0&&!effBlocked(t));if(!ms.length)break;const t=await ask(sd,'mon',{title:'Pilih Pokémon lawan yang KO',mons:ms,ctx:'target',sd:o,pref:x=>(x.card.prize||1)*100+hp(x)});t.dmg=Math.max(t.dmg,maxHp(t));fx('hit',t.id,0,null,1);log(`${cname(t.card)} KO karena efek serangan`)}break;   // KO diproses resolveKO sesudah serangan
  case'statusPick':if(d&&!effBlocked(d)){const ks=['asleep','burn','confused','paralyzed','poison'],k=await ask(sd,'choice',{title:'Pilih Kondisi Khusus untuk Pokémon Bertarung lawan',tx:at.tx,opts:ks.map(x=>CONDN[x]),pref:()=>3});const c=ks[k];
   if(c==='poison'||c==='burn'){if(!condBlocked(d))d[c]=1;log(`${cname(d.card)} menjadi ${CONDN[c]}`);fx('sync')}else setSp(d,o,c)}break;
  case'ctrAct':if(E.active&&!effBlocked(E.active)){const t=E.active;t.dmg+=10*s.n;fx('hit',t.id,10*s.n,null,1);log(`${cname(t.card)} menerima ${s.n} Token Kerusakan`)}break;
  case'cureSelf':for(const k of conds(a))cureOne(a,k);break;
  case'selfTo':await selfTo(sd,a,s.to);break;
  case'noRetSelf':mx(a).noRet=S.tn+1;break;
  case'oppEnHand':case'oppEnMove':if(d&&d.en.length&&!effBlocked(d)&&(s.op==='oppEnHand'||E.bench.length)){if(s.may&&!await ask(sd,'confirm',{title:s.op==='oppEnHand'?'Kembalikan Energi lawan ke tangannya?':'Pindahkan Energi lawan ke Cadangannya?',tx:at.tx,card:a.card}))break;
   const es=await chooseEn(sd,d,s.n,`Pilih ${s.n} Energi ${cname(d.card)}`,a.card);if(s.op==='oppEnHand'){es.forEach(e=>{d.en.splice(d.en.indexOf(e),1);E.hand.push(e)});log(`${es.length} Energi ${cname(d.card)} kembali ke tangan ${who(o)}`)}
   else{const t=await ask(sd,'mon',{title:'Pilih Pokémon Cadangan lawan penerima Energi',mons:E.bench,ctx:'target',sd:o,pref:x=>-x.en.length});es.forEach(e=>{d.en.splice(d.en.indexOf(e),1);t.en.push(e)});log(`Energi ${cname(d.card)} dipindah ke ${cname(t.card)}`)}fx('sync')}break;
  case'handDiscDraw':{const k=Math.min(s.n,S.hand.length);if(k){const r=await ask(sd,'cards',{title:`Buang ${k} kartu dari tanganmu`,cards:[...S.hand],min:k,max:k,card:a.card,okTx:'Buang',pref:x=>isEn(x)?1:2});r.forEach(x=>{S.hand.splice(S.hand.indexOf(x),1);S.discard.push(x)});fx('sync')}
   const n=await drawShow(sd,s.draw);log(`${who(sd)} membuang ${k} kartu dan mengambil ${n} kartu`);break}
  case'healBenchFull':for(let i=0;i<s.n;i++){const ms=S.bench.filter(m=>m.dmg>0);if(!ms.length)break;const t=ms.length>1?await ask(sd,'mon',{title:'Pilih Pokémon Cadangan-mu yang dipulihkan sepenuhnya',mons:ms,ctx:'target',sd,pref:m=>m.dmg}):ms[0];heal(sd,t,t.dmg)}break;
  case'vulnNext':if(d&&!effBlocked(d))mx(d).vuln={n:s.n,tn:S.tn+1};break;   // dibaca hitMon
  case'spikyNext':mx(a).spiky={n:s.n,tn:E.tn+1};break;
  case'atkFlipNext':if(d&&!effBlocked(d))mx(d).atkFlip=E.tn+1;break;   // dibaca actAttack
  case'lockAtk':if(d&&!effBlocked(d)&&d.card.atk.length){const ns=d.card.atk.map(t=>t.n),k=ns.length>1?await ask(sd,'choice',{title:'Pilih serangan lawan yang dikunci',tx:at.tx,opts:ns,pref:()=>d.card.atk.reduce((b,t,i)=>t.dmg>d.card.atk[b].dmg?i:b,0)}):0;
   mx(d).noAtkN={n:ns[k],tn:E.tn+1};log(`${ns[k]} tidak bisa dipakai di giliran lawan berikutnya`)}break;
  case'shieldIfKO':{const t=X.tgt||E.active;if(t&&hp(t)<=0){mx(a).shield={tn:E.tn+1,all:1};log(`${cname(a.card)} terlindung di giliran lawan berikutnya`)}break}
  case'ctrUntilBench':for(const t of E.bench)if(hp(t)>s.n&&!effBlocked(t)&&!stOp('stBenchSafe')){const k=hp(t)-s.n;t.dmg+=k;fx('hit',t.id,k,null,1);log(`${cname(t.card)} menerima ${k/10} Token Kerusakan`)}break;
  case'attachAny':{const n=s.n==='heads'?heads(X):s.n;if(s.n!=='heads'||n)await attachAny(sd,{...s,n},a,a.card);break}
  case'reorderOpp':{const k=Math.min(s.n,E.deck.length);if(!k)break;const cs=E.deck.slice(-k).reverse(),r=await ask(sd,'cards',{title:`Urutkan ${k} kartu teratas Deck lawan: kartu yang dipilih pertama jadi paling atas`,cards:cs,min:k,max:k,card:a.card,okTx:'Kembalikan',order:1,pref:()=>1});
   cs.forEach(x=>E.deck.splice(E.deck.indexOf(x),1));E.deck.push(...[...r].reverse());fx('sync');log(`${who(sd)} menyusun ulang ${k} kartu teratas Deck lawan`);break}
  case'peekTop':{const k=Math.min(s.n,S.deck.length);if(!k)break;const cs=S.deck.slice(-k).reverse();if(sd==='p')await fx('reveal',sd,cs,a.card);const r=await ask(sd,'choice',{title:`${k} kartu teratas Deck-mu`,tx:cs.map(cname).join(', '),opts:['Kembalikan ke posisi semula','Buang ke Trash'],pref:()=>0});
   if(r===1){cs.forEach(x=>S.deck.splice(S.deck.indexOf(x),1));S.discard.push(...cs);fx('sync');log(`${who(sd)} membuang ${k} kartu teratas Deck`)}break}
  case'evoSelf':{const ok=x=>isMon(x)&&x.from===a.card.n;if(!inPlay(S).includes(a)||!S.deck.some(ok)){await shuffleDeck(sd);break}const r=await pickDeck(sd,a.card,{title:`Pilih kartu evolusi untuk ${cname(a.card)}`,pred:ok,max:1,pref:x=>x.hp});
   if(r.length){S.hand.push(r[0]);await evolveMon(sd,r[0],a)}await shuffleDeck(sd);break}   // evolveMon mengambil kartunya dari tangan
  case'discHandPick':{if(!E.hand.length)break;if(sd==='p')await fx('lookHand',[...E.hand]);const r=await ask(sd,'cards',{title:`Pilih ${s.n} kartu dari tangan lawan untuk dibuang`,cards:E.hand,min:Math.min(s.n,E.hand.length),max:s.n,card:a.card,cost:true,pref:x=>x.k==='supporter'?3:isEn(x)?2:1});r.forEach(c=>{E.hand.splice(E.hand.indexOf(c),1);E.discard.push(c)});fx('sync');log(`${who(o)} membuang ${r.map(cname).join(', ')}`);break}}}
async function genPost(sd,a,at,X){for(const s of X.post||at.g)if(!GPRE.has(s.op)&&s.op!=='ifFlip')await genStep(sd,a,at,X,s);if(X.optSelf){await fx('settle');a.dmg+=X.optSelf;fx('hit',a.id,X.optSelf);log(`${cname(a.card)} juga menerima ${X.optSelf} kerusakan`)}
 const D=G[sd].discard;for(const e of X.boom||[])if(inPlay(G[sd]).includes(a)&&D.includes(e)){D.splice(D.indexOf(e),1);a.en.push(e);log(`${cname(e)} kembali ke ${cname(a.card)}`);fx('sync')}}   // Energi Bumerang
/* cari kartu dari Deck ke tangan (diperlihatkan) */
const SRCP={mon:isMon,basic:isBasic,benergy:x=>x.k==='energy',energy:isEn,item:x=>x.k==='item',supporter:x=>x.k==='supporter',tool:x=>x.k==='tool',stadium:x=>x.k==='stadium',trainer:isTrainer,evo:x=>isMon(x)&&x.stage>0,any:()=>true};
const SRCN={mon:'Pokémon',basic:'Pokémon Basic',benergy:'Energi Dasar',energy:'Energi',item:'Item',supporter:'Supporter',tool:'Pokémon Tool',stadium:'Stadium',trainer:'Trainer',evo:'Pokémon Evolusi',any:'kartu'};
const noRecov=x=>!(x.g&&x.g.some(s=>s.op==='noRec'));   // "selama di Trash tidak dapat ditambahkan ke Kartu Pegangan / dikembalikan ke Deck"
async function genSearch(sd,card,s){const r=await pickDeck(sd,card,{title:`Pilih s/d ${s.n} ${SRCN[s.what]} untuk tangan`,pred:SRCP[s.what],max:s.n,pref:s.what==='mon'||s.what==='basic'||s.what==='evo'?wantPoke(sd):()=>1});await toHand(sd,card,r);log(`${who(sd)} mengambil ${r.length} kartu dari Deck`);await shuffleDeck(sd)}
/* perkiraan damage untuk Bot (koin = nilai harapan) */
function genDmg(a,at,sd){let b=at.dmg;for(const s of at.g||[]){
 if(s.op==='flipMul')b=s.per*s.n/2;else if(s.op==='flipAddPer')b+=s.per*s.n/2;else if(s.op==='flipUntilMul')b=s.per;else if(s.op==='flipUntilAdd')b+=s.per;else if(s.op==='flipAdd')b+=s.add/2;else if(s.op==='flip2Add')b+=s.add/4;
 else if(s.op==='flipFail')b/=2;else if(s.op==='addPer')b+=s.per*gCount(s.of,sd,a,s);else if(s.op==='mul')b=s.per*gCount(s.of,sd,a,s);else if(s.op==='addIf'&&gCond(s.if,sd,a))b+=s.add;else if(s.op==='snipe')b=s.per?s.per*a.en.length:s.n;else if(s.op==='setBase'){const d=G[opp(sd)].active;b=!s.ex||d&&rule(d.card)?s.n:0}else if(s.op==='addLastHit'&&a.hitT===G[opp(sd)].tn)b+=a.hitD||0;else if(s.op==='millCount')b=s.mode==='mul'?s.per*s.n/4:b+s.per*s.n/4;else if(s.op==='mulHeads')b=s.per}
 return b}
/* ---------- Trainer umum ---------- */
/* kelas kartu dari generator {k,t,ex,mega,tera,norule,o,nameHas,sameOpp}; daftar = salah satu cocok */
const GK={any:()=>true,mon:isMon,basic:isBasic,evo:x=>isMon(x)&&x.stage>0,st1:x=>isMon(x)&&x.stage===1,st2:x=>isMon(x)&&x.stage===2,benergy:x=>x.k==='energy',energy:isEn,senergy:x=>x.k==='senergy',item:x=>x.k==='item',supporter:x=>x.k==='supporter',tool:x=>x.k==='tool',stadium:x=>x.k==='stadium',trainer:x=>isTrainer(x)};
const gp=(sd,ps)=>x=>(ps||[{k:'any'}]).some(p=>GK[p.k](x)&&(!p.t||(isMon(x)?x.type:x.t)===p.t)&&(!p.ex||/ ex$/.test(x.n||''))&&(!p.mega||!!x.mega)&&(!p.tera||!!x.tera)&&(!p.norule||!rule(x))&&ownerIs(x,p.o)&&(!p.nameHas||cname(x).includes(p.nameHas))&&(!p.sameOpp||inPlay(G[opp(sd)]).some(m=>m.card.n===x.n)));
const gm=(sd,ps)=>{const f=gp(sd,ps);return m=>f(m.card)};
const gParts=s=>(s.lb||'').split(/, dan |, | dan /);   // label tiap kelas untuk "masing-masing 1 lembar"
const gPref=sd=>x=>isMon(x)?wantPoke(sd)(x)+1:x.k==='supporter'&&!G[sd].hand.some(h=>h.k==='supporter')?3:isEn(x)?1.5:1;
const anyTS=E=>inPlay(E).some(m=>m.tool||m.en.some(e=>e.k==='senergy'));
const heal2El=(sd,s)=>{const pm=s.p?gm(sd,s.p):()=>true;return m=>m.dmg>0&&pm(m)&&(!s.minEn||m.en.length>=s.minEn)&&(!s.maxLeft||hp(m)<=s.maxLeft)};
const gLabel=st=>{const s=st[0];return s.op==='switch'?'Tukar Pokémon Bertarung':s.op==='boostTurn'?`+${s.n} kerusakan giliran ini`:s.op==='find'?`Ambil ${s.n} ${s.lb}`:'Pakai efek ini'};
/* Pokémon (beserta semua kartunya) ke tangan/Deck; bila itu Pokémon Bertarung, Cadangan maju (tanpa Cadangan = kalah) */
async function selfTo(sd,m,to){const S=G[sd];if(!m||!inPlay(S).includes(m))return;const cs=[...m.under,m.card,...m.en,...(m.tool?[m.tool]:[])],wasAct=S.active===m;
 if(wasAct)S.active=null;S.bench=S.bench.filter(x=>x!==m);if(to==='hand')S.hand.push(...cs);else{S.deck.push(...cs);await shuffleDeck(sd)}fx('sync');log(`${cname(m.card)} dan semua kartunya kembali ke ${to==='hand'?'tangan':'Deck'}`);
 if(wasAct){if(S.bench.length){const t=await ask(sd,'mon',{title:'Pilih Pokémon Cadangan yang maju',mons:S.bench,ctx:'promote',sd});swapActive(sd,t)}else endGame(opp(sd))}}
/* pasang Energi Dasar dari tangan/Trash/Deck ke Pokémon sendiri, Cadangan, atau Pokémon ini */
async function attachAny(sd,s,self,card){const S=G[sd],src=s.src==='hand'?S.hand:s.src==='discard'?S.discard:S.deck,ok=x=>x.k==='energy'&&(!s.t||x.t===s.t),tg=s.to==='self'?(self&&inPlay(S).includes(self)?[self]:[]):s.to==='bench'?[...S.bench]:inPlay(S);let es=[];
 if(tg.length&&src.some(ok)){es=await ask(sd,'cards',{title:`Pilih ${s.n?'s/d '+s.n:'sesukanya'} Energi Dasar${s.t?' '+TYPES[s.t][0]:''} dari ${s.src==='hand'?'tangan':s.src==='discard'?'Trash':'Deck'} untuk dipasang`,cards:src.filter(ok),all:s.src==='hand'?undefined:src,max:s.n||99,card,pref:()=>1,from:s.src==='hand'?undefined:s.src});es.forEach(e=>src.splice(src.indexOf(e),1))}
 if(es.length){if(tg.length===1){es.forEach(e=>{tg[0].en.push(e);fx('energy',tg[0],e)});fx('sync')}else await ask(sd,'attachEnergies',{energies:es,targets:tg,card,apply:(e,t)=>{t.en.push(e);fx('energy',t,e);fx('sync')}})}
 if(s.src==='deck')await shuffleDeck(sd);if(es.length)log(`${who(sd)} memasang ${es.length} Energi`)}
async function dropStadium(){const st=G.stadium;if(!st)return;G[st.owner].discard.push(st.card);G.stadium=null;log(`${cname(st.card)} dibuang ke Trash`);fx('sync');await enforceBoth(st.owner)}
function condWhy(sd,s){const S=G[sd],E=G[opp(sd)],ks=S.koLastC||[];
 if(s.c==='koLast'&&!(s.w==='tr'?ks.some(c=>ownerIs(c,'Tim Roket')):s.w==='mega'?ks.some(c=>c.mega):S.koFlag))return`Hanya jika Pokémon${s.w==='tr'?' Tim Roket':s.w==='mega'?' Mega ex':''}-mu KO di giliran lawan sebelumnya`;
 if(s.c==='onlyCard'&&S.hand.length!==1)return'Hanya jika kartu ini satu-satunya di tanganmu';
 if(s.c==='secondFirst'&&!(G.first!==sd&&S.tn===1))return'Hanya di giliran pertama Pemain Kedua';
 if(s.c==='oppPz'&&E.prizes.length>s.v)return`Hanya saat Kartu Point lawan tersisa ${s.v} atau kurang`;
 if(s.c==='behind'&&!(S.prizes.length>E.prizes.length))return'Hanya saat sisa Kartu Point-mu lebih banyak dari lawan';
 if(s.c==='tera'&&!inPlay(S).some(m=>m.card.tera))return'Butuh Pokémon Terastal di Arena';
 if(s.c==='notFirst'&&S.tn<2)return'Tidak bisa di giliran pertamamu';
 return''}
function genWhy(sd,c){const S=G[sd],E=G[opp(sd)],hand=S.hand.filter(x=>x!==c);for(const s of c.g){
 if(s.op==='cond'){const w=condWhy(sd,s);if(w)return w}
 if(s.op==='costDiscard'&&hand.filter(x=>!s.p||gp(sd,s.p)(x)).length<s.n)return s.p?`Butuh ${s.lb} di tangan untuk dibuang`:`Butuh ${s.n} kartu lain di tangan untuk dibuang`;
 if(s.op==='switch'&&!S.bench.length)return'Cadangan kosong';
 if(s.op==='switch'&&s.o&&!(S.active&&ownerIs(S.active.card,s.o)&&S.bench.some(m=>ownerIs(m.card,s.o))))return`Butuh Pokémon ${s.o} di Arena Bertarung dan Cadangan`;
 if(s.op==='switch'&&s.t&&!(S.active&&S.active.card.type===s.t&&S.bench.some(m=>m.card.type===s.t)))return`Butuh Pokémon ${TYPES[s.t][0]} di Arena Bertarung dan Cadangan`;
 if(s.op==='handTop'&&hand.length<s.n)return`Butuh ${s.n} kartu di tangan`;
 if((s.op==='gust'||s.op==='oppSwitch')&&!E.bench.length)return'Lawan tidak punya Pokémon Cadangan';
 if(s.op==='gust'&&s.p&&!E.bench.some(gm(sd,s.p)))return'Tidak ada Pokémon Basic di Cadangan lawan';
 if(['draw','search','shuffleDraw','discardDraw','find','look','akamatsu','gravel','evoDeck'].includes(s.op)&&!S.deck.length)return'Deck kosong';
 if((s.op==='callBasic'||s.op==='find'&&s.to==='bench')&&S.bench.length>=bmax(sd))return'Cadangan penuh';
 if(s.op==='healOne'&&!inPlay(S).some(m=>m.dmg>0))return'Tidak ada Pokémon-mu yang terkena kerusakan';
 if(s.op==='healActive'&&!(S.active&&S.active.dmg>0))return'Pokémon Bertarung tidak terkena kerusakan';
 if(s.op==='heal2'){const el=heal2El(sd,s);if(!(s.tgt==='active'?S.active&&el(S.active):(s.both?[...inPlay(S),...inPlay(E)]:inPlay(S)).some(el)))return'Tidak ada Pokémon yang bisa dipulihkan'}
 if(s.op==='recover'&&!S.discard.some(SRCP[s.what]))return`Tidak ada ${SRCN[s.what]} di Trash`;
 if(s.op==='recov'&&!S.discard.some(x=>gp(sd,s.p)(x)&&noRecov(x)))return`Tidak ada ${s.lb} di Trash`;
 if(s.op==='recoverDeck'&&!S.discard.some(x=>x.k==='energy'))return'Tidak ada Energi Dasar di Trash';
 if(s.op==='attach'){if(!(s.where==='bench'?S.bench:inPlay(S)).some(gm(sd,s.pt)))return`Tidak ada ${s.lt}${s.where==='bench'?' di Cadangan':''}`;if(s.src==='discard'&&!S.discard.some(gp(sd,s.pe)))return`Tidak ada ${s.lb} di Trash`}
 if(s.op==='moveEnOwn'&&!(inPlay(S).length>1&&inPlay(S).some(m=>m.en.some(e=>e.k==='energy'))))return'Tidak ada Energi Dasar yang bisa dipindah';
 if(s.op==='healCure'&&!inPlay(S).some(m=>m.dmg>0||conds(m).length))return'Tidak ada Pokémon-mu yang perlu dipulihkan';
 if(s.op==='discTools'&&![...inPlay(S),...inPlay(E)].some(m=>m.tool))return'Tidak ada Pokémon Tool di Arena';
 if(s.op==='discEnOppAny'&&!inPlay(E).some(m=>m.en.some(e=>!s.special||e.k==='senergy')))return s.special?'Pokémon lawan tidak punya Energi Spesial':'Pokémon lawan tidak punya Energi';
 if(s.op==='discToolSen'&&!anyTS(E))return'Pokémon lawan tidak punya Pokémon Tool atau Energi Spesial';
 if((s.op==='megaton'||s.op==='burnOne')&&!(G.stadium||anyTS(E)))return'Tidak ada yang bisa dibuang';
 if(s.op==='benchEnToAct'&&!S.bench.some(m=>m.en.length))return'Pokémon Cadangan tidak punya Energi';
 if(s.op==='oppEnToHand'&&!inPlay(E).some(m=>m.en.length))return'Pokémon lawan tidak punya Energi';
 if(s.op==='handBottom'&&hand.length<s.n)return`Butuh ${s.n} kartu lain di tangan`;
 if(s.op==='gravel'&&!hand.some(isMon))return'Tidak ada Pokémon di tangan';
 if(s.op==='discForDraw'&&!hand.some(gp(sd,s.p)))return`Tidak ada ${s.lb} di tangan`;
 if(s.op==='prizeSwap'&&!S.prizes.length)return'Tidak ada Kartu Point';
 if(s.op==='scoop'&&!S.bench.length)return'Butuh Pokémon Cadangan';
 if(s.op==='either'&&genWhy(sd,{g:s.a})&&genWhy(sd,{g:s.b}))return genWhy(sd,{g:s.a})}
 return''}
const NOFX=new Set(['cond','firstOk','noRec','selfDeckIf']);   // syarat (genWhy/whyTrainer) & efek yang dibaca actTrainer
async function genTrainer(sd,c,list){const S=G[sd],E=G[opp(sd)],o=opp(sd);let last=null,prev=null,done=0;   // last: Pokémon yang baru dipulihkan, prev: Pokémon Bertarung sebelum ditukar, done: efek yang sudah jalan (batal hanya sebelum ada efek)
 for(const s of list||c.g){switch(s.op){
  case'flipIf':{const rs=await flips(sd,s.k||1,cname(c),c.tx),st=rs.every(Boolean)?s.then:s.else;if(st){const r=await genTrainer(sd,c,st);if(r==='cancel')return}break}
  case'bothShuffleDraw':for(const x of[sd,o]){const T=G[x];T.deck.push(...T.hand.splice(0));fx('sync');await shuffleDeck(x)}for(const x of[sd,o]){const n=await drawShow(x,s.n);log(`${who(x)} mengambil ${n} kartu`)}break;
  case'discEnOppAny':{const okE=e=>!s.special||e.k==='senergy',ms=inPlay(E).filter(m=>m.en.some(okE));if(!ms.length)break;const t=await ask(sd,'mon',{title:`Pilih Pokémon lawan yang ${s.special?'Energi Spesial':'Energi'}-nya dibuang`,mons:ms,ctx:'target',sd:o,pref:m=>m.en.length+(m===E.active?2:0)});
   const es=await chooseEn(sd,{en:t.en.filter(okE)},1,`Pilih 1 Energi ${cname(t.card)} untuk dibuang`,c);es.forEach(e=>{t.en.splice(t.en.indexOf(e),1);E.discard.push(e)});fx('sync');log(`${who(sd)} membuang Energi dari ${cname(t.card)}`);break}
  case'moveEnOwn':{const src=await ask(sd,'mon',{title:'Pilih Pokémon-mu yang Energi Dasarnya dipindah',mons:inPlay(S).filter(m=>m.en.some(e=>e.k==='energy')),ctx:'target',sd,cancel:!done,pref:m=>m===S.active?-1:m.en.length});if(!src)return'cancel';
   const es=await chooseEn(sd,{en:src.en.filter(e=>e.k==='energy')},1,'Pilih 1 Energi Dasar',c),dst=await ask(sd,'mon',{title:'Pilih Pokémon penerima Energi',mons:inPlay(S).filter(m=>m!==src),ctx:'target',sd,pref:m=>m===S.active?3:1});
   es.forEach(e=>{src.en.splice(src.en.indexOf(e),1);dst.en.push(e);fx('energy',dst,e)});fx('sync');log(`${who(sd)} memindahkan Energi ke ${cname(dst.card)}`);break}
  case'recoverDeck':{const pool=S.discard.filter(x=>x.k==='energy'),r=await ask(sd,'cards',{title:`Kocok s/d ${s.n} Energi Dasar dari Trash ke Deck`,cards:pool,all:S.discard,max:s.n,card:c,pref:()=>1,from:'discard'});r.forEach(x=>{S.discard.splice(S.discard.indexOf(x),1);S.deck.push(x)});await shuffleDeck(sd);log(`${who(sd)} mengocok ${r.length} Energi ke Deck`);break}
  case'healCure':{const t=await ask(sd,'mon',{title:`Pilih Pokémon-mu yang dipulihkan ${s.n} HP dan Kondisi Khususnya`,mons:inPlay(S).filter(m=>m.dmg>0||conds(m).length),ctx:'target',sd,cancel:!done,pref:m=>Math.min(s.n,m.dmg)+conds(m).length*20});if(!t)return'cancel';heal(sd,t,s.n);for(const k of conds(t))cureOne(t,k);break}
  case'costDiscard':{const d=await ask(sd,'cards',{title:`Buang ${s.n} ${s.p?s.lb:'kartu lain'} dari tangan`,cards:S.hand.filter(x=>x!==c&&(!s.p||gp(sd,s.p)(x))),min:s.n,max:s.n,card:c,cost:true,pref:x=>isEn(x)?3:isMon(x)?(x.stage>0?1:2):2});if(!d||d.length<s.n)return'cancel';d.forEach(x=>{S.hand.splice(S.hand.indexOf(x),1);S.discard.push(x)});fx('sync');break}
  case'draw':{const n=await drawShow(sd,s.n);log(`${who(sd)} mengambil ${n} kartu`);break}
  case'shuffleDraw':{S.deck.push(...S.hand.splice(0));fx('sync');await shuffleDeck(sd);const n=await drawShow(sd,s.n);log(`${who(sd)} mengocok tangan ke Deck dan mengambil ${n} kartu`);break}
  case'discardDraw':{S.discard.push(...S.hand.splice(0));fx('sync');const n=await drawShow(sd,s.n);log(`${who(sd)} membuang tangan dan mengambil ${n} kartu`);break}
  case'switch':{const m=await ask(sd,'mon',{title:'Majukan 1 Pokémon Cadangan-mu',mons:S.bench.filter(x=>ownerIs(x.card,s.o)&&(!s.t||x.card.type===s.t)),ctx:'promote',sd,cancel:!done,pref:x=>x.card.atk.some(t=>afford(x,t.cost))?100+hp(x):hp(x)});if(!m)return'cancel';prev=S.active;swapActive(sd,m);log(`${who(sd)} menukar Pokémon Bertarung dengan ${cname(m.card)}`);break}
  case'gust':{const t=await ask(sd,'mon',{title:'Tarik 1 Pokémon Cadangan lawan',mons:E.bench.filter(s.p?gm(sd,s.p):()=>true),ctx:'gust',sd:o,cancel:!done,pref:x=>(100-hp(x)/10)+(x.card.prize||1)*20});if(!t)return'cancel';swapActive(o,t);log(`${cname(t.card)} ditarik ke Arena Bertarung lawan`);break}
  case'search':await genSearch(sd,c,s);break;
  case'callBasic':{const r=await pickDeck(sd,c,{title:`Pilih s/d ${s.n} Pokémon Basic untuk Cadangan`,pred:isBasic,max:Math.min(s.n,bmax(sd)-S.bench.length),pref:x=>x.hp});r.forEach(x=>toBench(sd,x));log(`${who(sd)} menaruh ${r.length} Pokémon ke Cadangan`);await shuffleDeck(sd);break}
  case'healOne':{const t=await ask(sd,'mon',{title:`Pilih Pokémon-mu yang dipulihkan ${s.n} HP`,mons:inPlay(S).filter(m=>m.dmg>0),ctx:'target',sd,cancel:!done,pref:m=>Math.min(s.n,m.dmg)+(m===S.active?15:0)});if(!t)return'cancel';heal(sd,t,s.n);last=t;break}
  case'healActive':heal(sd,S.active,s.n);last=S.active;break;
  case'recover':{const pool=S.discard.filter(x=>SRCP[s.what](x)&&noRecov(x)),r=await ask(sd,'cards',{title:`Ambil s/d ${s.n} ${SRCN[s.what]} dari Trash`,cards:pool,all:S.discard,max:s.n,card:c,pref:()=>1,from:'discard'});r.forEach(x=>S.discard.splice(S.discard.indexOf(x),1));await toHand(sd,c,r);break}
  /* --- blok umum Item/Supporter H/I/J --- */
  case'find':{const pr=gPref(sd);
   if(s.each){const got=[],parts=gParts(s);for(let i=0;i<s.p.length;i++)got.push(...await pickDeck(sd,c,{title:`Pilih ${s.n} ${parts[i]||'kartu'} untuk tangan`,pred:gp(sd,[s.p[i]]),max:s.n,pref:pr}));
    await toHand(sd,c,got);log(`${who(sd)} mengambil ${got.length} kartu dari Deck`);await shuffleDeck(sd);break}
   const f=gp(sd,s.p),bench=s.to==='bench',max=Math.min(s.n||99,bench?bmax(sd)-S.bench.length:99),canB=x=>isBasic(x)||!!x.fossil,dest=bench?'untuk Cadangan':s.to==='discard'?'untuk dibuang ke Trash':s.to==='top'?'untuk ditaruh di atas Deck (pilihan pertama paling atas)':'untuk tangan';let r;
   if(s.exact){r=S.deck.length?await ask(sd,'cards',{title:`Pilih ${s.n} kartu ${dest}`,cards:[...S.deck],min:Math.min(s.n,S.deck.length),max:s.n,card:c,pref:pr,from:'deck',order:s.to==='top'}):[];r.forEach(x=>S.deck.splice(S.deck.indexOf(x),1))}
   else r=await pickDeck(sd,c,{title:`Pilih ${s.n?'s/d '+s.n:'sesukanya'} ${s.lb} ${dest}`,pred:bench?x=>f(x)&&canB(x):f,max,pref:s.to==='discard'?()=>0:pr});   // fosil boleh ke Cadangan
   if(s.distinct){const seen=new Set();r=r.filter(x=>{if(seen.has(x.t)){S.deck.push(x);return false}seen.add(x.t);return true})}   // satu per tipe
   if(s.to==='hand')await toHand(sd,c,r);else if(bench)r.forEach(x=>toBench(sd,x));else if(s.to==='discard'){S.discard.push(...r);fx('sync')}
   await shuffleDeck(sd);if(s.to==='top'){S.deck.push(...[...r].reverse());fx('sync')}
   log(bench?`${who(sd)} menaruh ${r.length} Pokémon ke Cadangan`:`${who(sd)} ${s.to==='discard'?'membuang':'mengambil'} ${r.length} kartu dari Deck`);break}
  case'look':{const k=Math.min(s.n,S.deck.length);if(!k)break;const cs=s.from==='bottom'?S.deck.slice(0,k):S.deck.slice(-k).reverse(),f=gp(sd,s.p),pr=gPref(sd),where=s.from==='bottom'?'terbawah':'teratas';let got=[];
   if(s.each){const parts=gParts(s);for(let i=0;i<s.p.length;i++){const fi=gp(sd,[s.p[i]]);got.push(...await ask(sd,'cards',{title:`${k} kartu ${where} Deck: ambil 1 ${parts[i]||'kartu'}`,cards:cs,pick:x=>fi(x)&&!got.includes(x),max:1,card:c,pref:pr,from:'deck'}))}}
   else{const ok=s.to==='bench'?x=>f(x)&&isBasic(x):f,max=Math.min(s.pick||k,s.to==='bench'?bmax(sd)-S.bench.length:k);if(max>0)got=await ask(sd,'cards',{title:`${k} kartu ${where} Deck: ambil ${s.exact?max:s.pick?'s/d '+s.pick:'sesukanya'} ${s.lb}`,cards:cs,pick:ok,min:s.exact?max:0,max,card:c,pref:pr,from:'deck'})}
   cs.forEach(x=>S.deck.splice(S.deck.indexOf(x),1));const rest=cs.filter(x=>!got.includes(x));
   if(s.to==='hand')await toHand(sd,c,got);else if(s.to==='bench')got.forEach(x=>toBench(sd,x));else if(got.length)await ask(sd,'attachEnergies',{energies:got,targets:inPlay(S),card:c,apply:(e,t)=>{t.en.push(e);fx('energy',t,e);fx('sync')}});
   if(s.rest==='discard'){S.discard.push(...rest);fx('sync')}else if(s.rest==='bottom'){S.deck.unshift(...shuf(rest));fx('sync')}else{S.deck.push(...rest);await shuffleDeck(sd)}
   log(`${who(sd)} melihat ${k} kartu dan mengambil ${got.length}`);break}
  case'recov':{let got=[];const toDeck=s.to==='deck',dest=toDeck?'untuk dikocok ke Deck':'untuk tangan',pr=x=>isMon(x)?x.hp/100+1:1;
   if(s.each){const parts=gParts(s);for(let i=0;i<s.p.length;i++){const f=gp(sd,[s.p[i]]),pool=S.discard.filter(x=>f(x)&&noRecov(x)&&!got.includes(x));if(pool.length)got.push(...await ask(sd,'cards',{title:`Pilih s/d ${s.n} ${parts[i]||'kartu'} dari Trash ${dest}`,cards:pool,all:S.discard,max:s.n,card:c,pref:pr,from:'discard'}))}}
   else{const f=gp(sd,s.p),pool=S.discard.filter(x=>f(x)&&noRecov(x));if(pool.length)got=await ask(sd,'cards',{title:`Pilih s/d ${s.n} ${s.lb} dari Trash ${dest}`,cards:pool,all:S.discard,max:s.n,card:c,pref:pr,from:'discard'})}
   got.forEach(x=>S.discard.splice(S.discard.indexOf(x),1));
   if(toDeck){S.deck.push(...got);if(got.length){log(`${who(sd)} memperlihatkan ${got.map(cname).join(', ')}`);await fx('reveal',sd,got,c)}await shuffleDeck(sd)}else await toHand(sd,c,got);break}
  case'attach':{const pe=gp(sd,s.pe),src=s.src==='deck'?S.deck:S.discard,tg=(s.where==='bench'?S.bench:inPlay(S)).filter(gm(sd,s.pt));let es=[];
   if(tg.length&&src.some(pe)){const n=s.mode==='each'?Math.min(s.n,tg.length):s.n;es=await ask(sd,'cards',{title:`Pilih s/d ${n} ${s.lb} dari ${s.src==='deck'?'Deck':'Trash'} untuk dipasang`,cards:src.filter(pe),all:src,max:n,card:c,pref:()=>1,from:s.src==='deck'?'deck':'discard'});es.forEach(e=>src.splice(src.indexOf(e),1))}
   if(es.length&&s.mode==='one'){const t=tg.length>1?await ask(sd,'mon',{title:`Pilih ${s.lt} penerima ${es.length} Energi`,mons:tg,ctx:'target',sd,pref:m=>(m===S.active?5:0)+m.card.hp/100}):tg[0];es.forEach(e=>{t.en.push(e);fx('energy',t,e)});fx('sync')}
   else if(es.length){const left=[...tg];await ask(sd,'attachEnergies',{energies:es,targets:left,card:c,apply:(e,t)=>{t.en.push(e);fx('energy',t,e);left.splice(left.indexOf(t),1);if(s.poisonAct&&t===S.active&&!condBlocked(t)){t.poison=1;log(`${cname(t.card)} menjadi Racun`)}fx('sync')}})}   // 1 Energi per Pokémon
   if(s.src==='deck')await shuffleDeck(sd);log(`${who(sd)} memasang ${es.length} Energi dari ${s.src==='deck'?'Deck':'Trash'}`);break}
  case'akamatsu':{const r=await pickDeck(sd,c,{title:'Pilih s/d 2 Energi Dasar berbeda tipe',pred:x=>x.k==='energy',max:2,pref:()=>1});if(r.length===2&&r[0].t===r[1].t)S.deck.push(r.pop());
   if(r.length){log(`${who(sd)} memperlihatkan ${r.map(cname).join(', ')}`);const h=r.length>1?(await ask(sd,'cards',{title:'Pilih 1 Energi untuk tangan, sisanya dipasang',cards:r,min:1,max:1,card:c,pref:()=>1}))[0]||r[0]:r[0],rest=r.filter(x=>x!==h);S.hand.push(h);
    if(rest.length)await ask(sd,'attachEnergies',{energies:rest,targets:inPlay(S),card:c,apply:(e,t)=>{t.en.push(e);fx('energy',t,e);fx('sync')}})}fx('sync');await shuffleDeck(sd);break}
  case'gravel':{const pool=S.hand.filter(isMon);if(!pool.length)break;const r=await ask(sd,'cards',{title:`Kembalikan s/d ${s.n} Pokémon dari tangan ke Deck`,cards:pool,max:s.n,card:c,pref:x=>wantPoke(sd)(x)<1?1:0});if(!r.length)break;
   r.forEach(x=>S.hand.splice(S.hand.indexOf(x),1));S.deck.push(...r);fx('sync');log(`${who(sd)} memperlihatkan ${r.map(cname).join(', ')} lalu mengembalikannya ke Deck`);
   const g=await pickDeck(sd,c,{title:`Pilih s/d ${r.length} Pokémon untuk tangan`,pred:isMon,max:r.length,pref:wantPoke(sd)});await toHand(sd,c,g);await shuffleDeck(sd);break}
  case'evoDeck':{const ok=m=>x=>isMon(x)&&x.from===m.card.n&&!x.ab,ms=inPlay(S).filter(m=>S.deck.some(ok(m)));if(!ms.length){await shuffleDeck(sd);break}
   const m=ms.length>1?await ask(sd,'mon',{title:'Pilih Pokémon-mu yang berevolusi',mons:ms,ctx:'target',sd,pref:x=>(x===S.active?2:0)+x.card.hp/100}):ms[0],r=await pickDeck(sd,c,{title:`Pilih kartu evolusi untuk ${cname(m.card)}`,pred:ok(m),max:1,pref:x=>x.hp});
   if(r.length){S.hand.push(r[0]);await evolveMon(sd,r[0],m)}await shuffleDeck(sd);break}   // evolveMon mengambil kartunya dari tangan
  case'heal2':{const el=heal2El(sd,s),amt=m=>s.full?m.dmg:s.alt&&ownerIs(m.card,s.alt.o)?s.alt.n:s.n;
   if(s.tgt==='all'){for(const x of s.both?[sd,o]:[sd])for(const m of inPlay(G[x]))if(el(m))heal(x,m,amt(m));break}
   const t=s.tgt==='active'?(S.active&&el(S.active)?S.active:null):await ask(sd,'mon',{title:`Pilih Pokémon-mu yang dipulihkan ${s.full?'sepenuhnya':s.n+' HP'}`,mons:inPlay(S).filter(el),ctx:'target',sd,cancel:!done,pref:m=>Math.min(amt(m),m.dmg)+(m===S.active?15:0)});
   if(!t){if(s.tgt!=='active')return'cancel';break}heal(sd,t,amt(t));last=t;break}
  case'lastEnDisc':if(last&&last.en.length){const es=await chooseEn(sd,last,1,`Pilih 1 Energi ${cname(last.card)} untuk dibuang`,c);es.forEach(e=>{last.en.splice(last.en.indexOf(e),1);S.discard.push(e)});fx('sync')}break;
  case'lastEnHand':if(last&&last.en.length){const es=last.en.splice(0);S.hand.push(...es);fx('sync');log(`${es.length} Energi ${cname(last.card)} kembali ke tangan`)}break;
  case'healPrev':if(prev&&inPlay(S).includes(prev)&&(!s.ex||rule(prev.card)))heal(sd,prev,s.n);break;
  case'prevEnToAct':if(prev&&prev.en.length&&S.active&&S.active!==prev){const es=await ask(sd,'cards',{title:`Pindahkan Energi sesukanya dari ${cname(prev.card)} ke ${cname(S.active.card)}`,cards:[...prev.en],max:prev.en.length,card:c,pref:()=>1});
   es.forEach(e=>{prev.en.splice(prev.en.indexOf(e),1);S.active.en.push(e);fx('energy',S.active,e)});fx('sync');if(es.length)log(`${who(sd)} memindahkan ${es.length} Energi ke ${cname(S.active.card)}`)}break;
  case'drawIf':{const ok=s.if==='oppPz'?E.prizes.length<=s.v:S.hand.length>=s.v,k=s.alt?(ok?s.alt:s.n):ok?s.n:0;if(k){const n=await drawShow(sd,k);log(`${who(sd)} mengambil ${n} kartu`)}break}
  case'drawUntil':{if(s.allO&&!inPlay(S).every(m=>ownerIs(m.card,s.allO)))break;const k=s.n-S.hand.length;if(k>0){const n=await drawShow(sd,k);log(`${who(sd)} mengambil ${n} kartu`)}break}
  case'drawPer':{const k=s.per==='oppBench'?E.bench.length:s.per==='oppMega'?inPlay(E).filter(m=>m.card.mega).length:E.hand.filter(isMon).length;if(k){const n=await drawShow(sd,k);log(`${who(sd)} mengambil ${n} kartu`)}break}
  case'shuffleHand':S.deck.push(...S.hand.splice(0));fx('sync');await shuffleDeck(sd);break;
  case'flipDraw':{const h=await flip(sd,cname(c),c.tx),n=await drawShow(sd,h?s.h:s.t);log(`${who(sd)} mengambil ${n} kartu`);break}
  case'lucian':{for(const x of[sd,o]){const T=G[x];T.deck.unshift(...shuf(T.hand.splice(0)))}fx('sync');for(const x of[sd,o]){const h=await flip(x,cname(c),c.tx),n=await drawShow(x,h?s.h:s.t);log(`${who(x)} mengambil ${n} kartu`)}break}
  case'redraw':{for(const x of[sd,o]){const T=G[x];T.deck.push(...T.hand.splice(0));fx('sync');await shuffleDeck(x)}let me=s.me,op=s.opp;if(s.tails&&!await flip(sd,cname(c),c.tx)){me=s.tails[0];op=s.tails[1]}
   const a=await drawShow(sd,me),b=await drawShow(o,op);log(`${who(sd)} mengambil ${a} kartu, ${who(o)} mengambil ${b} kartu`);break}
  case'discHand':if(S.hand.length){S.discard.push(...S.hand.splice(0));fx('sync');log(`${who(sd)} membuang semua Kartu Pegangan`)}break;
  case'discAny':if(S.hand.length){const r=await ask(sd,'cards',{title:'Buang kartu tangan sesukanya sebelum mengambil kartu (boleh tidak ada)',cards:[...S.hand],max:S.hand.length,card:c,okTx:'Buang',pref:()=>0});r.forEach(x=>{S.hand.splice(S.hand.indexOf(x),1);S.discard.push(x)});fx('sync');if(r.length)log(`${who(sd)} membuang ${r.length} kartu`)}break;
  case'discForDraw':{const pool=S.hand.filter(gp(sd,s.p));if(!pool.length)break;const r=await ask(sd,'cards',{title:`Buang s/d ${s.n} ${s.lb} dari tangan, ambil ${s.per} kartu untuk tiap kartu`,cards:pool,max:s.n,card:c,okTx:'Buang',pref:x=>wantPoke(sd)(x)<1?1:0});
   r.forEach(x=>{S.hand.splice(S.hand.indexOf(x),1);S.discard.push(x)});fx('sync');if(r.length){const n=await drawShow(sd,s.per*r.length);log(`${who(sd)} membuang ${r.length} kartu dan mengambil ${n} kartu`)}break}
  case'handBottom':{const r=await ask(sd,'cards',{title:`Pilih ${s.n} kartu tangan untuk ditaruh di bawah Deck`,cards:[...S.hand],min:s.n,max:s.n,card:c,cost:!done,okTx:'Taruh di bawah Deck',pref:x=>isEn(x)?2:1});if(!r||r.length<s.n)return'cancel';
   r.forEach(x=>S.hand.splice(S.hand.indexOf(x),1));S.deck.unshift(...r);fx('sync');log(`${who(sd)} menaruh ${s.n} kartu di bawah Deck`);break}
  case'handTop':{const k=Math.min(s.n,S.hand.length);if(!k)break;const r=await ask(sd,'cards',{title:`Pilih ${k} kartu tangan untuk ditaruh di atas Deck`,cards:[...S.hand],min:k,max:k,card:c,cost:!done,okTx:'Taruh di atas Deck',pref:x=>isEn(x)?1:0});if(!r||r.length<k)return'cancel';
   r.forEach(x=>S.hand.splice(S.hand.indexOf(x),1));S.deck.push(...r);fx('sync');log(`${who(sd)} menaruh ${k} kartu tangan di atas Deck`);break}
  case'endHand':S.endHand={tn:S.tn,n:s.n};break;   // dicek di akhir giliran (loop di engine)
  case'endTurn':S.endNow=1;break;   // actTrainer mengakhiri giliran
  case'millSelf':{const k=Math.min(s.n,S.deck.length);S.discard.push(...S.deck.splice(S.deck.length-k,k));fx('sync');log(`${who(sd)} membuang ${k} kartu teratas Deck`);break}
  case'prizeSwap':{const k=S.prizes.length;S.deck.unshift(...shuf(S.prizes.splice(0)));for(let i=0;i<k&&S.deck.length;i++)S.prizes.push(S.deck.pop());fx('sync');log(`${who(sd)} mengganti ${k} Kartu Point dengan kartu teratas Deck`);break}
  case'either':{const ia=!genWhy(sd,{g:s.a}),ib=!genWhy(sd,{g:s.b});if(!ia&&!ib)break;const k=ia&&ib?await ask(sd,'choice',{title:cname(c),tx:c.tx,opts:[gLabel(s.a),gLabel(s.b)],pref:()=>genUseful(sd,{g:s.a})?0:1}):ia?0:1;
   const r=await genTrainer(sd,c,k?s.b:s.a);if(r==='cancel')return'cancel';break}
  case'boostTurn':(S.boost=S.boost||[]).push({tn:S.tn,n:s.n,ex:s.ex,t:s.t,norule:s.norule});log(`${who(sd)}: serangan giliran ini +${s.n} kerusakan`);break;   // dibaca hitMon
  case'guardNext':(S.guard=S.guard||[]).push({tn:E.tn+1,n:s.n,t:s.t});log(`${who(sd)}: kerusakan dari serangan lawan berikutnya -${s.n}`);break;
  case'shieldOne':{const t=inPlay(S).length>1?await ask(sd,'mon',{title:'Pilih Pokémon-mu yang terlindung dari serangan Pokémon ex',mons:inPlay(S),ctx:'target',sd,pref:m=>(m===S.active?5:0)+mval(m)}):S.active;if(t){mx(t).shield={tn:E.tn+1,all:1,exOnly:s.exOnly};log(`${cname(t.card)} terlindung dari serangan Pokémon ex di giliran lawan berikutnya`)}break}
  case'noRetPoison':E.noRetP=E.tn+1;log(`Pokémon ${who(o)} yang Racun tidak bisa mundur di giliran berikutnya`);break;
  case'discTools':{let k=s.n;while(k-->0){const ms=[...inPlay(S),...inPlay(E)].filter(m=>m.tool&&(!DEC[sd].bot||ownerOf(m)===o));if(!ms.length)break;
    const t=await ask(sd,'mon',{title:`Pilih Pokémon yang Pokémon Tool-nya dibuang (${s.n-k}/${s.n})`,mons:ms,ctx:'target',sd,cancel:k<s.n-1||!done,pref:m=>ownerOf(m)===o?2:-1});if(!t){if(k===s.n-1&&!done)return'cancel';break}
    G[ownerOf(t)].discard.push(t.tool);log(`${cname(t.tool)} dibuang ke Trash`);t.tool=null;fx('sync')}await resolveKO();break}
  case'discToolSen':{const ms=inPlay(E).filter(m=>m.tool||m.en.some(e=>e.k==='senergy'));if(!ms.length)break;const t=ms.length>1?await ask(sd,'mon',{title:'Pilih Pokémon lawan: buang 1 Pokémon Tool dan 1 Energi Spesialnya',mons:ms,ctx:'target',sd:o,pref:m=>(m.tool?1:0)+(m.en.some(e=>e.k==='senergy')?1:0)+(m===E.active?.5:0)}):ms[0];
   if(t.tool){E.discard.push(t.tool);log(`${cname(t.tool)} dibuang ke Trash`);t.tool=null}const se=t.en.filter(e=>e.k==='senergy');if(se.length){const[e]=await chooseEn(sd,{en:se},1,'Pilih 1 Energi Spesial untuk dibuang',c);t.en.splice(t.en.indexOf(e),1);E.discard.push(e);log(`${cname(e)} dibuang ke Trash`)}fx('sync');await resolveKO();break}
  case'megaton':{for(const m of inPlay(E)){if(m.tool){E.discard.push(m.tool);m.tool=null}for(const e of m.en.filter(e=>e.k==='senergy')){m.en.splice(m.en.indexOf(e),1);E.discard.push(e)}}
   fx('sync');log('Pokémon Tool dan Energi Spesial lawan dibuang ke Trash');await dropStadium();await resolveKO();break}
  case'burnOne':{const opts=[];for(const m of inPlay(E)){if(m.tool)opts.push({c:m.tool,m});for(const e of m.en)if(e.k==='senergy')opts.push({c:e,m})}if(G.stadium)opts.push({c:G.stadium.card,st:1});if(!opts.length)break;
   const r=await ask(sd,'cards',{title:'Pilih 1 Pokémon Tool atau Energi Spesial lawan, atau Stadium, untuk dibuang',cards:opts.map(x=>x.c),min:1,max:1,card:c,okTx:'Buang',pref:x=>G.stadium&&x===G.stadium.card?(G.stadium.owner===sd?.1:1):2}),x=opts.find(q=>q.c===r[0])||opts[0];
   if(x.st)await dropStadium();else{if(x.m.tool===x.c)x.m.tool=null;else x.m.en.splice(x.m.en.indexOf(x.c),1);E.discard.push(x.c);log(`${cname(x.c)} dibuang ke Trash`);fx('sync')}await resolveKO();break}
  case'benchEnToAct':{const es=S.bench.flatMap(m=>m.en);if(!es.length||!S.active)break;const r=await ask(sd,'cards',{title:`Pilih s/d ${s.n} Energi di Pokémon Cadangan untuk dipindah ke ${cname(S.active.card)}`,cards:es,max:s.n,card:c,pref:()=>1});
   for(const e of r){const h=S.bench.find(m=>m.en.includes(e));h.en.splice(h.en.indexOf(e),1);S.active.en.push(e);fx('energy',S.active,e)}fx('sync');if(r.length)log(`${who(sd)} memindahkan ${r.length} Energi ke ${cname(S.active.card)}`);break}
  case'oppEnToHand':{const ms=inPlay(E).filter(m=>m.en.length);if(!ms.length)break;const t=ms.length>1?await ask(sd,'mon',{title:'Pilih Pokémon lawan yang 1 Energinya kembali ke tangan lawan',mons:ms,ctx:'target',sd:o,pref:m=>m.en.length+(m===E.active?2:0)}):ms[0];
   const[e]=await chooseEn(sd,t,1,'Pilih 1 Energi',c);t.en.splice(t.en.indexOf(e),1);E.hand.push(e);fx('sync');log(`${cname(e)} kembali ke tangan ${who(o)}`);break}
  case'oppSwitch':if(E.bench.length){const t=await ask(o,'mon',{title:`${who(sd)} memakai ${cname(c)}: pilih Pokémon Cadangan-mu yang maju`,mons:E.bench,ctx:'promote',sd:o});swapActive(o,t);log(`${who(o)} menukar Pokémon Bertarung dengan ${cname(t.card)}`)}break;   // lawan yang memilih
  case'oppStatus':if(E.active){for(const k of s.s){if(k==='poison'||k==='burn'){if(!condBlocked(E.active))E.active[k]=1}else setSp(E.active,o,k)}fx('sync');log(`${cname(E.active.card)} menjadi ${s.s.map(k=>CONDN[k]).join(' dan ')}`)}break;
  case'bothStatus':for(const x of[sd,o]){const m=G[x].active;if(m&&m.card.type!==s.not)setSp(m,x,s.s)}break;
  case'flipCtr':{if(await flip(sd,cname(c),c.tx)){const t=inPlay(E).length>1?await ask(sd,'mon',{title:`Letakkan ${s.h} Token Kerusakan pada 1 Pokémon lawan`,mons:inPlay(E),ctx:'target',sd:o,pref:m=>hp(m)<=10*s.h?100+(m.card.prize||1):-hp(m)/10}):E.active;if(t){t.dmg+=10*s.h;fx('hit',t.id,10*s.h,null,1);log(`${cname(t.card)} menerima ${s.h} Token Kerusakan`)}}
   else if(S.active){S.active.dmg+=10*s.t;fx('hit',S.active.id,10*s.t,null,1);log(`${cname(S.active.card)} menerima ${s.t} Token Kerusakan`)}await resolveKO();break}
  case'scoop':{const t=await ask(sd,'mon',{title:'Pilih Pokémon-mu yang kembali ke tangan bersama semua kartunya',mons:inPlay(S),ctx:'target',sd,cancel:!done,pref:m=>(m===S.active?40:0)+m.dmg-mval(m)*10});if(!t)return'cancel';
   const wasAct=S.active===t;S.hand.push(...t.under,t.card,...t.en,...(t.tool?[t.tool]:[]));if(wasAct)S.active=null;S.bench=S.bench.filter(x=>x!==t);fx('sync');log(`${cname(t.card)} dan semua kartunya kembali ke tangan`);
   if(wasAct){const m=await ask(sd,'mon',{title:'Pilih Pokémon Cadangan yang maju',mons:S.bench,ctx:'promote',sd});swapActive(sd,m)}break}
  case'oppTopBench':{const k=Math.min(s.n,E.deck.length);if(!k)break;const cs=E.deck.slice(-k).reverse(),room=bmax(o)-E.bench.length;await fx('reveal',o,cs,c);
   const r=room>0&&cs.some(isBasic)?await ask(sd,'cards',{title:'Pilih Pokémon Basic sesukanya untuk Cadangan lawan',cards:cs,pick:isBasic,max:room,card:c,pref:x=>200-x.hp,from:'deck'}):[];
   cs.forEach(x=>E.deck.splice(E.deck.indexOf(x),1));r.forEach(x=>toBench(o,x));E.deck.push(...cs.filter(x=>!r.includes(x)));await shuffleDeck(o);log(`${r.length} Pokémon Basic masuk Cadangan ${who(o)}`);break}
  case'lookOppHand':if(sd==='p')await fx('lookHand',[...E.hand]);log(`${who(sd)} melihat Kartu Pegangan lawan`);break;
  case'oppHandPick':{if(sd==='p')await fx('lookHand',[...E.hand]);const pool=E.hand.filter(gp(sd,s.p));if(!pool.length)break;
   const r=await ask(sd,'cards',{title:`Pilih ${s.to==='discard'?'s/d ':''}${s.n} ${s.lb} dari tangan lawan untuk ${s.to==='discard'?'dibuang':'ditaruh di bawah Deck lawan'}`,cards:pool,all:E.hand,min:s.to==='bottom'?Math.min(s.n,pool.length):0,max:s.n,card:c,pref:()=>1});
   r.forEach(x=>{E.hand.splice(E.hand.indexOf(x),1);if(s.to==='discard')E.discard.push(x);else E.deck.unshift(x)});fx('sync');if(r.length)log(`${r.map(cname).join(', ')} dari tangan ${who(o)} ${s.to==='discard'?'dibuang':'ditaruh di bawah Deck'}`);break}
  case'ctrPick':for(let i=0;i<s.k;i++){const ts=inPlay(E).filter(t=>!effBlocked(t)&&!(stOp('stBenchSafe')&&t!==E.active));if(!ts.length)break;const t=ts.length>1?await ask(sd,'mon',{title:`Pilih Pokémon lawan yang menerima ${s.n} Token Kerusakan`,mons:ts,ctx:'target',sd:o,pref:x=>hp(x)<=10*s.n?1000+(x.card.prize||1)*10:-hp(x)}):ts[0];
   t.dmg+=10*s.n;fx('hit',t.id,10*s.n,null,1);log(`${cname(t.card)} menerima ${s.n} Token Kerusakan`)}await resolveKO();break;
  case'selfTo':await selfTo(sd,G.abMon,s.to);break;
  case'attachAny':await attachAny(sd,s,G.abMon,c);break;
  case'promoteSelf':{const m=G.abMon;if(m&&S.bench.includes(m)){swapActive(sd,m);log(`${cname(m.card)} maju ke Arena Bertarung`)}break}
  case'bothDraw':for(const x of[sd,o]){const n=await drawShow(x,s.n);log(`${who(x)} mengambil ${n} kartu`)}break;
  case'dropStadium':await dropStadium();break;
  case'toolSelf':{const m=G.abMon;if(m&&!m.tool){const r=await pickDeck(sd,c,{title:'Pilih 1 Pokémon Tool untuk dipasang',pred:x=>x.k==='tool',max:1,pref:()=>1});if(r.length){m.tool=r[0];log(`${who(sd)} memasang ${cname(r[0])} ke ${cname(m.card)}`);fx('sync')}}await shuffleDeck(sd);break}
  case'oppRedraw':{const k=E.hand.length;E.deck.unshift(...shuf(E.hand.splice(0)));fx('sync');const n=await drawShow(o,k);log(`${who(o)} menaruh ${k} kartu tangan di bawah Deck lalu mengambil ${n} kartu`);break}
  case'discTo':for(const x of s.both?[o,sd]:[o]){const T=G[x],k=T.hand.length-s.n;if(k<=0)continue;   // lawan lebih dulu; tiap pemain memilih kartunya sendiri
   const r=await ask(x,'cards',{title:`${cname(c)}: buang ${k} kartu dari tanganmu hingga tersisa ${s.n}`,cards:[...T.hand],min:k,max:k,card:c,okTx:'Buang',pref:h=>isEn(h)?3:isMon(h)?1:2});
   r.forEach(h=>{T.hand.splice(T.hand.indexOf(h),1);T.discard.push(h)});fx('sync');log(`${who(x)} membuang ${r.length} kartu`)}break}
  if(!NOFX.has(s.op))done++}}
/* Ability umum yang dipakai (1x/giliran) atau saat berevolusi dari tangan (evo=1): langkahnya sama dengan Trainer umum */
const ABTRIG=new Set(['once','onEvo','onBench','selfKO']),abFx=m=>(m.card.ab.g||[]).filter(s=>!ABTRIG.has(s.op));   // pemicu vs langkah efek
AB.gen={why:(sd,m,evo)=>{const S=G[sd],g=m.card.ab.g||[],tr=g.find(s=>s.op==='once')||{};if(abOff(m))return'Ability tidak aktif karena Stadium';if(!evo&&!tr.many&&m.used.gen)return'Sudah dipakai giliran ini';
 if(tr.pos==='act'&&S.active!==m)return'Hanya saat Pokémon ini di Arena Bertarung';if(tr.pos==='bench'&&S.active===m)return'Hanya saat Pokémon ini di Cadangan';return genWhy(sd,{g:abFx(m)})},
 async run(sd,m){G.abMon=m;try{const r=await genTrainer(sd,m.card,abFx(m));if(r==='cancel')return'cancel';m.used.gen=1;   // G.abMon: "Pokémon ini" untuk langkah efek
  if(m.card.ab.g.some(s=>s.op==='selfKO')&&inPlay(G[sd]).includes(m)){m.dmg=Math.max(m.dmg,maxHp(m));log(`${cname(m.card)} KO karena Ability-nya sendiri`);fx('sync');await resolveKO()}}finally{G.abMon=null}}};
/* Stadium yang efeknya dipakai pemain (1x per giliran, kedua pemain); langkahnya sama dengan Trainer umum */
const stUseOf=()=>G&&G.stadium&&(G.stadium.card.g||[]).find(s=>s.op==='stUse');
function whyStadium(sd){const u=stUseOf(),S=G[sd];if(!u)return'Stadium ini tidak punya efek yang bisa dipakai';if(G.cur!==sd)return'Bukan giliranmu';if(S.used.stad)return'Efek Stadium sudah dipakai giliran ini';
 if(u.sup&&!(S.supPlayed&&(!u.supName||cname(S.supPlayed).includes(u.supName))))return u.supName?`Mainkan Supporter ${u.supName} dulu giliran ini`:'Mainkan Supporter dulu giliran ini';return genWhy(sd,{g:u.g})}
async function actStadium(sd){const w=whyStadium(sd);if(w)return w;const S=G[sd],c=G.stadium.card;log(`${who(sd)} memakai efek Stadium ${cname(c)}`);
 const r=await genTrainer(sd,c,stUseOf().g);if(r==='cancel'){log('Dibatalkan');return}S.used.stad=1;fx('sync');if(S.endNow&&!DEC[sd].bot){log('Giliran berakhir karena efek Stadium');finishTurn()}}
/* Bot: Trainer umum dipakai bila masuk akal */
function genUseful(sd,c){const S=G[sd],E=G[opp(sd)],a=S.active,canHit=()=>a&&a.card.atk.some((_,k)=>!whyAttack(sd,k));for(const s of c.g){
 if(s.op==='costDiscard'&&S.hand.length<s.n+3)return false;
 if((s.op==='draw'||s.op==='shuffleDraw')&&S.hand.length>5)return false;
 if(s.op==='discardDraw'&&S.hand.length>3)return false;
 if(s.op==='search'&&!S.deck.some(SRCP[s.what]))return false;
 if(s.op==='callBasic'&&S.bench.length>=Math.min(4,bmax(sd)))return false;
 if(s.op==='switch'&&!(a&&!canHit()&&S.bench.some(m=>ownerIs(m.card,s.o)&&m.card.atk.some(t=>afford(m,t.cost)))))return false;
 if(s.op==='gust'&&!(a&&E.bench.some(t=>(!s.p||gm(sd,s.p)(t))&&a.card.atk.some((x,k)=>!whyAttack(sd,k)&&dmgOf(a,k)>=hp(t)))))return false;
 if((s.op==='healOne'||s.op==='healActive'||s.op==='healCure')&&!inPlay(S).some(m=>m.dmg>=30||conds(m).length))return false;
 if(s.op==='bothShuffleDraw'&&S.hand.length>4)return false;
 if(s.op==='moveEnOwn'&&!(a&&!canHit()))return false;
 if(s.op==='flipIf'&&!genUseful(sd,{g:s.then}))return false;
 if((s.op==='recover'||s.op==='recov')&&S.hand.length>6)return false;
 if(['endTurn','prizeSwap','millSelf','scoop','gravel','handTop'].includes(s.op)||s.op==='find'&&(s.to==='discard'||s.to==='top'))return false;   // butuh pertimbangan, Bot tidak memakainya
 if(['shuffleHand','redraw','lucian','discHand'].includes(s.op)&&S.hand.length>4)return false;
 if(s.op==='oppRedraw'&&E.hand.length<5)return false;
 if(s.op==='drawUntil'&&!s.allO&&S.hand.length>=s.n-1)return false;
 if(s.op==='discTo'&&(s.both?S.hand.length>s.n+1:E.hand.length<=s.n))return false;
 if(s.op==='heal2'&&!(s.tgt==='all'?inPlay(S).filter(m=>heal2El(sd,s)(m)&&m.dmg>=30).length>=2:inPlay(S).some(m=>heal2El(sd,s)(m)&&m.dmg>=40)))return false;
 if(s.op==='boostTurn'&&!(canHit()&&(!s.ex||E.active&&rule(E.active.card))&&(!s.t||a.card.type===s.t)&&(!s.norule||!rule(a.card))))return false;
 if(s.op==='guardNext'&&s.t&&!(a&&a.card.type===s.t))return false;
 if(s.op==='shieldOne'&&!(E.active&&rule(E.active.card)))return false;
 if(s.op==='handBottom'&&S.hand.length<5)return false;
 if(s.op==='either'&&!genUseful(sd,{g:s.a})&&!genUseful(sd,{g:s.b}))return false;
 if(s.op==='discTools'&&!inPlay(E).some(m=>m.tool))return false;
 if(s.op==='oppTopBench'&&E.bench.length>=3)return false;
 if(s.op==='bothStatus'&&a&&a.card.type!==s.not)return false;
 if(s.op==='evoDeck'&&!inPlay(S).some(m=>S.deck.some(x=>isMon(x)&&x.from===m.card.n&&!x.ab)))return false;
 if(s.op==='discForDraw'&&!S.hand.some(x=>gp(sd,s.p)(x)&&wantPoke(sd)(x)<1))return false;
 if(s.op==='find'&&!S.deck.some(gp(sd,s.p)))return false;
 if(s.op==='look'&&s.to==='bench'&&S.bench.length>=bmax(sd))return false;
 if(s.op==='benchEnToAct'&&!(a&&!canHit()))return false;
 if(s.op==='flipCtr'&&!a||s.op==='selfKO')return false}
 return true}
/* ---------- efek pasif: Pokémon Tool, Energi Spesial, Stadium (kartu H/I/J) ----------
   Dibaca mesin di titik hitung: HP maksimum, Energi yang disediakan, biaya serangan/mundur, damage (hitMon), KO & Kartu Point. */
const stOps=op=>G&&G.stadium&&G.stadium.card.g?G.stadium.card.g.filter(s=>s.op===op):[],stOp=op=>stOps(op)[0];
const toolsOff=()=>!!stOp('stToolsOff');
const ownerIs=(c,o)=>!o||(c.ni||c.n||'').includes('<'+o+'>');
const tOps=(m,op)=>m&&m.tool&&m.tool.g&&!toolsOff()?m.tool.g.filter(s=>s.op===op):[];
const enOps=(m,op)=>m?m.en.filter(e=>e.g).flatMap(e=>e.g.filter(s=>s.op===op).map(s=>({...s,card:e}))):[];
const abOff=m=>stOps('stNoAb').some(s=>m.card.type===s.t);   // Stadium yang menghapus Ability tipe tertentu
function maxHp(m){let h=m.card.hp;for(const s of tOps(m,'hpUp'))if(ownerIs(m.card,s.o)&&(!s.t||m.card.type===s.t))h+=s.n;for(const s of enOps(m,'hpUp'))if(!s.t||m.card.type===s.t)h+=s.n;for(const s of stOps('stHp'))if(s.stage===m.card.stage)h+=s.n;return h}
function senProv(c,m){let out=['C'];for(const s of c.g){if(s.op==='provIf'&&(s.stage!=null&&m.card.stage===s.stage||s.evo&&m.card.stage>0))return Array(s.n).fill(s.t);if(s.op==='prov')out=Array(s.n).fill(s.t)}return out}
function atkCost(m,cost){const td=tOps(m,'costDown'),oa=G&&G.p&&G[opp(ownerOf(m))].active,up=m.card.stage===0&&!!pab(oa,'pOppBasicCost');if(!td.length&&!up&&!(m.card.tera&&stOp('stTeraCost')))return cost;let c=cost;const sd=ownerOf(m),S=G[sd],E=G[opp(sd)],drop=any=>{const i=c.indexOf('C');c=i>=0?c.slice(0,i)+c.slice(i+1):any?c.slice(0,-1):c};
 for(const s of td){if(s.if==='behind'&&!(S.prizes.length>E.prizes.length)||s.tera&&!m.card.tera||!ownerIs(m.card,s.o))continue;drop(s.any)}
 if(stOp('stTeraCost')&&m.card.tera)c+='C';if(up)c+='C';return c}   // up: Ability lawan (Fosil Akar Usang) +1 Energi untuk Pokémon Basic
function retMod(m,r){if(G&&G.p){const A=[G.p.active,G.o.active];if(A.includes(m))r+=A.filter(a=>tOps(a,'gravity').length).length}
 for(const s of stOps('stFreeRet'))if(ownerIs(m.card,s.o)&&s.o)r=0;for(const s of stOps('stRetDown'))if(m.card.n===s.name)r-=s.n;return r}
const condBlocked=m=>!!(m.card.fossil||stOp('stNoCondEn')&&m.en.length);   // fosil & Lokasi Festival: tidak bisa terkena Kondisi Khusus
const noEffFrom=m=>!!(pab(m,'pNoEff')||pab(m,'pBenchSafe')&&!pab(m,'pBenchSafe').dmgOnly&&G[ownerOf(m)].active!==m||enOps(m,'senNoEff').some(s=>!s.t||m.card.type===s.t));
/* Pokémon Basic masuk Cadangan di giliran sendiri (Reruntuhan Berbahaya) */
function benchPlaced(sd,m){const s=stOp('stBenchCtr');if(s&&G.cur===sd&&m.card.type!==s.not&&isBasic(m.card)){m.dmg+=10*s.n;fx('hit',m.id,10*s.n,null,1);log(`${cname(m.card)} menerima ${s.n} Token Kerusakan (Stadium)`)}}
/* pemicu saat Pokémon Bertarung terkena damage serangan lawan: Tool & Energi Spesial */
async function onHitFx(def,defSd,att){const asd=opp(defSd),D=G[defSd],A=G[asd];
 for(const s of[...tOps(def,'onHit'),...enOps(def,'onHit')]){if(s.o&&!ownerIs(def.card,s.o))continue;if(s.weakMatch&&def.card.weak!==att.card.type)continue;
  if(s.draw){const n=await drawShow(defSd,s.draw);log(`${cname(def.card)}: ${who(defSd)} mengambil ${n} kartu`)}
  if(s.ctr){await fx('pause');att.dmg+=10*s.ctr;fx('hit',att.id,10*s.ctr,null,1);log(`${cname(def.card)}: ${cname(att.card)} menerima ${s.ctr} Token Kerusakan`)}
  if(s.status){if(s.status==='poison')att.poison=1;else if(s.status==='burn')att.burn=1;else setSp(att,asd,s.status);fx('sync')}
  if(s.moveAtkEn&&att.en.length&&A.bench.length){const[e]=await chooseEn(defSd,att,1,`Pilih 1 Energi ${cname(att.card)} untuk dipindah`,def.tool),t=await ask(defSd,'mon',{title:'Pindahkan 1 Energi penyerang ke Pokémon Cadangan lawan',mons:A.bench,ctx:'target',sd:asd,pref:x=>-x.en.length});att.en.splice(att.en.indexOf(e),1);t.en.push(e);fx('sync');log(`Energi ${cname(att.card)} dipindah ke ${cname(t.card)}`)}
  if(s.discard&&def.tool&&s.card===undefined){D.discard.push(def.tool);log(`${cname(def.tool)} dibuang ke Trash`);def.tool=null;fx('sync')}}}
/* pengurangan Kartu Point yang diambil lawan (Tool pemilik tertentu / Energi Legasi 1x per permainan) */
function prizeCut(m,sd){let n=0;for(const s of tOps(m,'prizeMinus'))if(ownerIs(m.card,s.o))n++;
 for(const s of enOps(m,'prizeMinus'))if(!s.once||!G[sd].legacyUsed){n++;if(s.once)G[sd].legacyUsed=1}return Math.min(1,n)}
/* Bot: Tool/Energi Spesial hanya ke Pokémon yang cocok syaratnya (pemilik, nama, tipe, Terastal) */
const fitFor=(c,m)=>!(c.g||[]).some(s=>(s.o&&s.op!=='onHit'||s.op==='onlyOwner')&&!ownerIs(m.card,s.o)||s.name&&m.card.n!==s.name||s.ht&&m.card.type!==s.ht||s.tera&&!m.card.tera||s.op==='hpUp'&&s.t&&m.card.type!==s.t);
async function onKOFx(m,sd){for(const s of tOps(m,'onKO'))if(s.search)await genSearch(sd,m.tool,{n:s.search,what:'any'})}
async function onAttachFx(sd,c,m){const S=G[sd];for(const s of c.g||[]){
 if(s.op==='onlyOwner'&&!ownerIs(m.card,s.o)){m.en.splice(m.en.indexOf(c),1);S.discard.push(c);log(`${cname(c)} dibuang: hanya untuk Pokémon ${s.o}`);fx('sync');return}
 if(s.op==='onAttach'&&s.draw){const n=await drawShow(sd,s.draw);log(`${who(sd)} mengambil ${n} kartu (${cname(c)})`)}
 if(s.op==='onAttach'&&s.call&&m.card.type===s.t){const r=await pickDeck(sd,c,{title:`Pilih s/d ${s.call} Pokémon Basic ${TYPES[s.t][0]} untuk Cadangan`,pred:x=>isBasic(x)&&x.type===s.t,max:Math.min(s.call,bmax(sd)-S.bench.length),pref:x=>x.hp});r.forEach(x=>toBench(sd,x));await shuffleDeck(sd)}}}
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
 const T=Object.keys(CARDS).filter(k=>{const c=CARDS[k];return isTrainer(c)&&!c.hide&&c.k!=='stadium'&&c.k!=='tool'&&!c.ace&&c.g&&!c.fossil});
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
