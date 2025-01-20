export { updateUserPos };

import { loadRoutes } from "./routes.js";
import { places } from "./loader.js";
import { userPosMarker } from "./map.js";

// update icon size by css
menucontainer.onscroll = (e) => {
  appTitle.style.setProperty("--scale", Math.min(menucontainer.scrollTop / backgroundMapImage.clientHeight, 1));
};
menucontainer.onscroll();

// update whole menu
const updateUserPos = () => {
  checkLocked();
  updateVisited();
  updateNonVisited();
  loadRoutes(places, userPosMarker.getLatLng());
};

function updateVisited() {
  var ele = "";
  places.forEach((place, i) => {
    if (place?.unlocked) {
      ele += `<li><a href="#map:${place.id}&">${place.name}</a></li>`;
    }
  });
  visited.innerHTML = ele;
}

// "Miejsca, o których możesz nie wiedzieć"
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

function loadLocked() {
  var unlocked = JSON.parse(localStorage.getItem("unlocked")) || [];
  unlocked.forEach((e) => {
    var place = places.find((place) => place.id == e);
    if (place) place.unlocked = true;
  });
}

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

window.shareApp = async () => {
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

loadLocked();
updateUserPos();
