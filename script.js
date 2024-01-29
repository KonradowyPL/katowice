const map = L.map("map").setView([50.2661678296663, 19.02556763415931], 14);
var UserPosition;

const converter = new showdown.Converter({
  smartIndentationFix: true,
  emoji: true,
  noHeaderId: true,
  parseImgDimensions: true,
  strikethrough: true,
  tables: true,
  underline: true,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  minZoom: 11,
}).addTo(map);

const userPosMarker = L.marker([50.2661678296663, 19.02556763415931], { icon: userPosIcon }).addTo(map);

const localisationError = () => alert("Please turn on localization to use app.");

updateUserPos = (position) => {
  UserPosition = position;
  var newLatLng = new L.LatLng(UserPosition.coords.latitude, UserPosition.coords.longitude);
  userPosMarker.setLatLng(newLatLng);
  checkLocked();
  updateNonVisited();
  updateVisited();
  loadRoutes();
};

// update user pos every 5s
const localisationUpdateInterval = setInterval(() => {
  navigator.geolocation.getCurrentPosition(updateUserPos, localisationError);
}, 5000);

navigator.geolocation.getCurrentPosition((position) => {
  map.setView([position.coords.latitude, position.coords.longitude]);
  updateUserPos(position);
}, localisationError);

var swiping = false;
var swipingStart;
var swipingFix;

tooltipsSwipeButton.ontouchstart = (e) => {
  swipingStart = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight;
  swipingFix = swipingStart - parseFloat(tooltips.style.height) * 0.01;
  swiping = true;
};

document.ontouchend = (e) => {
  if (swiping) {
    const height = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight;

    if (height > 0.1) {
      tooltips.style.transition = "300ms";

      if (height > swipingStart) {
        tooltips.style.height = "90%";
      } else {
        tooltips.style.height = "10%";
        placeInfo.scrollTop = 0;
      }
    } else {
      tooltips.style.height = "0%";
      tooltips.style.transition = "100ms";
    }
  }

  swiping = false;
};

document.ontouchmove = (e) => {
  if (swiping) {
    const height = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight - swipingFix;
    tooltips.style.transition = "0ms";
    tooltips.style.height = height * 100 + "%";
  }
};

for (let [key, place] of Object.entries(places)) {
  const markerPopup = L.popup().setContent(`Odwiedź <b>${place?.name2 || place.name}</b>, aby poznać o ${place?.nn || "nim"} ciekawostki!`);
  const marker = L.marker([place.lat, place.lon], { icon: markers[place.icon] }).bindPopup(markerPopup).addTo(map);
  places[key].marker = marker;
  places[key].popup = markerPopup;
  marker.on("click", function () {
    silent = true;
    window.location.hash = `#map:${key}`;
    displayPlace(key);
  });
}

function displayPlace(key) {
  if (places[key]?.locked) {
    places[key].marker.openPopup();
  } else {
    places[key].marker.closePopup();
    placeInfo.innerHTML = converter.makeHtml(places[key].discreption);
    tooltips.style.height = "90%";
    tooltips.style.transition = "300ms";
  }
}

menucontainer.onscroll = (e) => {
  appTitle.style.setProperty("--scale", Math.min(menucontainer.scrollTop / backgroundMapImage.clientHeight, 1));
};

function updateVisited() {
  var ele = "";
  Object.keys(places).forEach((key, i) => {
    const place = places[key];
    if (!place?.locked) {
      ele += `<li><a href="#map:${key}">${place.name}</a></li>`;
    }
  });
  visited.innerHTML = ele;
}

function updateNonVisited() {
  var ele = "";
  const distances = [];
  Object.keys(places).forEach((key, i) => {
    const place = places[key];
    if (place?.locked) {
      const userPos = userPosMarker.getLatLng();
      const markerPos = place.marker.getLatLng();
      const distance = userPos.distanceTo(markerPos);
      distances.push({ name: key, distance });
    }
  });

  distances.sort((a, b) => a.distance - b.distance);

  for (let i = 0; i < Math.min(4, distances.length); i++) {
    const dst = distances[i];
    const place = places[dst.name];
    const distance = dst.distance;
    var roundedDistance;
    if (distance > 1000) {
      roundedDistance = (distance / 1000).toFixed(1) + " km";
    } else {
      roundedDistance = (distance / 20).toFixed(0) * 20 + " m";
    }

    ele += `<li><a href="#map:${dst.name}"><span>${place.name}</span><span>${roundedDistance}</span></a></li>`;
  }

  nonVisited.innerHTML = ele;
}
loadLocked();
loadRoutes();
updateVisited();

function checkLocked() {
  Object.keys(places).forEach((key, i) => {
    const place = places[key];
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
    var place = places[e];
    if (place) {
      place.locked = false;
    }
  });
}

function loadRoutes() {
  ele = "";
  Object.keys(routes).forEach((key, i) => {
    const route = routes[key];
    let completed = 0;
    thisEle = "";
    toend = "";
    // ele += `<div class="route visited nonVisited"><div class="routeTitle">${route.name}</div><div class="routeDiscreption">${route.discreption}</div><ul>`;
    route.destonations.forEach((e) => {
      const place = places[e];
      if (place?.locked) {
        const userPos = userPosMarker.getLatLng();
        const markerPos = place.marker.getLatLng();
        const distance = userPos.distanceTo(markerPos);
        var roundedDistance;
        if (distance > 1000) {
          roundedDistance = (distance / 1000).toFixed(1) + " km";
        } else {
          roundedDistance = (distance / 20).toFixed(0) * 20 + " m";
        }

        thisEle += `<li><a href="#map:${e}"><span>${place.name}</span><span>${roundedDistance}</span></a></li>`;
      } else {
        toend += `<li><a href="#map:${e}"><span>${place.name}</span><span class="checkmark"></span></a></li>`;
        completed++;
      }
    });
    ele +=
      `<div class="route visited nonVisited"><div class="routeTitle"><span>${route.name}</span><span>${completed}/${route.destonations.length}</span></div><div class="routeDiscreption">${route.discreption}</div><ul>` +
      thisEle +
      toend +
      "</ul></div>";
  });

  routesObj.innerHTML = ele;
}

u(window.location.hash);

const unlockAll = function () {
  let unlocked = Object.keys(places);
  localStorage.setItem("unlocked", JSON.stringify(unlocked));
};
