
const CACHE_NAME = 'mymed-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch((error) => {
        console.log('Fetch error:', error);
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      reminderId: data.reminderId,
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'take',
        title: 'Take Now',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'snooze',
        title: 'Snooze',
        icon: '/icons/snooze.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const reminderId = notification.data.reminderId;

  notification.close();

  if (action === 'take') {
    // Handle "Take Now" action
    const takeUrl = new URL('/?action=take&id=' + reminderId, self.location.origin);
    
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === takeUrl.href && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(takeUrl.href);
        }
      })
    );
  } else if (action === 'snooze') {
    // Handle "Snooze" action
    const snoozeUrl = new URL('/?action=snooze&id=' + reminderId, self.location.origin);
    
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === snoozeUrl.href && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(snoozeUrl.href);
        }
      })
    );
  } else {
    // Handle default click
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
