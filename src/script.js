import { u, urlMenager_get } from "./urlMenager.js";
import { collapse } from "./marker.js";
import { swiping } from "./swipe.js";
import { geolocation_init } from "./geolocation.js";
import { map, markerCircle, map_init } from "./map.js";
import { displayPlace, init_placeinfo, currentPlace, currentPlaceDat } from "./placeinfo.js";
import { updateUserPos, init_mainmenu } from "./mainmenu.js";

const places = await fetch("./PLACES/data.json").then((res) => res.json());

// init all submodules
// TODO: remove this lol
init_placeinfo(places, markerCircle);
urlMenager_get(places, displayPlace);
const userPosMarker = geolocation_init(map, updateUserPos);
map_init(places, collapse, currentPlace);
init_mainmenu(places, userPosMarker);

// load current place
u(window.location.hash);
if (currentPlace) map.setView(new L.LatLng(currentPlaceDat.lat, currentPlaceDat.lon), 19);

// rerender map when it's size changes
new ResizeObserver((entries) => entries.forEach(() => map.invalidateSize())).observe(document.getElementById("map"));

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

if (new URLSearchParams(window.location.search).get("unlockAll") == "true") {
  unlockAll();
}
