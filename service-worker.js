self.addEventListener("install", event => {
  console.log("Service Worker installé !");
});

self.addEventListener("fetch", event => {
  // Gestion du cache possible ici
});
