import { userPosIcon } from "./markers.js";
import { u, urlMenager_get } from "./urlMenager.js";
import { loadRoutes } from "./routes.js";
import { collapse } from "./marker.js";

const places = await fetch("./PLACES/data.json").then((res) => res.json());

urlMenager_get(places, displayPlace);

const map = L.map("map", {
  tap: false,
  zoomDelta: 1,
  zoomSnap: 0,
}).setView([50.2661678296663, 19.02556763415931], 14);

var UserPosition;

try {
  const mappos = JSON.parse(localStorage.getItem("map"));
  console.log(mappos);
  map.setView([mappos.lat, mappos.lng], 14, { animate: false });
} catch (e) {
  console.error(e);
}

const markerCircle = L.circleMarker([0, 0], {
  color: "#1d740b",
  fillColor: "#1d740b",
  fillOpacity: 0.5,
  radius: 17,
}).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 21,
  maxNativeZoom: 19,
  minZoom: 11,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const userPosMarker = L.marker([50.2661678296663, 19.02556763415931], {
  icon: userPosIcon,
})
  .setZIndexOffset(9999999)
  .addTo(map);
userPosMarker.setOpacity(0);
userPosMarker.options.interactive = false;

const localisationError = () => {
  locationBox.style.display = "flex";
  userPosMarker.setOpacity(0);
  userPosMarker.options.interactive = false;
};

const updateUserPos = (position) => {
  locationBox.style.display = "none";
  UserPosition = position;
  var newLatLng = new L.LatLng(UserPosition?.coords?.latitude, UserPosition?.coords?.longitude);
  userPosMarker.setLatLng(newLatLng);
  userPosMarker.setOpacity(1);
  userPosMarker.options.interactive = true;
  checkLocked();
  updateVisited();
  updateNonVisited();
  loadRoutes(places, userPosMarker.getLatLng());
};

var localisationUpdateInterval = navigator.geolocation.watchPosition(updateUserPos, localisationError);

navigator.geolocation.getCurrentPosition((position) => {
  map.setView([position.coords.latitude, position.coords.longitude]);
  updateUserPos(position);
}, localisationError);

var swiping = false;
var swipingStart;
var swipingFix;
var tabswiping = false;

tooltipsSwipeButton.onmousedown = (e) => {
  swipingStart = 1 - e.clientY / document.documentElement.scrollHeight;
  swipingFix = swipingStart - parseFloat(tooltips.style.height) * 0.01;
  swiping = true;
};

tooltipsSwipeButton.ontouchstart = (e) => {
  swipingStart = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight;
  swipingFix = swipingStart - parseFloat(tooltips.style.height) * 0.01;
  swiping = true;
};

tooltips.ontouchmove = (e) => {
  if (placeData.scrollTop == 0 && !swiping) {
    swiping = true;
    tabswiping = true;
    swipingStart = e.changedTouches[0].clientY / document.documentElement.scrollHeight;
    swipingFix = 1 - parseFloat(tooltips.style.height) * 0.01 - swipingStart;
  }
};

document.onmouseup = (e) => f(e.clientY);
document.ontouchend = (e) => f(e.changedTouches[0].clientY);

const f = (h) => {
  if (swiping) {
    const height = 1 - h / document.documentElement.scrollHeight - swipingFix;
    if (height > 0.1) {
      tooltips.style.transition = "300ms";

      if (height >= swipingStart) {
        tooltips.style.height = "90%";
      } else {
        tooltips.style.height = "10%";
        placeData.scrollTop = 0;

        window.location.hash = "#map";
      }
    } else {
      tooltips.style.height = "0%";
      tooltips.style.transition = "100ms";
      window.location.hash = "#map";
    }
  }

  swiping = false;
  tabswiping = false;
};

document.onmousemove = (e) => {
  if (swiping) {
    const height = 1 - e.clientY / document.documentElement.scrollHeight - swipingFix;
    tooltips.style.transition = "0ms";
    tooltips.style.height = height * 100 + "%";
    placeData.scrollTop = 0;
  }
};

document.ontouchmove = (e) => {
  if (swiping) {
    var height = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight - swipingFix;
    if (tabswiping) {
      if (height > 0.9) {
        height = 0.9;
      } else {
        placeData.scrollTop = 0;
      }
    }
    tooltips.style.transition = "0ms";
    tooltips.style.height = height * 100 + "%";
  }
};

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

var currentPlace = "";
var currentPlaceDat = "";

async function displayPlace(key, move) {
  placeData.scrollTop = 0;
  const placeDat = places.find((place) => place.id == key);
  currentPlace = key;
  currentPlaceDat = placeDat;

  document.title = `${placeDat.name} - Ciekawe Katowice`;
  tooltips.style.height = "90%";
  tooltips.style.transition = "300ms";

  markerCircle.setLatLng([placeDat.lat, placeDat.lon]);
  if (move) map.setView([placeDat.lat, placeDat.lon], 19);

  placeName.innerHTML = placeDat.name;
  placeContact.innerHTML = "";
  placeSummary.innerHTML = "";
  placeImages.innerHTML = "";
  placeShort.innerHTML = "";
  placeInfo.innerHTML =
    "<div class='loading_title'>Ładowawnie...</div><div class='loading_spinner'><i class='bi bi-arrow-clockwise'></i></div>";

  const res = await fetch(`./PLACES/${key}.json`);
  const place = await res.json();

  placeImages.innerHTML = "";
  placeImages.append(
    ...place.img.map((src) => {
      const img = document.createElement("img");
      img.setAttribute("src", src);
      img.onclick = () => displayImage(src);
      return img;
    })
  );
  var contact = "";
  {
    if (place.website) {
      contact += `<a href="${place.website}" target="_blank"><i class="bi bi-globe2"></i></a>`;
    }
    if (place.phone) {
      contact += `<a href="tel:${place.phone}" target="_blank"><i class="bi bi-telephone"></i></a>`;
    }
    if (place.email) {
      contact += `<a href="mailto:${place.email}" target="_blank"><i class="bi bi-envelope-at"></i></a>`;
    }
    if (place.wikipedia) {
      contact += `<a href="${place.wikipedia}" target="_blank"><i class="bi bi-wikipedia"></i></a>`;
    }
    contact += `<a href="https://osm.org/directions?to=${placeDat.lat}%2C${placeDat.lon}#map=19/${placeDat.lat}/${placeDat.lon}" target="_blank"><i class="bi bi-geo-alt"></a>`;
  }
  placeContact.innerHTML = contact;
  placeShort.innerHTML = place.short;
  placeSummary.innerHTML = place.summary;
  placeInfo.innerHTML = placeDat.unlocked
    ? place.discreption + "<br>"
    : "<div class='locked'>Odwiedź to miejsce aby dowiedzieć się więcej!</div>";
}

menucontainer.onscroll = (e) => {
  appTitle.style.setProperty("--scale", Math.min(menucontainer.scrollTop / backgroundMapImage.clientHeight, 1));
};
menucontainer.onscroll();

function updateVisited() {
  var ele = "";
  places.forEach((place, i) => {
    if (place?.unlocked) {
      ele += `<li><a href="#map:${place.id}&">${place.name}</a></li>`;
    }
  });
  visited.innerHTML = ele;
}

function updateNonVisited() {
  var ele = "";
  const distances = [];
  places.forEach((place) => {
    if (!place?.unlocked) {
      const userPos = userPosMarker.getLatLng();
      const markerPos = place.marker.getLatLng();
      const distance = userPos.distanceTo(markerPos);
      distances.push({ id: place.id, distance });
    }
  });
  distances.sort((a, b) => a.distance - b.distance);

  for (let i = 0; i < Math.min(4, distances.length); i++) {
    const dst = distances[i];
    const place = places.find((place) => place.id == dst.id);
    const distance = dst.distance;
    var roundedDistance;
    if (distance > 1000) {
      roundedDistance = (distance / 1000).toFixed(1) + " km";
    } else {
      roundedDistance = (distance / 20).toFixed(0) * 20 + " m";
    }

    ele += `<li><a href="#map:${dst.id}&"><span>${place.name}</span><span>${roundedDistance}</span></a></li>`;
  }

  nonVisited.innerHTML = ele;
}
loadLocked();
loadRoutes(places, userPosMarker.getLatLng());
updateVisited();
updateNonVisited();

function checkLocked() {
  places.forEach((place) => {
    if (place?.locked) {
      const userPos = userPosMarker.getLatLng();
      const markerPos = place.marker.getLatLng();
      const distance = userPos.distanceTo(markerPos);

      if (distance < 200) {
        place.locked = false;
        var unlocked = JSON.parse(localStorage.getItem("unlocked")) || [];
        unlocked.push(key);
        localStorage.setItem("unlocked", JSON.stringify(unlocked));
      }
    }
  });
}

function loadLocked() {
  var unlocked = JSON.parse(localStorage.getItem("unlocked")) || [];
  unlocked.forEach((e) => {
    var place = places.find((place) => place.id == e);
    if (place) place.unlocked = true;
  });
}
{
  u(window.location.hash);
  if (currentPlace) map.setView(new L.LatLng(currentPlaceDat.lat, currentPlaceDat.lon), 19);
}
const unlockAll = function () {
  let unlocked = Object.keys(places);
  localStorage.setItem("unlocked", JSON.stringify(unlocked));
};

var counter = 0;
dev.onclick = (e) => {
  counter++;

  if (counter > 6) {
    alert("unlocked all!");
    counter = -2137;
    unlockAll();
    loadLocked();
    checkLocked();
    updateNonVisited();
    updateVisited();
    loadRoutes(places, userPosMarker.getLatLng());
  }

  setTimeout(() => counter--, 5000);
};

const share = async () => {
  const shareData = {
    title: currentPlaceDat.name,
    text: `Odwiedź ${currentPlaceDat?.name2 || currentPlaceDat.name} i inne ciekawe miejsca w katowicach!`,
    url: window.location.href.replace(/[\?#].*$/, "") + "#map:" + currentPlace,
  };
  try {
    await navigator.share(shareData);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

const shareApp = async () => {
  const shareData = {
    title: "Ciekawe Katowice - Zanurz się w historii",
    text: `Odwiedź ciekawe miejsca w katowicach!`,
    url: window.location.href.replace(/[\?#].*$/, ""),
  };
  try {
    await navigator.share(shareData);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};
window.share = share;
window.shareApp = shareApp;

new ResizeObserver((entries) => entries.forEach((entry) => map.invalidateSize())).observe(
  document.getElementById("map")
);

navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
  permissionStatus.onchange = () => {
    navigator.geolocation.clearWatch(localisationUpdateInterval);
    localisationUpdateInterval = navigator.geolocation.watchPosition(updateUserPos, localisationError);
  };
});

if (new URLSearchParams(window.location.search).get("unlockAll") == "true") {
  unlockAll();
}

function displayImage(src) {
  imagePreview.innerHTML = "";
  const img = document.createElement("img");
  img.src = src;
  imagePreview.append(img);
}
imagePreview.onclick = (e) => {
  if (e.target == imagePreview) imagePreview.innerHTML = "";
};

map.on("zoomend", function (e) {
  collapse(places, map, currentPlace);
});
collapse(places, map, currentPlace);

map.on("moveend", function (e) {
  localStorage.setItem("map", JSON.stringify(map.getCenter()));
  console.log(localStorage.getItem("map"));
});
