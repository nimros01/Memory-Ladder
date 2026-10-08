/* Offline support for Recall Ladder.
   The page is fetched from the network first so updates show up at once,
   and the last copy is served when there is no connection.
   Fonts are served from the cache once fetched. Firebase calls are never cached. */
var CACHE = "recall-ladder-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(["./"]); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function fromNetwork(req, key) {
  return fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(key || req, copy); }); }
    return res;
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (req.mode === "navigate" && url.origin === self.location.origin) {
    /* every page address shares one cached copy of the game */
    e.respondWith(fromNetwork(req, "./").catch(function () {
      return caches.match("./").then(function (r) { return r || Response.error(); });
    }));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then(function (r) { return r || fromNetwork(req); }));
  }
});
