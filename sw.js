/* Service Worker: game tetap jalan saat sinyal lemah/putus setelah kunjungan pertama.
   - gambar kartu & ikon: stale-while-revalidate (dari perangkat dulu, diperbarui diam-diam dari jaringan)
   - three.js dari cdnjs (versi tetap di URL): cache-first
   - file aplikasi sendiri (HTML/JS/CSS): network-first, jatuh ke salinan terakhir saat offline */
const CACHE = 'kartu-v1', APP = 'app-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const q = e.request, u = new URL(q.url);
  if (q.method !== 'GET') return;
  if (u.origin === location.origin && /\/assets\/(cards|icons)\//.test(u.pathname)) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(q, {ignoreSearch: true});
      const net = fetch(q).then(r => { if (r.ok) c.put(q, r.clone()); return r }).catch(() => hit || Response.error());
      if (hit) { e.waitUntil(net.catch(() => {})); return hit }
      return net;
    }));
  } else if (u.host === 'cdnjs.cloudflare.com') {
    e.respondWith(caches.open(APP).then(async c => (await c.match(q)) || fetch(q).then(r => { if (r.ok) c.put(q, r.clone()); return r })));
  } else if (u.origin === location.origin) {
    e.respondWith(fetch(q).then(r => { if (r.ok) { const k = r.clone(); caches.open(APP).then(c => c.put(q, k)) } return r })
      .catch(() => caches.match(q, {ignoreSearch: true}).then(h => h || Response.error())));
  }
});
