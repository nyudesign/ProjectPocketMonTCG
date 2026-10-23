/* ===== DATA KARTU (dibaca dari gambar ZIP) ===== */
const CARDS={
cinderace:{n:'Cinderace',ni:'Cinderace',k:'pokemon',type:'R',hp:160,stage:2,from:'Raboot',weak:'W',retreat:0,img:16515,mark:'I',
 ab:{key:'zip',n:'Kecepatan Seketika',tx:'Jika ada di tangan saat Persiapan, boleh ditaruh tertutup sebagai Active.',setup:1},
 atk:[{n:'Flare Turbo',cost:'C',dmg:50,fx:'turbo',tx:'Ambil s/d 3 Energi Dasar dari Deck, pasang sesukamu ke Pokémon Bench, kocok Deck.'}]},
munkidori:{n:'Munkidori',ni:'Munkidori',k:'pokemon',type:'P',hp:110,stage:0,weak:'D',res:'F',retreat:1,img:19026,mark:'H',
 ab:{key:'adr',n:'Adrenaline Brain',tx:'1x/giliran, jika punya Energi Kegelapan: pindahkan s/d 3 damage counter dari 1 Pokémonmu ke 1 Pokémon lawan.'},
 atk:[{n:'Psychotrip',cost:'PC',dmg:60,fx:'conf',tx:'Active lawan menjadi Confused.'}]},
carvanha:{n:'Carvanha',ni:'Carvanha',k:'pokemon',type:'D',hp:70,stage:0,weak:'G',retreat:1,img:16761,mark:'I',
 atk:[{n:'Menyerang',cost:'D',dmg:30,fx:'self10',tx:'Pokémon ini juga menerima 10 damage.'}]},
sharpedo:{n:'Mega Sharpedo ex',ni:'Mega Sharpedo ex',k:'pokemon',type:'D',hp:330,stage:1,from:'Carvanha',weak:'G',retreat:0,prize:3,mega:1,img:16762,mark:'I',
 atk:[{n:'Taring Rakus',cost:'D',dmg:70,fx:'draw2',tx:'Ambil 2 kartu dari Deck.'},{n:'Hungry Jaw',cost:'DD',dmg:120,plus:1,fx:'jaw',tx:'Jika Pokémon ini punya damage counter, +150 damage.'}]},
fezan:{n:'Fezandipiti ex',ni:'Fezandipiti ex',k:'pokemon',type:'D',hp:210,stage:0,weak:'F',retreat:1,prize:2,img:19032,mark:'H',
 ab:{key:'chance',n:'Kesempatan dalam Kesempitan',tx:'1x/giliran, jika Pokémonmu ada yang KO di giliran lawan sebelumnya: ambil 3 kartu.',once:1},
 atk:[{n:'Cruel Arrow',cost:'CCC',dmg:100,fx:'arrow',tx:'100 damage ke 1 Pokémon lawan (Weakness/Resistance Bench tidak berlaku).'}]},
pecharunt:{n:'Pecharunt ex',ni:'Pecharunt ex',k:'pokemon',type:'D',hp:190,stage:0,weak:'F',retreat:1,prize:2,img:19033,mark:'H',
 ab:{key:'chain',n:'Rantai Dominasi',tx:'1x/giliran: tukar Active dengan Pokémon Kegelapan di Bench (selain Pecharunt ex); Active baru menjadi Poisoned.',once:1},
 atk:[{n:'Ledakan Marah-marah',cost:'DD',dmg:60,times:1,fx:'ledak',tx:'60 damage untuk tiap Prize yang sudah diambil lawan.'}]},
toxel:{n:'Toxel',ni:'Toxel',k:'pokemon',type:'D',hp:70,stage:0,weak:'F',retreat:1,img:19030,mark:'I',
 atk:[{n:'Memanggil Teman',cost:'D',dmg:0,fx:'call',tx:'Cari s/d 2 Pokémon Basic dari Deck, taruh di Bench, kocok Deck.'},{n:'Tendangan Nakal',cost:'DC',dmg:20,fx:'plain',tx:''}]},
toxtricity:{n:'Toxtricity',ni:'Toxtricity',k:'pokemon',type:'D',hp:140,stage:1,from:'Toxel',weak:'F',retreat:2,img:19031,mark:'I',
 ab:{key:'upper',n:'Bad Upper',tx:'1x/giliran: ambil 1 Energi Dasar Kegelapan dari Deck, pasang ke Pokémon Kegelapan di Bench, kocok; Pokémon itu menerima 20 damage.'},
 atk:[{n:'Menepuk',cost:'DDC',dmg:100,fx:'plain',tx:''}]},
minccino:{n:'Minccino',ni:'Minccino',k:'pokemon',type:'C',hp:70,stage:0,weak:'F',retreat:1,img:18797,mark:'J',
 atk:[{n:'Menerjang',cost:'C',dmg:30,fx:'self10',tx:'Pokémon ini juga menerima 10 damage.'}]},
cinccino:{n:'Cinccino ex',ni:'Cinccino ex',k:'pokemon',type:'C',hp:240,stage:1,from:'Minccino',weak:'F',retreat:1,prize:2,img:18798,mark:'J',
 ab:{key:'smooth',n:'Lapisan Mulus',tx:'Saat menerima damage serangan, lempar koin; Kepala = damage dicegah.',passive:1},
 atk:[{n:'Tamparan Energi',cost:'C',dmg:40,times:1,fx:'en40',tx:'40 damage untuk tiap Energi di Pokémon ini.'}]},
poffin:{n:'Buddy-Buddy Poffin',ni:'Poffin Bersahabat',k:'item',img:17391,tx:'Cari s/d 2 Pokémon Basic HP ≤70 dari Deck, taruh di Bench, kocok Deck.'},
eretrieval:{n:'Energy Retrieval',ni:'Pemulihan Energi',k:'item',img:13925,tx:'Ambil s/d 2 Energi Dasar dari discard ke tangan.'},
stretcher:{n:'Night Stretcher',ni:'Tandu Malam',k:'item',img:14355,tx:'Ambil 1 Pokémon atau Energi Dasar dari discard ke tangan.'},
pad:{n:'Poké Pad',ni:'PokéPad',k:'item',img:18382,tx:'Cari 1 Pokémon (tanpa Rule Box) dari Deck ke tangan, kocok Deck.'},
prime:{n:'Prime Catcher',ni:'Prime Catcher',k:'item',ace:1,img:19037,tx:'Tarik 1 Pokémon Bench lawan ke Active, lalu tukar Active-mu dengan Pokémon Bench-mu. (ACE SPEC)'},
redcard:{n:'Special Red Card',ni:'Kartu Merah Spesial',k:'item',img:19082,tx:'Hanya jika Prize lawan ≤3: lawan kocok tangannya ke bawah Deck, lalu ambil 3 kartu.'},
ultra:{n:'Ultra Ball',ni:'Bola Ultra',k:'item',img:10061,tx:'Buang 2 kartu lain dari tangan; cari 1 Pokémon dari Deck ke tangan, kocok Deck.'},
boss:{n:"Boss's Orders",ni:'Perintah Bos',k:'supporter',img:10515,tx:'Tarik 1 Pokémon Bench lawan ke Active.'},
hilda:{n:'Hilda',ni:'Hilda',k:'supporter',img:16307,tx:'Cari 1 Pokémon Evolusi dan 1 Energi dari Deck, tunjukkan, ambil ke tangan, kocok Deck.'},
iris:{n:"Iris's Fighting Spirit",ni:'Semangat Tarung Iris',k:'supporter',img:17488,tx:'Buang 1 kartu lain dari tangan; ambil kartu hingga tangan berisi 6.'},
lillie:{n:"Lillie's Determination",ni:'Ketetapan Hati Lillie',k:'supporter',img:17491,tx:'Kocok tangan ke Deck, ambil 6 kartu (8 jika tepat 6 Prize tersisa).'},
balloon:{n:'Air Balloon',ni:'Balon',k:'tool',img:19064,tx:'Retreat cost Pokémon pemegang berkurang 2.'},
helmet:{n:'Punk Helmet',ni:'Helm Punk',k:'tool',img:19040,tx:'Jika Pokémon Kegelapan pemegang di Active terkena damage serangan lawan, taruh 4 damage counter pada penyerang.'},
prism:{n:'Prism Energy',ni:'Energi Prisma',k:'senergy',img:16311,mark:'I',tx:'Dihitung 1 Energi ✱. Di Pokémon Basic, berlaku sebagai Energi semua tipe.'},
denergy:{n:'Basic Darkness Energy',ni:'Energi Dasar Kegelapan',k:'energy',t:'D',img:19046,tx:'Energi Dasar tipe Kegelapan.'},
/* ----- archetype Tera: Terapagos ex (sv7s Stellar Miracle, mark H) ----- */
terapagos:{n:'Terapagos ex',ni:'Terapagos ex',k:'pokemon',type:'C',hp:230,stage:0,weak:'F',retreat:2,prize:2,tera:1,img:14349,mark:'H',
 atk:[{n:'Union Beat',cost:'CC',dmg:30,times:1,fx:'union',tx:'Tidak dapat dipakai di giliran pertama Pemain Kedua. 30 damage untuk tiap Pokémon Bench-mu.'},{n:'Crown Opal',cost:'GWL',dmg:180,fx:'opal',tx:'Di giliran lawan berikutnya, Pokémon ini tidak menerima damage serangan dari Pokémon Basic (selain tipe Normal).'}]},
hoothoot:{n:'Hoothoot',ni:'Hoothoot',k:'pokemon',type:'C',hp:70,stage:0,weak:'L',res:'F',retreat:1,img:14334,mark:'H',
 atk:[{n:'Menusuk Tiga Kali',cost:'C',dmg:10,times:1,fx:'flip3',tx:'Lempar koin 3 kali. 10 damage untuk tiap Kepala.'}]},
noctowl:{n:'Noctowl',ni:'Noctowl',k:'pokemon',type:'C',hp:100,stage:1,from:'Hoothoot',weak:'L',res:'F',retreat:1,img:14335,mark:'H',
 ab:{key:'jewel',n:'Mencari Permata',tx:'Saat kartu ini dimainkan dari tangan untuk berevolusi, jika ada Pokémon Terastal di Arena-mu: cari s/d 2 Trainer dari Deck ke tangan, kocok Deck.',passive:1},
 atk:[{n:'Speed Wing',cost:'CC',dmg:60,fx:'plain',tx:''}]},
fanrotom:{n:'Fan Rotom',ni:'Rotom Kipas',k:'pokemon',type:'C',hp:70,stage:0,weak:'L',res:'F',retreat:1,img:14338,mark:'H',
 ab:{key:'fan',n:'Fan Call',tx:'Hanya di giliran pertamamu, 1x: cari s/d 3 Pokémon Normal HP ≤100 dari Deck ke tangan, kocok Deck. Tidak bisa jika Fan Call lain sudah dipakai giliran ini.'},
 atk:[{n:'Pendaratan Menyerang',cost:'C',dmg:70,fx:'landing',tx:'Jika tidak ada Stadium di Arena, serangan ini gagal.'}]},
briar:{n:'Briar',ni:'Briar',k:'supporter',img:14370,tx:'Hanya jika Prize lawan tersisa 2. Giliran ini, jika Active lawan KO karena damage serangan Pokémon Terastal-mu, ambil 1 Prize tambahan.'},
pokegear:{n:'Pokégear 3.0',ni:'Pokégear 3.0',k:'item',img:16301,tx:'Lihat 7 kartu teratas Deck, ambil 1 Supporter di antaranya ke tangan, kocok sisanya ke Deck.'},
zero:{n:'Area Zero Underdepths',ni:'Gua Besar Zero',k:'stadium',bench8:1,img:14372,mark:'H',tx:'Pemain yang punya Pokémon Terastal di Arena boleh punya 8 Pokémon di Bench. Jika Stadium ini hilang atau Terastal-nya tidak ada lagi, buang Bench hingga 5 (pemilik Stadium lebih dulu).'},
genergy:{n:'Basic Grass Energy',ni:'Energi Dasar Rumput',k:'energy',t:'G',img:14507,tx:'Energi Dasar tipe Rumput.'},
wenergy:{n:'Basic Water Energy',ni:'Energi Dasar Air',k:'energy',t:'W',img:14668,tx:'Energi Dasar tipe Air.'},
lenergy:{n:'Basic Lightning Energy',ni:'Energi Dasar Listrik',k:'energy',t:'L',img:14522,tx:'Energi Dasar tipe Listrik.'},
/* ----- archetype Dragapult ex (sv6 Twilight Masquerade, mark H) ----- */
dreepy:{n:'Dreepy',ni:'Dreepy',k:'pokemon',type:'N',hp:70,stage:0,retreat:1,img:13749,mark:'H',
 atk:[{n:'Mendendam Sedikit',cost:'P',dmg:10,fx:'plain',tx:''},{n:'Menggigit',cost:'RP',dmg:40,fx:'plain',tx:''}]},
drakloak:{n:'Drakloak',ni:'Drakloak',k:'pokemon',type:'N',hp:90,stage:1,from:'Dreepy',retreat:1,img:13750,mark:'H',
 ab:{key:'recon',n:'Perintah Rekonaisans',tx:'1x/giliran: lihat 2 kartu teratas Deck, ambil 1 ke tangan, sisanya ke bawah Deck.'},
 atk:[{n:'Sundulan Naga',cost:'RP',dmg:70,fx:'plain',tx:''}]},
dragapult:{n:'Dragapult ex',ni:'Dragapult ex',k:'pokemon',type:'N',hp:320,stage:2,from:'Drakloak',retreat:1,prize:2,tera:1,img:13751,mark:'H',
 atk:[{n:'Jet Head',cost:'C',dmg:70,fx:'plain',tx:''},{n:'Phantom Dive',cost:'RP',dmg:200,fx:'dive',tx:'Taruh 6 damage counter sesukamu ke Pokémon Bench lawan.'}]},
candy:{n:'Rare Candy',ni:'Permen Langka',k:'item',img:19014,tx:'Pilih 1 Pokémon Stage 2 dari tangan, evolusikan Pokémon Basic-nya di Arena tanpa Stage 1. Tidak bisa di giliran pertamamu atau ke Pokémon yang baru masuk.'},
renergy:{n:'Basic Fire Energy',ni:'Energi Dasar Api',k:'energy',t:'R',img:14667,tx:'Energi Dasar tipe Api.'},
penergy:{n:'Basic Psychic Energy',ni:'Energi Dasar Psikis',k:'energy',t:'P',img:14670,tx:'Energi Dasar tipe Psikis.'}
};
const TYPES={D:['Kegelapan','#3b2f5c'],P:['Psikis','#a855f7'],R:['Api','#ef4444'],C:['Normal','#94a3b8'],G:['Rumput','#22c55e'],F:['Bertarung','#b45309'],W:['Air','#0ea5e9'],L:['Listrik','#eab308'],N:['Naga','#7c3aed']};
const CLUSTERS=[['Pokémon',c=>c.k==='pokemon'],['Trainer — Supporter',c=>c.k==='supporter'],['Trainer — Item',c=>c.k==='item'&&!c.ace],['ACE SPEC',c=>!!c.ace],['Pokémon Tool',c=>c.k==='tool'],['Stadium',c=>c.k==='stadium'],['Energy',c=>c.k==='energy'||c.k==='senergy']];
const USER_DECK={cinderace:2,munkidori:2,carvanha:4,sharpedo:3,fezan:1,pecharunt:1,toxel:3,toxtricity:3,minccino:1,cinccino:1,poffin:4,eretrieval:1,stretcher:2,pad:2,prime:1,redcard:1,ultra:4,boss:2,hilda:2,iris:2,lillie:4,balloon:2,helmet:2,prism:1,denergy:9};
const TERA_DECK={terapagos:4,hoothoot:4,noctowl:4,fanrotom:2,fezan:1,poffin:4,ultra:4,pokegear:2,pad:2,stretcher:2,prime:1,boss:2,briar:2,lillie:4,hilda:2,iris:2,zero:3,balloon:2,genergy:4,wenergy:4,lenergy:4,prism:1};
const DRAGA_DECK={dreepy:4,drakloak:4,dragapult:3,fezan:1,candy:3,poffin:4,ultra:4,pad:3,stretcher:2,prime:1,pokegear:2,eretrieval:1,lillie:4,boss:2,hilda:2,iris:2,briar:2,balloon:2,zero:2,renergy:6,penergy:6};
const FORMATS={std:{n:'Standard 2026-27 (H, I, J)',ok:c=>c.k==='energy'||!!c.std},exp:{n:'Expanded',ok:()=>true}};
Object.values(CARDS).forEach(c=>{c.std=1});/* seluruh kartu pool sah di Standard 2026-27 (mark H/I/J atau reprint H+) dan Expanded */

/* gambar kartu: file asli dari ZIP (assets/cards/idXXXXXXXX.webp) */
const IMG=Object.fromEntries(Object.values(CARDS).map(c=>[c.img,`assets/cards/id${String(c.img).padStart(8,'0')}.webp`]));
