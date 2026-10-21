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
