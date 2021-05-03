
//main service worker

//utility program functions

//cache update function
var update = request => {
    return fetch(request.url).then(
        response => 
            cache(request, response) //mise en cache
                .then(response => response).catch(error => {
                    console.log('An error has occured');
                    throw error;
                }) //promess resolution
                
    );
}
//dom refresh function
var refresh = response => {
    return response
        .json() //lit et parse la reponse json
        .then(jsonResponse => {
            self.ClientRectList.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage(
                        JSON.stringify({
                            type: response.url,
                            data: jsonResponse.data
                        })
                    );
                });
            });
            return jsonResponse.data;
        }).catch(error => {
            console.log('An error has occured');
            throw error;
        })
        
}

//constant value used in the program
const CACHE_NAME = "V1";
const STATIC_CACHE_URLS = ["/", "styles/", "js/", "img/", "fonts/"];

//handle the install event on the service worker
self.addEventListener("install", event => {
    self.skipWaiting();
    console.log("Service Worker installing.", event.request);

    //Caching first method
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(STATIC_CACHE_URLS);
      }).catch(error => {
          throw error;
      })
    )
});

//handle the activate event on the service worker
self.addEventListener("activate", event => {
    // delete any unexpected caches
    event.waitUntil(
      caches
        .keys()
        .then(keys => keys.filter(key => key !== CACHE_NAME))
        .then(keys =>{
          Promise.all(
            keys.map(key => {
              console.log(`Deleting cache ${key}`);
              return caches.delete(key);
            })
          )}
        ).catch(error => {
            console.log("An error has occured");
            throw error;
        })
    );
        
});

//handle fetch event 
self.addEventListener('fetch', event => {
    console.log(`Request of ${event.request.url}`);


    //APIs specific data caching method 
    if(event.request.url.includes("/api/")) {
        //Cache Update Refresh data caching method
        console.log("doesn't contains api/ route");
        event.respondWith(caches.match(event.request));
        event.waitUntil(update(event.request).then(refresh))
    } else {
        //first cache strategy
        event.respondWith(
            caches
                .match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    console.log('No catch corresponding to the request');

                    //refetch
                    return fetch(event.request)
                        .then(response => {
                            console.log('network response is : ' ,response);
                            return response;
                        }).catch(error => {
                            console.log('network connection failed');
                            throw error;
                        });
                        
                }).catch(error => {
                    console.log('An error has occured');
                    throw error;
                })
                
        )
    }
})
