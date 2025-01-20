import { u, urlMenager_get } from "./urlMenager.js";
import { loadRoutes } from "./routes.js";
import { collapse } from "./marker.js";
import { swiping } from "./swipe.js";
import { geolocation_init } from "./geolocation.js";
import { map, markerCircle, map_init } from "./map.js";
import { displayPlace, init_placeinfo, currentPlace, currentPlaceDat } from "./placeinfo.js";

const places = await fetch("./PLACES/data.json").then((res) => res.json());

const updateUserPos = () => {
  checkLocked();
  updateVisited();
  updateNonVisited();
  loadRoutes(places, userPosMarker.getLatLng());
};

init_placeinfo(places, markerCircle);
urlMenager_get(places, displayPlace);
const userPosMarker = geolocation_init(map, updateUserPos);
map_init(places, collapse, currentPlace);

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

u(window.location.hash);
if (currentPlace) map.setView(new L.LatLng(currentPlaceDat.lat, currentPlaceDat.lon), 19);



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
window.shareApp = shareApp;

new ResizeObserver((entries) => entries.forEach((entry) => map.invalidateSize())).observe(
  document.getElementById("map")
);

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

// hide loading screen
if (document.readyState !== "complete") {
  window.addEventListener("load", function () {
    console.info("Loading completed!");
    document.getElementById("loading").classList.add("fadeout");
  });
} else {
  document.getElementById("loading").classList.add("fadeout");
}

// unlock all easter egg
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
