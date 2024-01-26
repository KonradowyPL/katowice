var map = L.map("map").setView([51.505, -0.09], 14);
var UserPosition;

var converter = new showdown.Converter({
    emoji: true,
    noHeaderId: true,
    omitExtraWLInCodeBlocks: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
    strikethrough: true,
    tables: true,
    underline: true,
  }),
  text = "# hello, markdown!",
  html = converter.makeHtml(text);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  minZoom: 14,
}).addTo(map);

var userPosIcon = new L.Icon({
  iconUrl: "./userPos.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var userPosMarker = L.marker([51.5, -0.09], { icon: userPosIcon }).addTo(map);

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

tooltipsSwipeButton.ontouchstart = (e) => {
  swipingStart = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight;
  swiping = true;
};

document.ontouchend = (e) => {
  if (swiping) {
    const height = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight;

    tooltips.style.height = height > swipingStart ? "90%" : "20%";
    tooltips.style.transition = "300ms";
  }

  swiping = false;
};
document.ontouchmove = (e) => {
  if (swiping) {
    const height = 1 - e.changedTouches[0].clientY / document.documentElement.scrollHeight;
    tooltips.style.transition = "0ms";
    tooltips.style.height = Math.max(height * 100, 10) + "%";
  }
};
