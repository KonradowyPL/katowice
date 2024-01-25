var map = L.map("map").setView([51.505, -0.09], 13);
var UserPosition;
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
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

const localisationUpdateInterval = setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    UserPosition = position;
    (userPosMarker = L.marker([UserPosition.coords.latitude, UserPosition.coords.longitude])), { icon: userPosIcon }.addTo(map);
  }, localisationError);
}, 5000);

navigator.geolocation.getCurrentPosition((position) => {
  map.setView([position.coords.latitude, position.coords.longitude]);
  UserPosition = position;
  userPosMarker = L.marker([UserPosition.coords.latitude, UserPosition.coords.longitude], { icon: userPosIcon }).addTo(map);
}, localisationError);
