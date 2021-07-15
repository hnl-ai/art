const map = L.map('map').setView([21.4389, -158.0001], 11);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  minZoom: 11,
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoibG92ZW1pbGt0ZWEiLCJhIjoiY2swcGFtb3JzMDhoMDNkcGE5NW9ueGh6aSJ9.OryBJxboTqlp_lmrUyTD1g'
}).addTo(map);

fetch('https://data.honolulu.gov/api/resource/yef5-h88r.json')
  .then((res) => res.json())
  .then((data) => {
    fetch('art.json')
      .then((res) => res.json())
      .then((art) => {
        const artMap = {};
        for (const artPiece of art) {
          if (typeof artPiece.images === 'string') {
            artPiece.images = JSON.parse(artPiece.images);
          }
          artMap[artPiece.title] = artPiece;
        }

        let i = 0;
        const markers = L.markerClusterGroup();
        for (const artPiece of data) {
          let icon;
          if (artPiece.title && artMap[artPiece.title]) {
            artPiece.extraProperties = artMap[artPiece.title];
            icon = L.icon({
              iconUrl: artPiece.extraProperties.images[0],
              iconSize: [32, 32]
            });
          }

          const marker = L.marker([artPiece.latitude, artPiece.longitude], {
            ordinal: i
          });
          if (icon) {
            marker.setIcon(icon);
          }
          marker.on('click', (e) => {
            const { ordinal } = e.sourceTarget.options;
            const galleryScroll = $('#gallery-scroll');
            const scrollTo = $(`#gallery-item-${ordinal}`);

            galleryScroll.animate({
              scrollTop: scrollTo.offset().top - galleryScroll.offset().top + galleryScroll.scrollTop()
            });
          });
          markers.addLayer(marker);

          const galleryItem = $(`
          <div id="gallery-item-${i}" class="max-w-2xl bg-white border-2 border-gray-300 p-5 tracking-wide shadow-lg h-screen">
            <div class="flex">
              <div class="flex flex-col ml-5">
                <h4 class="text-xl font-semibold mb-2">${artPiece.title}</h4>
                <p class="text-gray-800 mt-2">${(artPiece.description.length > 512) ? artPiece.description.substr(0, 512 - 1) + '&hellip;' : artPiece.description}</p>
                  <div class="flex flex-wrap-reverse flex-row image-gallery" itemscope itemtype="http://schema.org/ImageGallery">
                  ${artPiece.extraProperties && artPiece.extraProperties.images && artPiece.extraProperties.images.map((e, i) => {
                return `<figure itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
                      <a href="${e}" itemprop="contentUrl" data-size="1024x1024">
                        <img class="p-2 w-24 h-24" src="${e}" itemprop="thumbnail" alt="Picture of ${artPiece.title} ${i}" />
                      </a>
                    </figure>`;
              }).join('\n')}
                  </div>
                <div class="flex flex-col mt-5">
                  <p><i>${artPiece.discipline}, ${artPiece.location}, ${artPiece.date}</i></p>
                  <p><i>${artPiece.credit || 'Unknown'}</i></p>
                </div>
                <div class="flex flex-row mt-5">
                  ${(artPiece.latitude && artPiece.longitude) ?
                    `<button onclick="map.setView([${artPiece.latitude}, ${artPiece.longitude}], 20);" class="inline-flex items-center justify-center w-10 h-10 mr-2 text-blue-100 transition-colors duration-150 bg-blue-700 rounded-lg focus:shadow-outline hover:bg-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <a target="_blank" href="https://maps.google.com/?q=${artPiece.latitude},${artPiece.longitude}">
                      <button class="inline-flex items-center justify-center w-10 h-10 mr-2 text-blue-100 transition-colors duration-150 bg-blue-700 rounded-lg focus:shadow-outline hover:bg-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </a>
                    ` : ''
                  }
                </div>
              </div>
            </div>
          </div>`);
          $('#galleryList').append(galleryItem);
          initPhotoSwipeFromDOM('.image-gallery');
          i += 1;
        }
        map.addLayer(markers);
      });

  });

var initPhotoSwipeFromDOM = function (gallerySelector) {

  // parse slide data (url, title, size ...) from DOM elements 
  // (children of gallerySelector)
  var parseThumbnailElements = function (el) {
    var thumbElements = el.childNodes,
      numNodes = thumbElements.length,
      items = [],
      figureEl,
      linkEl,
      size,
      item;

    for (var i = 0; i < numNodes; i++) {

      figureEl = thumbElements[i]; // <figure> element

      // include only element nodes 
      if (figureEl.nodeType !== 1) {
        continue;
      }

      linkEl = figureEl.children[0]; // <a> element

      size = linkEl.getAttribute('data-size').split('x');

      // create slide object
      item = {
        src: linkEl.getAttribute('href'),
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10)
      };



      if (figureEl.children.length > 1) {
        // <figcaption> content
        item.title = figureEl.children[1].innerHTML;
      }

      if (linkEl.children.length > 0) {
        // <img> thumbnail element, retrieving thumbnail url
        item.msrc = linkEl.children[0].getAttribute('src');
      }

      item.el = figureEl; // save link to element for getThumbBoundsFn
      items.push(item);
    }

    return items;
  };

  // find nearest parent element
  var closest = function closest(el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn));
  };

  // triggers when user clicks on thumbnail
  var onThumbnailsClick = function (e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var eTarget = e.target || e.srcElement;

    // find root element of slide
    var clickedListItem = closest(eTarget, function (el) {
      return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
    });

    if (!clickedListItem) {
      return;
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    var clickedGallery = clickedListItem.parentNode,
      childNodes = clickedListItem.parentNode.childNodes,
      numChildNodes = childNodes.length,
      nodeIndex = 0,
      index;

    for (var i = 0; i < numChildNodes; i++) {
      if (childNodes[i].nodeType !== 1) {
        continue;
      }

      if (childNodes[i] === clickedListItem) {
        index = nodeIndex;
        break;
      }
      nodeIndex++;
    }



    if (index >= 0) {
      // open PhotoSwipe if valid index found
      openPhotoSwipe(index, clickedGallery);
    }
    return false;
  };

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  var photoswipeParseHash = function () {
    var hash = window.location.hash.substring(1),
      params = {};

    if (hash.length < 5) {
      return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }
      var pair = vars[i].split('=');
      if (pair.length < 2) {
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  };

  var openPhotoSwipe = function (index, galleryElement, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
      gallery,
      options,
      items;

    items = parseThumbnailElements(galleryElement);

    // define options (if needed)
    options = {

      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function (index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
          pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      }

    };

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used 
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (var j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
  };

  // loop through all gallery elements and bind events
  var galleryElements = document.querySelectorAll(gallerySelector);

  for (var i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1);
    galleryElements[i].onclick = onThumbnailsClick;
  }

  // Parse URL and open gallery if it contains #&pid=3&gid=1
  var hashData = photoswipeParseHash();
  if (hashData.pid && hashData.gid) {
    openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
  }
};