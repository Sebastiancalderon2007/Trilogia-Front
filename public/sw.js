// Service worker mínimo: solo habilita que el navegador ofrezca "instalar" la
// app (PWA) en el celular. No cachea nada todavía (la app siempre necesita
// datos frescos del servidor).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
