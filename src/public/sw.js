// Service Worker for Snipeovation PWA - handles share target and basic caching

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Handle Web Share Target API POST to /vakaros/share
  if (url.pathname === '/vakaros/share' && event.request.method === 'POST') {
    event.respondWith((async () => {
      var formData = await event.request.formData();
      var file = formData.get('file');

      // Re-POST to the server with the file
      var newFormData = new FormData();
      if (file) newFormData.append('file', file);

      var response = await fetch('/vakaros/share', {
        method: 'POST',
        body: newFormData,
        credentials: 'same-origin'
      });
      return response;
    })());
    return;
  }
});
