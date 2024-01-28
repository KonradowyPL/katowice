const map = L.map("map").setView([51.505, -0.09], 14);
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

const userPosMarker = L.marker([51.5, -0.09], { icon: userPosIcon }).addTo(map);

const localisationError = () => alert("Please turn on localization to use app.");

updateUserPos = (position) => {
  UserPosition = position;
  var newLatLng = new L.LatLng(UserPosition.coords.latitude, UserPosition.coords.longitude);
  userPosMarker.setLatLng(newLatLng);
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
  const markerPopup = L.popup().setContent(`Odwiedź <b>${place.name}</b>, aby poznać o nim ciekawostki!`);
  const marker = L.marker([place.lat, place.lon], { icon: markers[place.icon] }).bindPopup(markerPopup).addTo(map);
  places[key].marker = marker;
  places[key].popup = markerPopup;
  marker.on("click", function () {
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

updateVisited();
