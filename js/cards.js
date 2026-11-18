/* ===== DATA KARTU (dibaca dari gambar ZIP) ===== */
const CARDS={
cinderace:{n:'Cinderace',ni:'Cinderace',k:'pokemon',type:'R',hp:160,stage:2,from:'Raboot',weak:'W',retreat:0,img:16515,mark:'I',
 ab:{key:'zip',n:'Kecepatan Seketika',tx:'Jika kartu ini ada di Kartu Pegangan saat memasukkan Pokémon ke Arena Bertarung pada waktu Persiapan Bermain, pemain dapat memasukkannya ke Arena Bertarung dengan sisi depan menghadap ke bawah.',setup:1},
 atk:[{n:'Flare Turbo',cost:'C',dmg:50,fx:'turbo',tx:'Pilih paling banyak 3 lembar Energi Dasar dari Deck sendiri, lalu kenakan sesukanya pada Pokémon Cadangan. Kemudian, kocok Deck.'}]},
munkidori:{n:'Munkidori',ni:'Munkidori',k:'pokemon',type:'P',hp:110,stage:0,weak:'D',res:'F',retreat:1,img:19026,mark:'H',
 ab:{key:'adr',n:'Adrenaline Brain',tx:'Dapat digunakan 1 kali pada giliran sendiri jika Pokémon ini mengenakan Energi {Kegelapan}. Pilih paling banyak 3 Token Kerusakan yang dimiliki 1 Pokémon di Arena sendiri, lalu pindahkan ke 1 Pokémon di Arena lawan.'},
 atk:[{n:'Psychotrip',cost:'PC',dmg:60,fx:'conf',tx:'Ubah kondisi Pokémon Bertarung lawan menjadi Pusing.'}]},
carvanha:{n:'Carvanha',ni:'Carvanha',k:'pokemon',type:'D',hp:70,stage:0,weak:'G',retreat:1,img:16761,mark:'I',
 atk:[{n:'Menyerang',cost:'D',dmg:30,fx:'self10',tx:'Pokémon ini juga menerima kerusakan sejumlah 10.'}]},
sharpedo:{n:'Mega Sharpedo ex',ni:'Mega Sharpedo ex',k:'pokemon',type:'D',hp:330,stage:1,from:'Carvanha',weak:'G',retreat:0,prize:3,mega:1,img:16762,mark:'I',
 atk:[{n:'Taring Rakus',cost:'D',dmg:70,fx:'draw2',tx:'Ambil 2 kartu dari atas Deck sendiri.'},{n:'Hungry Jaw',cost:'DD',dmg:120,plus:1,fx:'jaw',tx:'Jika Pokémon ini memiliki Token Kerusakan, kerusakan yang diberikan bertambah sejumlah 150.'}]},
fezan:{n:'Fezandipiti ex',ni:'Fezandipiti ex',k:'pokemon',type:'D',hp:210,stage:0,weak:'F',retreat:1,prize:2,img:19032,mark:'H',
 ab:{key:'chance',n:'Kesempatan dalam Kesempitan',tx:'Dapat digunakan 1 kali pada giliran sendiri jika pada giliran lawan sebelumnya, ada Pokémon sendiri yang KO. Ambil 3 kartu dari atas Deck sendiri. Jika pada giliran ini, Kesempatan dalam Kesempitan lainnya telah digunakan, Ability ini tidak dapat digunakan.',once:1},
 atk:[{n:'Cruel Arrow',cost:'CCC',dmg:100,fx:'arrow',tx:'Serangan ini memberikan kerusakan sejumlah 100 kepada 1 Pokémon lawan.'}]},
pecharunt:{n:'Pecharunt ex',ni:'Pecharunt ex',k:'pokemon',type:'D',hp:190,stage:0,weak:'F',retreat:1,prize:2,img:19033,mark:'H',
 ab:{key:'chain',n:'Rantai Dominasi',tx:'Dapat digunakan 1 kali pada giliran sendiri. Pilih 1 Pokémon {Kegelapan} (selain Pecharunt {ex}) di Cadangan sendiri, lalu tukar dengan Pokémon Bertarung. Setelah itu, ubah kondisi Pokémon Bertarung yang baru menjadi Racun. Jika pada giliran ini, Rantai Dominasi lainnya telah digunakan, Ability ini tidak dapat digunakan.',once:1},
 atk:[{n:'Ledakan Marah-marah',cost:'DD',dmg:60,times:1,fx:'ledak',tx:'Serangan ini memberikan kerusakan sejumlah 60 untuk tiap lembar Kartu Point yang telah diambil lawan.'}]},
toxel:{n:'Toxel',ni:'Toxel',k:'pokemon',type:'D',hp:70,stage:0,weak:'F',retreat:1,img:19030,mark:'I',
 atk:[{n:'Memanggil Teman',cost:'D',dmg:0,fx:'call',tx:'Pilih paling banyak 2 lembar Pokémon Basic dari Deck sendiri, lalu masukkan ke Cadangan. Kemudian, kocok Deck.'},{n:'Tendangan Nakal',cost:'DC',dmg:20,fx:'plain',tx:''}]},
toxtricity:{n:'Toxtricity',ni:'Toxtricity',k:'pokemon',type:'D',hp:140,stage:1,from:'Toxel',weak:'F',retreat:2,img:19031,mark:'I',
 ab:{key:'upper',n:'Bad Upper',tx:'Dapat digunakan 1 kali pada giliran sendiri. Pilih 1 lembar Energi Dasar {Kegelapan} dari Deck sendiri, lalu kenakan pada Pokémon {Kegelapan} di Cadangan. Kemudian, kocok Deck. Setelah itu, letakkan 2 Token Kerusakan pada Pokémon yang telah dikenakan Energi tersebut.'},
 atk:[{n:'Menepuk',cost:'DDC',dmg:100,fx:'plain',tx:''}]},
minccino:{n:'Minccino',ni:'Minccino',k:'pokemon',type:'C',hp:70,stage:0,weak:'F',retreat:1,img:18797,mark:'J',
 atk:[{n:'Menerjang',cost:'C',dmg:30,fx:'self10',tx:'Pokémon ini juga menerima kerusakan sejumlah 10.'}]},
cinccino:{n:'Cinccino ex',ni:'Cinccino ex',k:'pokemon',type:'C',hp:240,stage:1,from:'Minccino',weak:'F',retreat:1,prize:2,img:18798,mark:'J',
 ab:{key:'smooth',n:'Lapisan Mulus',tx:'Saat Pokémon ini menerima kerusakan akibat serangan, pemain melempar koin 1 kali. Jika hasilnya sisi depan, Pokémon ini tidak menerima kerusakan tersebut.',passive:1},
 atk:[{n:'Tamparan Energi',cost:'C',dmg:40,times:1,fx:'en40',tx:'Serangan ini memberikan kerusakan sejumlah 40 untuk tiap Energi yang dikenakan pada Pokémon ini.'}]},
poffin:{n:'Buddy-Buddy Poffin',ni:'Poffin Bersahabat',k:'item',img:17391,tx:'Pilih paling banyak 2 lembar Pokémon Basic dengan HP 70 atau kurang dari Deck sendiri, lalu masukkan ke Cadangan. Kemudian, kocok Deck.'},
eretrieval:{n:'Energy Retrieval',ni:'Pemulihan Energi',k:'item',img:13925,tx:'Pilih paling banyak 2 lembar Energi Dasar dari Trash sendiri, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan.'},
stretcher:{n:'Night Stretcher',ni:'Tandu Malam',k:'item',img:14355,tx:'Pilih 1 lembar Pokémon atau Energi Dasar dari Trash sendiri, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan.'},
pad:{n:'Poké Pad',ni:'PokéPad',k:'item',img:18382,tx:'Pilih 1 lembar Pokémon (selain Pokémon yang memiliki Peraturan) dari Deck sendiri, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan. Kemudian, kocok Deck.'},
prime:{n:'Prime Catcher',ni:'Prime Catcher',k:'item',ace:1,img:19037,tx:'Pilih 1 Pokémon Cadangan lawan, lalu tukar dengan Pokémon Bertarung. Setelah itu, tukar Pokémon Bertarung sendiri dengan Pokémon Cadangan.'},
redcard:{n:'Special Red Card',ni:'Kartu Merah Spesial',k:'item',img:19082,tx:'Kartu ini hanya dapat digunakan saat sisa Kartu Point lawan adalah 3 lembar atau kurang. Lawan mengocok semua Kartu Pegangannya dengan sisi depan menghadap ke bawah, lalu mengembalikannya ke bawah Deck. Setelah itu, lawan mengambil 3 kartu dari atas Deck.'},
ultra:{n:'Ultra Ball',ni:'Bola Ultra',k:'item',img:10061,tx:'Kartu ini dapat digunakan jika pemain membuang 2 lembar Kartu Pegangan sendiri ke Trash. Pilih 1 lembar Pokémon dari Deck sendiri, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan. Kemudian, kocok Deck.'},
boss:{n:"Boss's Orders",ni:'Perintah Bos',k:'supporter',img:10515,tx:'Pilih 1 Pokémon Cadangan lawan, lalu tukar dengan Pokémon Bertarung.'},
hilda:{n:'Hilda',ni:'Hilda',k:'supporter',img:16307,tx:'Pilih Pokémon Evolusi dan Energi masing-masing 1 lembar dari Deck sendiri, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan. Kemudian, kocok Deck.'},
iris:{n:"Iris's Fighting Spirit",ni:'Semangat Tarung Iris',k:'supporter',img:17488,tx:'Kartu ini dapat digunakan jika pemain membuang 1 lembar Kartu Pegangan sendiri ke Trash. Ambil kartu dari atas Deck hingga jumlah Kartu Pegangan sendiri menjadi 6 lembar.'},
lillie:{n:"Lillie's Determination",ni:'Ketetapan Hati Lillie',k:'supporter',img:17491,tx:'Kocok kembali semua Kartu Pegangan sendiri ke Deck. Setelah itu, ambil 6 kartu dari atas Deck. Jika sisa Kartu Point sendiri adalah 6 lembar, jumlah kartu yang diambil menjadi 8 lembar.'},
balloon:{n:'Air Balloon',ni:'Balon',k:'tool',img:19064,tx:'Energi yang dibutuhkan oleh Pokémon yang mengenakan kartu ini untuk Mundur berkurang 2.'},
helmet:{n:'Punk Helmet',ni:'Helm Punk',k:'tool',img:19040,tx:'Saat Pokémon {Kegelapan} yang mengenakan kartu ini ada di Arena Bertarung dan menerima kerusakan akibat serangan dari Pokémon lawan, letakkan 4 Token Kerusakan pada Pokémon yang telah menggunakan serangan.'},
prism:{n:'Prism Energy',ni:'Energi Prisma',k:'senergy',img:16311,mark:'I',tx:'Kartu ini berlaku sebagai 1 Energi {Bening} selama dikenakan pada Pokémon. Jika dikenakan pada Pokémon Basic, kartu ini berlaku sebagai 1 Energi semua tipe.'},
denergy:{n:'Basic Darkness Energy',ni:'Energi Dasar Kegelapan',k:'energy',t:'D',img:19046,tx:'Energi Dasar tipe Kegelapan.'},
/* ----- archetype Tera: Terapagos ex (sv7s Stellar Miracle, mark H) ----- */
terapagos:{n:'Terapagos ex',ni:'Terapagos ex',k:'pokemon',type:'C',hp:230,stage:0,weak:'F',retreat:2,prize:2,tera:1,img:14349,mark:'H',
 atk:[{n:'Union Beat',cost:'CC',dmg:30,times:1,fx:'union',tx:'Serangan ini tidak dapat digunakan pada giliran pertama Pemain Kedua. Serangan ini memberikan kerusakan sejumlah 30 untuk tiap Pokémon Cadangan sendiri.'},{n:'Crown Opal',cost:'GWL',dmg:180,fx:'opal',tx:'Pada giliran lawan berikutnya, Pokémon ini tidak menerima kerusakan akibat serangan dari Pokémon Basic (selain Pokémon {Bening}).'}]},
hoothoot:{n:'Hoothoot',ni:'Hoothoot',k:'pokemon',type:'C',hp:70,stage:0,weak:'L',res:'F',retreat:1,img:14334,mark:'H',
 atk:[{n:'Menusuk Tiga Kali',cost:'C',dmg:10,times:1,fx:'flip3',tx:'Lempar koin 3 kali. Serangan ini memberikan kerusakan sejumlah 10 untuk tiap lemparan dengan hasil sisi depan.'}]},
noctowl:{n:'Noctowl',ni:'Noctowl',k:'pokemon',type:'C',hp:100,stage:1,from:'Hoothoot',weak:'L',res:'F',retreat:1,img:14335,mark:'H',
 ab:{key:'jewel',n:'Mencari Permata',tx:'Dapat digunakan 1 kali pada giliran sendiri jika ada Pokémon Terastal di Arena sendiri saat memasukkan kartu ini dari Kartu Pegangan untuk melakukan evolusi. Pilih paling banyak 2 lembar Trainer dari Deck sendiri, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan. Kemudian, kocok Deck.',passive:1},
 atk:[{n:'Speed Wing',cost:'CC',dmg:60,fx:'plain',tx:''}]},
fanrotom:{n:'Fan Rotom',ni:'Rotom Kipas',k:'pokemon',type:'C',hp:70,stage:0,weak:'L',res:'F',retreat:1,img:14338,mark:'H',
 ab:{key:'fan',n:'Fan Call',tx:'Hanya dapat digunakan 1 kali pada giliran pertama sendiri. Pilih paling banyak 3 lembar Pokémon {Bening} dengan HP 100 atau kurang dari Deck sendiri, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan. Kemudian, kocok Deck. Jika pada giliran ini, Fan Call lainnya telah digunakan, Ability ini tidak dapat digunakan.'},
 atk:[{n:'Pendaratan Menyerang',cost:'C',dmg:70,fx:'landing',tx:'Jika tidak ada Stadium di Arena, serangan ini gagal.'}]},
briar:{n:'Briar',ni:'Briar',k:'supporter',img:14370,tx:'Kartu ini hanya dapat digunakan saat sisa Kartu Point lawan adalah 2 lembar. Pada giliran ini, jika Pokémon Bertarung lawan KO karena kerusakan akibat serangan yang digunakan oleh Pokémon Terastal sendiri, ambil Kartu Point 1 lembar lebih banyak.'},
pokegear:{n:'Pokégear 3.0',ni:'Pokégear 3.0',k:'item',img:16301,tx:'Lihat 7 kartu dari atas Deck sendiri, pilih 1 lembar Supporter di antaranya, perlihatkan ke lawan, lalu tambahkan ke Kartu Pegangan. Kocok kembali sisa kartu ke Deck.'},
zero:{n:'Area Zero Underdepths',ni:'Gua Besar Zero',k:'stadium',bench8:1,img:14372,mark:'H',tx:'Jumlah Pokémon yang dapat dimasukkan ke Cadangan pemain yang ada Pokémon Terastal di Arenanya sendiri menjadi 8. (Saat kartu ini dibuang ke Trash atau saat Pokémon Terastal menjadi tidak ada di Arena sendiri, buang ke Trash hingga jumlah Pokémon di Cadangan menjadi 5. Jika kedua pemain membuang ke Trash, pemilik kartu ini membuang Pokémon Cadangan ke Trash terlebih dahulu.)'},
genergy:{n:'Basic Grass Energy',ni:'Energi Dasar Rumput',k:'energy',t:'G',img:14507,tx:'Energi Dasar tipe Rumput.'},
wenergy:{n:'Basic Water Energy',ni:'Energi Dasar Air',k:'energy',t:'W',img:14668,tx:'Energi Dasar tipe Air.'},
lenergy:{n:'Basic Lightning Energy',ni:'Energi Dasar Listrik',k:'energy',t:'L',img:14522,tx:'Energi Dasar tipe Listrik.'},
/* ----- archetype Dragapult ex (sv6 Twilight Masquerade, mark H) ----- */
dreepy:{n:'Dreepy',ni:'Dreepy',k:'pokemon',type:'N',hp:70,stage:0,retreat:1,img:13749,mark:'H',
 atk:[{n:'Mendendam Sedikit',cost:'P',dmg:10,fx:'plain',tx:''},{n:'Menggigit',cost:'RP',dmg:40,fx:'plain',tx:''}]},
drakloak:{n:'Drakloak',ni:'Drakloak',k:'pokemon',type:'N',hp:90,stage:1,from:'Dreepy',retreat:1,img:13750,mark:'H',
 ab:{key:'recon',n:'Perintah Rekonaisans',tx:'Dapat digunakan 1 kali pada giliran sendiri. Lihat 2 kartu dari atas Deck sendiri, pilih salah satu, lalu tambahkan ke Kartu Pegangan. Kembalikan sisa kartu ke bawah Deck.'},
 atk:[{n:'Sundulan Naga',cost:'RP',dmg:70,fx:'plain',tx:''}]},
dragapult:{n:'Dragapult ex',ni:'Dragapult ex',k:'pokemon',type:'N',hp:320,stage:2,from:'Drakloak',retreat:1,prize:2,tera:1,img:13751,mark:'H',
 atk:[{n:'Jet Head',cost:'C',dmg:70,fx:'plain',tx:''},{n:'Phantom Dive',cost:'RP',dmg:200,fx:'dive',tx:'Letakkan sejumlah 6 Token Kerusakan pada Pokémon Cadangan lawan sesukanya.'}]},
candy:{n:'Rare Candy',ni:'Permen Langka',k:'item',img:19014,tx:'Pilih 1 lembar Pokémon Stage 2 dari Kartu Pegangan sendiri, lalu letakkan ke Pokémon Basic di Arena sendiri yang berevolusi menjadi Pokémon tersebut, lakukan evolusi tanpa perlu melakukan evolusi Stage 1. (Tidak dapat digunakan pada giliran pertama pemain dan pada Pokémon yang baru dimasukkan.)'},
/* ----- item pemulih (mark J) ----- */
potion:{n:'Potion',ni:'Obat Luka',k:'item',img:7065,mark:'J',tx:'Pulihkan HP 1 Pokémon sendiri sejumlah 30.'},
galette:{n:'Lumiose Galette',ni:'Lumiose Galette',k:'item',img:18383,mark:'J',tx:'Pulihkan HP Pokémon Bertarung sendiri sejumlah 20, lalu pulihkan juga 1 Kondisi Khusus yang dialami Pokémon tersebut.'},
renergy:{n:'Basic Fire Energy',ni:'Energi Dasar Api',k:'energy',t:'R',img:14667,tx:'Energi Dasar tipe Api.'},
penergy:{n:'Basic Psychic Energy',ni:'Energi Dasar Psikis',k:'energy',t:'P',img:14670,tx:'Energi Dasar tipe Psikis.'}
};
const TYPES={D:['Kegelapan','#3b2f5c'],P:['Psikis','#a855f7'],R:['Api','#ef4444'],C:['Normal','#94a3b8'],G:['Rumput','#22c55e'],F:['Petarung','#b45309'],W:['Air','#0ea5e9'],L:['Listrik','#eab308'],N:['Naga','#7c3aed'],M:['Logam','#94a3b8']};
const CLUSTERS=[['Pokémon',c=>c.k==='pokemon'],['Supporter',c=>c.k==='supporter'&&!c.ace],['Item',c=>c.k==='item'&&!c.ace],['Pokémon Tool',c=>c.k==='tool'&&!c.ace],['Stadium',c=>c.k==='stadium'&&!c.ace],['Energi',c=>(c.k==='energy'||c.k==='senergy')&&!c.ace],['ACE SPEC',c=>!!c.ace]];   // tiap kartu tepat di 1 kategori (id tile unik); ACE SPEC paling bawah, dikelompokkan per jenis
const SUBS={'ACE SPEC':[['tool','Pokémon Tool'],['item','Item'],['senergy','Energi Spesial'],['supporter','Supporter'],['stadium','Stadium'],['pokemon','Pokémon']],Energi:[['energy','Energi Dasar'],['senergy','Energi Spesial']]};   // sub-judul per jenis di dalam kategori, urut sesuai daftar
const USER_DECK={cinderace:2,munkidori:2,carvanha:4,sharpedo:3,fezan:1,pecharunt:1,toxel:3,toxtricity:3,minccino:1,cinccino:1,poffin:4,eretrieval:1,stretcher:2,pad:2,prime:1,redcard:1,ultra:4,boss:2,hilda:2,iris:2,lillie:4,balloon:2,helmet:2,prism:1,denergy:9};
const TERA_DECK={terapagos:4,hoothoot:4,noctowl:4,fanrotom:2,fezan:1,poffin:4,ultra:4,pokegear:2,pad:2,stretcher:2,prime:1,boss:2,briar:2,lillie:4,hilda:2,iris:2,zero:3,balloon:2,genergy:4,wenergy:4,lenergy:4,prism:1};
const DRAGA_DECK={dreepy:4,drakloak:4,dragapult:3,fezan:1,candy:3,poffin:4,ultra:4,pad:3,stretcher:2,prime:1,pokegear:2,eretrieval:1,lillie:4,boss:2,hilda:2,iris:2,briar:2,balloon:2,zero:2,renergy:6,penergy:6};
const FORMATS={std:{n:'Standard 2026-27 (H, I, J)',ok:c=>c.k==='energy'||!!c.std},exp:{n:'Expanded',ok:()=>true}};
Object.values(CARDS).forEach(c=>{c.std=1});/* seluruh kartu pool sah di Standard 2026-27 (mark H/I/J atau reprint H+) dan Expanded */
if(Object.values(CARDS).every(FORMATS.std.ok))delete FORMATS.exp;/* Expanded = Standard selama semua kartu sah di Standard: pilihannya disembunyikan, muncul lagi bila ada kartu tanpa std */

/* gambar kartu: file asli dari ZIP (assets/cards/idXXXXXXXX.webp) */
const IMG=Object.fromEntries(Object.values(CARDS).map(c=>[c.img,`assets/cards/id${String(c.img).padStart(8,'0')}.webp`]));
