export { map, markerCircle, map_init };

const map = L.map("map", {
  tap: false,
  zoomDelta: 1,
  zoomSnap: 0,
}).setView([50.2661678296663, 19.02556763415931], 14);

const markerCircle = L.circleMarker([0, 0], {
  color: "#1d740b",
  fillColor: "#1d740b",
  fillOpacity: 0.5,
  radius: 17,
}).addTo(map);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 21,
  maxNativeZoom: 19,
  minZoom: 11,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

try {
  const mappos = JSON.parse(localStorage.getItem("map"));
  console.log("Loaded mappos:", mappos);
  map.setView([mappos.lat, mappos.lng], 14, { animate: false });
} catch (e) {
  console.error(e);
}

// add place icons to the map

const map_init = (places, collapse, currentPlace) => {
  places.forEach((place) => {
    const marker = L.marker([place.lat, place.lon], {
      icon: new L.divIcon({
        className: "place-marker",
        html: `<img src="./assets/${place.icon}.svg"><span>${place.name}</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, 0],
      }),
    }).addTo(map);
    place.marker = marker;
    marker.on("click", function () {
      window.location.hash = `#map:${place.id}`;
    });
  });

  map.on("zoomend", function (e) {
    collapse(places, map, currentPlace);
  });
  collapse(places, map, currentPlace);

  map.on("moveend", function (e) {
    localStorage.setItem("map", JSON.stringify(map.getCenter()));
  });
};
