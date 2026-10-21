// Tes mesin aturan tanpa browser: node tests/engine.test.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = vm.createContext({ console, setTimeout, Math, Promise });
const load = f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
load('js/cards.js'); load('js/engine.js');
const run = code => vm.runInContext(code, ctx);
const assert = (c, m) => { if (!c) { console.error('GAGAL:', m); process.exitCode = 1 } else console.log('ok -', m) };

(async () => {
  // 1) bot lawan bot: semua pertandingan harus selesai tanpa error
  const res = await run(`(async()=>{const out={};const decks={tera:TERA_DECK,dark:USER_DECK};
    for(const [a,b] of [['tera','dark'],['dark','tera'],['tera','tera']])for(let i=0;i<25;i++){
      DEC.p={...BOT,turn:s=>botTurn(s)};DEC.o={...BOT,turn:s=>botTurn(s)};
      const r=await Promise.race([setup(decks[a],decks[b]),sleep(20000).then(()=>'timeout')]);
      const k=a+'-'+b+':'+r;out[k]=(out[k]||0)+1}
    return out})()`);
  console.log(res);
  assert(!Object.keys(res).some(k => k.endsWith('timeout') || k.endsWith('undefined')), '75 pertandingan bot selesai');

  // pertandingan kecil yang dikendalikan manual untuk cek aturan
  const fresh = run(`()=>{G={p:newSide('p',{}),o:newSide('o',{}),cur:'p',first:'p',phase:'play',over:0,log:[],stadium:null,prizeN:6};
    G.p.tn=G.o.tn=2;for(let i=0;i<10;i++){G.p.prizes.push(mk('genergy'));G.o.prizes.push(mk('genergy'))}
    DEC.p={...BOT};DEC.o={...BOT};return G}`);
  const put = (sd, key, spot) => run(`(()=>{const m=mkMon(mk('${key}'),'${sd}');m.t=0;${spot === 'active' ? `G['${sd}'].active=m` : `G['${sd}'].bench.push(m)`};return m})()`);

  // 2) Terastal di Bench kebal damage serangan
  fresh(); ctx.att = put('o', 'fezan', 'active'); put('p', 'hoothoot', 'active'); ctx.t = put('p', 'terapagos', 'bench');
  let d = await run(`hitMon(att,t,'p',100)`);
  assert(d === 0 && ctx.t.dmg === 0, 'Terapagos ex di Bench tidak menerima damage');

  // 3) Crown Opal: tahan Pokémon Basic non-Normal di giliran lawan berikutnya
  fresh(); ctx.tp = put('p', 'terapagos', 'active'); put('o', 'sharpedo', 'active'); put('p', 'hoothoot', 'bench');
  run(`G.p.active.en.push(mk('genergy'),mk('wenergy'),mk('lenergy'));G.p.tn=3;G.o.tn=2;G.turnResolve=()=>{}`);
  await run(`actAttack('p',1)`);
  assert(run("G").o.active.dmg === 180, 'Crown Opal memberi 180 damage');
  run(`G.cur='o';G.o.tn=3;att=mkMon(mk('carvanha'),'o')`);
  d = await run(`hitMon(att,G.p.active,'p',120)`);
  assert(d === 0, 'Crown Opal menahan Carvanha (Basic Kegelapan)');
  run(`att=mkMon(mk('sharpedo'),'o')`); d = await run(`hitMon(att,G.p.active,'p',120)`);
  assert(d === 120, 'Crown Opal tidak menahan Stage 1 (Mega Sharpedo ex)');

  // 4) Union Beat = 30 × Bench, dan diblok di giliran pertama Pemain Kedua
  fresh(); put('p', 'terapagos', 'active'); for (let i = 0; i < 4; i++) put('p', 'hoothoot', 'bench'); put('o', 'sharpedo', 'active');
  run(`G.p.active.en.push(mk('genergy'),mk('wenergy'));G.turnResolve=()=>{}`);
  await run(`actAttack('p',0)`);
  assert(run("G").o.active.dmg === 120, 'Union Beat dengan 4 Bench = 120');
  run(`G.first='o';G.p.tn=1`);
  assert(run(`whyAttack('p',0)`) !== '', 'Union Beat diblok di giliran pertama Pemain Kedua');

  // 5) Gua Besar Zero: Bench 8 hanya bila ada Terastal; hilang → buang sampai 5
  fresh(); put('p', 'terapagos', 'active'); run(`G.stadium={card:mk('zero'),owner:'p'}`);
  assert(run(`bmax('p')`) === 8 && run(`bmax('o')`) === 5, 'Bench 8 untuk pemilik Terastal, 5 untuk lawan tanpa Terastal');
  for (let i = 0; i < 8; i++) put('p', 'hoothoot', 'bench');
  run(`G.stadium=null`); await run(`enforceBoth()`);
  assert(run("G").p.bench.length === 5, 'Stadium hilang: Bench dibuang sampai 5');

  // 6) Briar: +1 Prize saat Terastal meng-KO Active lawan
  fresh(); put('p', 'terapagos', 'active'); for (let i = 0; i < 5; i++) put('p', 'hoothoot', 'bench'); put('o', 'carvanha', 'active'); put('o', 'toxel', 'bench');
  run(`G.o.prizes.splice(2);G.p.prizes.splice(3);G.p.hand.push(mk('briar'));G.p.active.en.push(mk('genergy'),mk('wenergy'));G.turnResolve=()=>{}`);
  const before = run("G").p.prizes.length;
  await run(`actTrainer('p',G.p.hand.find(x=>x.key==='briar'))`);
  await run(`actAttack('p',0)`);
  assert(before - run("G").p.prizes.length === 2, 'Briar: KO Carvanha (1 Prize) jadi 2 Prize');

  // 7) Noctowl: Mencari Permata hanya jika ada Terastal
  fresh(); put('p', 'terapagos', 'active'); ctx.h = put('p', 'hoothoot', 'bench');
  run(`G.p.deck.push(mk('ultra'),mk('boss'),mk('genergy'));G.p.hand.push(mk('noctowl'))`);
  await run(`actEvolve('p',G.p.hand.find(x=>x.key==='noctowl'),h)`);
  assert(run("G").p.hand.filter(x => ['ultra', 'boss'].includes(x.key)).length === 2, 'Noctowl mengambil 2 Trainer');

  // 8) Fan Call: hanya giliran pertama, sekali per giliran
  fresh(); ctx.r = put('p', 'fanrotom', 'active'); run(`G.p.tn=1;G.p.deck.push(mk('hoothoot'),mk('terapagos'),mk('noctowl'))`);
  assert(run(`abWhy('p',r)`) === '', 'Fan Call bisa di giliran pertama');
  await run(`AB.fan.run('p',r)`);
  assert(run("G").p.hand.length === 2 && !run("G").p.hand.some(x => x.key === 'terapagos'), 'Fan Call ambil Pokémon Normal HP ≤100 (bukan Terapagos 230)');
  assert(run(`abWhy('p',r)`) !== '', 'Fan Call tidak bisa dua kali');
  run(`G.p.tn=2;G.p.used={}`); assert(run(`abWhy('p',r)`) !== '', 'Fan Call tidak bisa di giliran kedua');

  // 9) Noctowl opsional: kalau dilewati, tidak mencari Trainer
  fresh(); put('p', 'terapagos', 'active'); ctx.h = put('p', 'hoothoot', 'bench');
  run(`DEC.p={...BOT,confirm:async()=>false};G.p.deck.push(mk('ultra'),mk('boss'));G.p.hand.push(mk('noctowl'))`);
  await run(`actEvolve('p',G.p.hand.find(x=>x.key==='noctowl'),h)`);
  assert(!run("G").p.hand.some(x => ['ultra', 'boss'].includes(x.key)), 'Noctowl dilewati: tidak mengambil Trainer');

  // 10) Pokégear 3.0: panel berisi 7 kartu teratas, hanya Supporter yang bisa diambil; kartu diperlihatkan
  fresh(); ctx.seen = null; ctx.shown = [];
  run(`G.p.deck.push(mk('boss'),...Array.from({length:7},()=>mk('ultra')));G.p.deck.splice(-1,1,mk('lillie'))`);
  run(`DEC.p={...BOT,cards:o=>{seen=o;return BOT.cards(o)}};FX.reveal=async(sd,r)=>{shown.push(...r.map(x=>x.key))}`);
  await run(`EFF.pokegear('p',mk('pokegear'))`);
  assert(ctx.seen.cards.length === 7, 'Pokégear menampilkan 7 kartu teratas');
  assert(run("G").p.hand.length === 1 && run("G").p.hand[0].key === 'lillie' && !run("G").p.hand.some(x => x.key === 'boss'), 'Pokégear hanya mengambil Supporter dari 7 teratas (Boss di urutan 8 tidak)');
  assert(ctx.shown.join() === 'lillie', 'Kartu yang diambil diperlihatkan ke lawan');
  run(`delete FX.reveal`);

  // 11) Fezandipiti ex: KO karena Poison saat Checkup tidak dihitung "di giliran lawan"
  fresh(); put('p', 'fezan', 'bench'); ctx.v = put('p', 'carvanha', 'active'); put('p', 'toxel', 'bench'); put('o', 'hoothoot', 'active');
  run(`G.cur='o';v.dmg=60;v.poison=1`);
  await run(`checkup()`);
  assert(run("G").p.koMark === 0, 'KO karena Poison saat Checkup tidak memicu Kesempatan dalam Kesempitan');
  fresh(); put('p', 'fezan', 'bench'); ctx.v = put('p', 'carvanha', 'active'); put('p', 'toxel', 'bench'); put('o', 'hoothoot', 'active');
  run(`G.cur='o';v.dmg=70`); await run(`resolveKO()`);
  assert(run("G").p.koMark === 1, 'KO karena serangan di giliran lawan tetap memicu Kesempatan dalam Kesempitan');
})().catch(e => { console.error(e); process.exitCode = 1 });
