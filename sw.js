const CACHE_NAME="lapiit-startpage-v5-1";
const CORE=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(c=>c||caches.match("./index.html"))));});