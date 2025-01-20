import { map, userPosMarker } from "./map.js";
import { updateUserPos as _updateUserPos } from "./mainmenu.js";

userPosMarker.setOpacity(0);
userPosMarker.options.interactive = false;

const updateUserPos = (position) => {
  locationBox.style.display = "none";
  const UserPosition = position;
  var newLatLng = new L.LatLng(UserPosition?.coords?.latitude, UserPosition?.coords?.longitude);
  userPosMarker.setLatLng(newLatLng);
  userPosMarker.setOpacity(1);
  userPosMarker.options.interactive = true;

  _updateUserPos();
};

const localisationError = () => {
  locationBox.style.display = "flex";
  userPosMarker.setOpacity(0);
  userPosMarker.options.interactive = false;
};

navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
  permissionStatus.onchange = () => {
    navigator.geolocation.clearWatch(localisationUpdateInterval);
    localisationUpdateInterval = navigator.geolocation.watchPosition(updateUserPos, localisationError);
  };
});

var localisationUpdateInterval = navigator.geolocation.watchPosition(updateUserPos, localisationError);

navigator.geolocation.getCurrentPosition((position) => {
  map.setView([position.coords.latitude, position.coords.longitude]);
  updateUserPos(position);
}, localisationError);
