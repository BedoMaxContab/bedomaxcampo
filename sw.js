// BedoMaxCampo - service worker: tiene l'app nel telefono/tablet per lavorare SENZA CAMPO.
// Cambiare VERSIONE a ogni pubblicazione: i dispositivi scaricano la nuova app al primo collegamento.
const VERSIONE = 'bmcampo-0.10.0';
const FILE = ['./', './index.html', './manifest.json', './zxing-reader.js', './zxing_reader.wasm',
              './icona-192.png', './icona-512.png', './icona-180.png',
              './tesseract.min.js', './worker.min.js', './tesseract-core-simd-lstm.wasm.js', './tesseract-core-lstm.wasm.js', './tesseract-core-relaxedsimd-lstm.wasm.js', './eng.traineddata.gz'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSIONE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;   // GitHub API: mai in cache
  // pagina: prima la rete (per prendere gli aggiornamenti), se non c'e' campo quella salvata
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSIONE).then(k => k.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
