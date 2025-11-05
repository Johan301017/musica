// Service Worker para Spotify Music Explorer
// Proporciona funcionalidad offline y caché de recursos

const CACHE_NAME = 'music-explorer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/js/models/SpotifyModel.js',
  '/assets/js/views/MusicView.js',
  '/assets/js/controllers/MusicController.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Error al cachear recursos:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta
        if (response) {
          return response;
        }

        // Clonar la petición
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Verificar si recibimos una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Manejar errores de red
        console.log('Fallo al obtener recurso, usando respuesta por defecto');
        
        // Para peticiones a la API de Spotify, devolver datos mock
        if (event.request.url.includes('spotify.com')) {
          return new Response(
            JSON.stringify({
              tracks: {
                items: [
                  {
                    id: 'offline1',
                    name: 'Canción Offline',
                    artists: [{ name: 'Artista Offline' }],
                    album: {
                      name: 'Álbum Offline',
                      images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Offline' }]
                    },
                    preview_url: null,
                    external_urls: { spotify: '#' }
                  }
                ]
              }
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        
        // Para otros recursos, devolver error 404
        return new Response('Recurso no disponible offline', {
          status: 404,
          statusText: 'Not Found',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Estrategia de caché para diferentes tipos de recursos
const cacheStrategies = {
  // Cache primero, luego red
  cacheFirst: (request) => {
    return caches.match(request).then((response) => {
      return response || fetch(request);
    });
  },

  // Red primero, luego cache
  networkFirst: (request) => {
    return fetch(request).then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(request);
    });
  },

  // Solo cache
  cacheOnly: (request) => {
    return caches.match(request);
  },

  // Solo red
  networkOnly: (request) => {
    return fetch(request);
  }
};

// Estrategias específicas por tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // HTML - Cache primero
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(cacheStrategies.cacheFirst(request));
    return;
  }

  // CSS, JavaScript - Cache primero
  if (request.url.includes('.css') || request.url.includes('.js')) {
    event.respondWith(cacheStrategies.cacheFirst(request));
    return;
  }

  // Imágenes - Cache primero con límite de tiempo
  if (request.headers.get('accept').includes('image')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Verificar si el cache tiene menos de 7 días
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseDate = new Date(dateHeader);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            if (responseDate > sevenDaysAgo) {
              return response;
            }
          }
        }
        
        // Si el cache es muy antiguo o no existe, obtener de la red
        return fetch(request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      }).catch(() => {
        return caches.match(request); // Fallback al cache
      })
    );
    return;
  }

  // API de Spotify - Red primero, luego cache con datos mock
  if (url.hostname.includes('spotify.com')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si no hay cache, devolver datos mock
          return new Response(
            JSON.stringify({
              tracks: {
                items: [
                  {
                    id: 'mock1',
                    name: 'Canción Mock',
                    artists: [{ name: 'Artista Mock' }],
                    album: {
                      name: 'Álbum Mock',
                      images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Mock' }]
                    },
                    preview_url: null,
                    external_urls: { spotify: '#' }
                  }
                ]
              }
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        });
      })
    );
    return;
  }

  // Por defecto - Red primero, luego cache
  event.respondWith(cacheStrategies.networkFirst(request));
});