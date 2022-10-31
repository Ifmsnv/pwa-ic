// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v9';
const DATA_CACHE_NAME = 'data-cache-v4';

// Add list of files to cache here.
const FILES_TO_CACHE = [
  './',
  './scripts/app.js',
  './scripts/install.js',
  './scripts/luxon.js',
  './css/styles.css',
  './images/add.svg',
  './images/install.svg',
  // '/images/clear-day.svg',
  // '/images/clear-night.svg',
  // '/images/cloudy.svg',
  // '/images/fog.svg',
  // '/images/hail.svg',
  // '/images/install.svg',
  // '/images/partly-cloudy-day.svg',
  // '/images/partly-cloudy-night.svg',
  // '/images/rain.svg',
  './images/refresh.svg',
  // '/images/sleet.svg',
  // '/images/snow.svg',
  // '/images/thunderstorm.svg',
  // '/images/tornado.svg',
  // '/images/wind.svg',
];

/**
 * Typically the install event is used to cache everything you need for your app to run.
 */
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker.install] Install');

  // Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker.install] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

/**
 * The service worker will receive an activate event every time it starts up.
 */
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker.activate] Activate');

  // Remove previous cached data from disk.
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker.activate] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  self.clients.claim();
});

/**
 * The fetch event allows the service worker to intercept any network requests and handle requests.
 */
self.addEventListener('fetch', (evt) => {
  const url = evt.request.url;
  console.log('[ServiceWorker.fetch] Fetch', url);

  // Add fetch event handler here.
  if (url.includes('/forecast/')) {
    console.log('[ServiceWorker.fetch] (data)', url);
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
          .then((response) => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              console.log('[ServiceWorker.fetch] (cache.put)', url);
              cache.put(url, response.clone());
            }
            return response;
          }).catch((err) => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }));
    return;
  }
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request)
        .then((response) => {
          return response || fetch(evt.request);
        });
    })
  );

});
