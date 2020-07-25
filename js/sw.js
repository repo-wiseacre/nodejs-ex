var SLOW_TIME = 3000;

var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/'
];


self.addEventListener( 'install', function () {
  console.log('Installed service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener( 'fetch', function(event) {
  var url = event.request.url;
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );

  if ( url.indexOf( 'blocking' ) === -1) {
  return;
  }

  var promise = Promise.race( [
    new Promise( ( resolve, reject) => setTimeout(
      () => reject( new Response( 'Request killed!' ) ),
      SLOW_TIME
    ) ),
    fetch( event.request ),
  ] );

  event.respondWith( promise );
} );
