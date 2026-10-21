# Pokémon TCG Simulator

Harus dibuka lewat web server (bukan double-click `index.html`): WebGL menolak tekstur gambar dari `file://`.

```sh
python3 -m http.server 8000   # lalu buka http://localhost:8000
```

## Struktur
- `index.html` — markup layar & overlay
- `css/style.css` — semua style
- `js/icons.js` — path ikon tipe/energi (`assets/icons/`)
- `js/cards.js` — data kartu (`CARDS`), deck bawaan, format; `IMG` memetakan `img` → `assets/cards/idXXXXXXXX.webp`
- `js/engine.js` — mesin aturan + bot (tanpa DOM/Three.js)
- `js/scene3d.js` — papan, kartu, VFX Three.js
- `js/ui.js` — interaksi, HUD, drag & drop, loop render
- `js/menu.js` — menu, pilih deck, deck builder
- `assets/cards/` — hanya gambar kartu yang dipakai (nama file sama dengan di ZIP)

## Menambah kartu
1. Salin `lesser_webp_3/idXXXXXXXX.webp` dari ZIP ke `assets/cards/`.
2. Tambah entri di `CARDS` (`js/cards.js`) dengan `img: XXXXX`.
3. Efek baru: tulis di `EFF` (Trainer), `AB` (Ability), atau `switch(at.fx)` di `actAttack` (`js/engine.js`), plus logika bot di `botTurn` bila perlu.

## Tes
`node tests/engine.test.js` — 75 pertandingan bot lawan bot + cek aturan kartu (Tera, Crown Opal, Bench 8, Briar, dll).

## Indeks kartu (OCR)
`tools/card-ocr.tsv` berisi teks hasil OCR semua kartu di ZIP (tidak di-commit). Buat ulang dari ZIP yang sudah diekstrak:
```sh
for i in 0 1 2 3 4 5 6 7; do osascript -l JavaScript tools/ocr.js <folder lesser_webp_3> 0 $i 8 part$i.tsv & done; wait
cat part*.tsv | sort -n > tools/card-ocr.tsv
```
Cari kartu: `grep -i "noctowl" tools/card-ocr.tsv`.

Teks resmi (lebih akurat dari OCR) dari asia.pokemon-card.com/id — id sama dengan nama file gambar. Bisa dilanjutkan kalau terputus:
```sh
cut -f1 tools/card-ocr.tsv > ids.txt
python3 -I tools/fetch-official.py ids.txt tools/card-official.jsonl 1
```
