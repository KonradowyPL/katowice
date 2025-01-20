import { currentPlace, currentPlaceDat } from "./placeinfo.js";
import { userPosMarker } from "./map.js";
import { places } from "./loader.js";
import { u } from "./urlMenager.js";
import { map } from "./map.js";
import "./mainmenu.js";
import "./marker.js";
import "./swipe.js";

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
