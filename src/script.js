import { u, urlMenager_get } from "./urlMenager.js";
import { loadRoutes } from "./routes.js";
import { collapse } from "./marker.js";
import { swiping } from "./swipe.js";
import { geolocation_init } from "./geolocation.js";
import { map, markerCircle, map_init } from "./map.js";

const places = await fetch("./PLACES/data.json").then((res) => res.json());

const updateUserPos = () => {
  checkLocked();
  updateVisited();
  updateNonVisited();
  loadRoutes(places, userPosMarker.getLatLng());
};

urlMenager_get(places, displayPlace);
const userPosMarker = geolocation_init(map, updateUserPos);
map_init(places);

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
    ...place.img.map((image) => {
      const img = document.createElement("img");
      img.setAttribute("src", image.src);
      img.setAttribute("width", image.width);
      img.setAttribute("height", image.height);
      img.onclick = () => displayImage(image.src);
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

u(window.location.hash);
if (currentPlace) map.setView(new L.LatLng(currentPlaceDat.lat, currentPlaceDat.lon), 19);


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
});

if (document.readyState !== "complete") {
  window.addEventListener("load", function () {
    console.info("Loading completed!");
    document.getElementById("loading").classList.add("fadeout");
  });
} else {
  document.getElementById("loading").classList.add("fadeout");
}
